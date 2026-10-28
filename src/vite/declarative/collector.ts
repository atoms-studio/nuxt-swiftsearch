import {
  NodeTypes,
  type DirectiveNode,
  type ElementNode,
  type TemplateChildNode,
} from "@vue/compiler-dom";
import { relative, sep } from "node:path";
import { normalizeExpression, UnhoistableExpressionError } from "./expression";
import {
  extractComponentProps,
  extractHierarchicalMenuProps,
  extractIndexProps,
  extractWidgetProps,
} from "./props";
import { normalizeComponentTag } from "./resolve";
import {
  findBoundAttribute,
  getControlFlow,
  getTagAttributeInsertIndex,
  indent,
  isIgnorableControlFlowSibling,
  parseForDirective,
  SYNTHETIC_LOOP_INDEX_ALIAS,
  toConditionalEntriesExpression,
} from "./template";
import {
  SWIFTSEARCH_FACTORY_NAME,
  SWIFTSEARCH_FACTORY_PREFIX,
  SWIFTSEARCH_ID_PREFIX_ATTR,
  type ConditionalBranch,
  type ControlFlow,
  type DiscoveryContext,
  type ExtractedProps,
  type GenerationContext,
  type ResolvedComponentFile,
  type WidgetConfig,
} from "./types";
import { normalizeAisTag, WIDGET_COMPONENTS } from "./widgets";

export const RENDER_LIST_ALIAS = "__swiftsearchRenderList";

// Framework components that never render Ais widgets from another file.
const FRAMEWORK_COMPONENT_TAGS = new Set([
  "Transition",
  "TransitionGroup",
  "KeepAlive",
  "Suspense",
  "Teleport",
  "ClientOnly",
  "DevOnly",
  "ServerPlaceholder",
  "NuxtClientFallback",
  "NuxtErrorBoundary",
  "NuxtImg",
  "NuxtLayout",
  "NuxtLink",
  "NuxtLoadingIndicator",
  "NuxtPage",
  "NuxtPicture",
  "RouterLink",
  "RouterView",
]);

const DYNAMIC_WIDGET_TAGS = new Set(["AisDynamicWidgets", "AisExperimentalDynamicWidgets"]);
const LOOP_UNSUPPORTED_TAGS = new Set(["AisIndex", ...DYNAMIC_WIDGET_TAGS]);
const PREFIX_GUARD = `$attrs['${SWIFTSEARCH_ID_PREFIX_ATTR}']`;

const looksLikeComponentTag = (tag: string) =>
  /^[A-Z]/.test(tag) || /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(tag);

const isBridgeCandidate = (element: ElementNode) =>
  looksLikeComponentTag(element.tag) &&
  !FRAMEWORK_COMPONENT_TAGS.has(normalizeComponentTag(element.tag)) &&
  !normalizeAisTag(element.tag).startsWith("Ais");

const useComposableAlias = (composable: string, context: GenerationContext) => {
  context.usedComposables.add(composable);

  const existing = context.aliasByComposable.get(composable);
  if (existing) return existing;

  const alias = `__swiftsearch${composable.charAt(0).toUpperCase()}${composable.slice(1)}`;
  context.aliasByComposable.set(composable, alias);
  return alias;
};

const skipNode = (context: GenerationContext, tag: string, reason: string) => {
  context.skipped.push({ tag, reason });
};

// Runs one node's expression work. When an expression reads state that cannot
// move into a widget factory, skips the node and returns undefined.
const hoist = <T>(context: GenerationContext, tag: string, run: () => T): T | undefined => {
  try {
    return run();
  } catch (error) {
    if (!(error instanceof UnhoistableExpressionError)) throw error;
    skipNode(
      context,
      tag,
      `expression uses component-local state \`${error.identifier}\`; widget factories run at module scope, so pass the value in as a prop or import it`,
    );
    return undefined;
  }
};

const insertAttribute = (element: ElementNode, content: string, context: GenerationContext) => {
  const index = getTagAttributeInsertIndex(element, context.templateOffset);
  if (index !== null) context.edits.push({ start: index, content });
};

// Creates the next generated id, written once for the factory call and once
// for the template element. Inside a loop, both get the per-iteration suffix.
const generateId = (context: GenerationContext) => {
  const ordinal = ++context.idCounter;
  const suffix = (side: "template" | "factory") =>
    context.loop ? `-\${${context.loop.idSuffix[side]}}` : "";

  if (context.provider) {
    // The parent sends the per-instance prefix as a factory argument and as an
    // attribute. Without the attribute, the component keeps its default id.
    return {
      factoryArg: `\`\${${SWIFTSEARCH_FACTORY_PREFIX}}-${ordinal}${suffix("factory")}\``,
      templateAttr: (name: string) =>
        ` :${name}="${PREFIX_GUARD} != null ? \`\${${PREFIX_GUARD}}-${ordinal}${suffix("template")}\` : undefined"`,
    };
  }

  const base = `swiftsearch-${context.rootIndex}-${ordinal}`;
  if (!context.loop) {
    return {
      factoryArg: JSON.stringify(base),
      templateAttr: (name: string) => ` ${name}="${base}"`,
    };
  }
  return {
    factoryArg: `\`${base}${suffix("factory")}\``,
    templateAttr: (name: string) => ` :${name}="\`${base}${suffix("template")}\`"`,
  };
};

type WidgetIdResolution =
  | { kind: "none" }
  | { kind: "ok"; arg: string }
  | { kind: "duplicate" }
  | { kind: "unsupported"; reason: string };

const resolveWidgetIdArg = (
  widgetConfig: WidgetConfig,
  element: ElementNode,
  props: ExtractedProps,
  context: GenerationContext,
): WidgetIdResolution => {
  if (!widgetConfig.usesId) return { kind: "none" };

  if (!props.idExpr) {
    const id = generateId(context);
    insertAttribute(element, id.templateAttr("id"), context);
    return { kind: "ok", arg: id.factoryArg };
  }

  if (context.loop && props.idIsStatic) {
    return {
      kind: "unsupported",
      reason:
        "a static id inside v-for would be shared by every iteration; use a dynamic :id derived from the loop item",
    };
  }

  if (context.provider && props.idIsStatic) {
    context.notices.push(
      `static id ${props.idExpr} on <${element.tag}> is shared across all instances of this component; use a dynamic :id if instances must not share state`,
    );
  }

  const dedupeKey = `${widgetConfig.composable}::${context.loop?.sourceCode ?? ""}::${props.idExpr}`;
  if (context.seenExplicitIds.has(dedupeKey)) return { kind: "duplicate" };
  context.seenExplicitIds.add(dedupeKey);
  return { kind: "ok", arg: props.idExpr };
};

const collectWidget = (
  element: ElementNode,
  tag: string,
  widgetConfig: WidgetConfig,
  context: GenerationContext,
): string[] => {
  const extract = tag === "AisHierarchicalMenu" ? extractHierarchicalMenuProps : extractWidgetProps;
  const props = hoist(context, tag, () => extract(element, context));
  if (!props) return [];
  if (props.invalidReason) {
    skipNode(context, tag, props.invalidReason);
    return [];
  }

  const id = resolveWidgetIdArg(widgetConfig, element, props, context);
  if (id.kind === "unsupported") {
    skipNode(context, tag, id.reason);
    return [];
  }

  const alias = useComposableAlias(widgetConfig.composable, context);
  const args = id.kind === "ok" ? `${props.paramsExpr}, ${id.arg}` : props.paramsExpr;
  const calls = id.kind === "duplicate" ? [] : [`${alias}(${args})`];

  // Widgets inside a dynamic-widgets slot register on the same parent index.
  return DYNAMIC_WIDGET_TAGS.has(tag)
    ? [...calls, ...collectWidgets(element.children, context)]
    : calls;
};

const collectIndex = (element: ElementNode, context: GenerationContext): string[] => {
  const props = hoist(context, "AisIndex", () => extractIndexProps(element, context));
  if (!props) return [];
  if (props.invalidReason) {
    skipNode(context, "AisIndex", props.invalidReason);
    return [];
  }

  // AisIndex starts a new index scope at runtime, so explicit ids reused
  // inside a different index are not duplicates of ones in the parent scope.
  const parentSeenExplicitIds = context.seenExplicitIds;
  context.seenExplicitIds = new Set();
  const nested = collectWidgets(element.children, context);
  context.seenExplicitIds = parentSeenExplicitIds;

  const alias = useComposableAlias("useAisIndex", context);
  const nestedArray = nested.length
    ? `[\n${nested.map((entry) => indent(entry, 2)).join(",\n")}\n]`
    : "[]";
  return [`${alias}(${props.paramsExpr}).addWidgets(${nestedArray})`];
};

const toImportSpecifier = (fromDir: string, filePath: string) => {
  const relativePath = relative(fromDir, filePath).split(sep).join("/");
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
};

const resolveProviderAlias = (filePath: string, discovery: DiscoveryContext) => {
  const existing = discovery.providerAliasByPath.get(filePath);
  if (existing) return existing;

  const alias = `__swiftsearchProvider${discovery.providerAliasByPath.size + 1}`;
  discovery.providerAliasByPath.set(filePath, alias);
  discovery.providerImports.push(
    `import { ${SWIFTSEARCH_FACTORY_NAME} as ${alias} } from "${toImportSpecifier(discovery.sourceDir, filePath)}";`,
  );
  return alias;
};

// A resolvable child component: import its generated widget factory and call
// it with the element's props and a per-instance id prefix. The template gets
// the same prefix through an attribute.
const collectComponentBridge = (
  element: ElementNode,
  resolved: ResolvedComponentFile,
  discovery: DiscoveryContext,
  context: GenerationContext,
): string[] => {
  // Slot content always belongs to the current file's scope.
  const collectSlot = () => collectWidgets(element.children, context);

  if (resolved.mode === "server") {
    context.notices.push(
      `<${element.tag}> is a server component; widgets inside it cannot be auto-discovered (server islands cannot receive client widget state). Move the widgets to a regular component or declare them on the root.`,
    );
    return collectSlot();
  }

  discovery.watchFiles.add(resolved.filePath);
  const analysis = discovery.analyzeChild(resolved.filePath, discovery.visited);
  analysis.watchFiles.forEach((file) => discovery.watchFiles.add(file));

  if (analysis.cyclic) {
    discovery.encounteredCycle = true;
    context.notices.push(
      `<${element.tag}> (${resolved.filePath}) creates a circular component reference; its widgets were not auto-discovered`,
    );
    return collectSlot();
  }

  if (!analysis.isProvider) return collectSlot();

  const props = hoist(context, element.tag, () => extractComponentProps(element, context));
  if (!props) return collectSlot();

  if (!props.hasSpread) {
    const missing = analysis.referencedProps.filter((name) => !props.passedProps.includes(name));
    if (missing.length) {
      context.notices.push(
        `<${element.tag}> does not pass prop(s) ${missing.map((name) => `\`${name}\``).join(", ")} that its widgets read; those widget params will be undefined`,
      );
    }
  }

  if (analysis.skipped.length) {
    context.notices.push(
      `<${element.tag}> (${resolved.filePath}) has ${analysis.skipped.length} widget(s) the transform could not hoist — see the warnings emitted for that file`,
    );
  }

  const alias = resolveProviderAlias(resolved.filePath, discovery);
  const prefix = generateId(context);
  insertAttribute(element, prefix.templateAttr(SWIFTSEARCH_ID_PREFIX_ATTR), context);

  return [`...${alias}(${props.paramsExpr}, ${prefix.factoryArg})`, ...collectSlot()];
};

const collectElementWidgets = (element: ElementNode, context: GenerationContext): string[] => {
  const tag = normalizeAisTag(element.tag);

  if (tag === "AisInstantSearch") return [];
  if (tag === "AisIndex") return collectIndex(element, context);

  const widgetConfig = WIDGET_COMPONENTS[tag];
  if (widgetConfig) return collectWidget(element, tag, widgetConfig, context);

  const { discovery } = context;
  const resolved = discovery && isBridgeCandidate(element) && discovery.resolveTag(element.tag);
  if (resolved) return collectComponentBridge(element, resolved, discovery, context);

  return collectWidgets(element.children, context);
};

const findLoopUnsupportedTag = (element: ElementNode): string | null => {
  const tag = normalizeAisTag(element.tag);
  if (LOOP_UNSUPPORTED_TAGS.has(tag)) return tag;

  for (const child of element.children) {
    if (child.type !== NodeTypes.ELEMENT) continue;
    const found = findLoopUnsupportedTag(child);
    if (found) return found;
  }

  return null;
};

const collectForElement = (
  element: ElementNode,
  forDirective: DirectiveNode,
  context: GenerationContext,
): string[] => {
  const tag = normalizeAisTag(element.tag);

  if (context.loop) {
    skipNode(context, tag, "nested v-for loops are not supported");
    return [];
  }

  const offendingTag = findLoopUnsupportedTag(element);
  if (offendingTag) {
    skipNode(
      context,
      offendingTag,
      "v-for over <AisIndex> or <AisDynamicWidgets> scopes is not supported",
    );
    return [];
  }

  const parsed = parseForDirective(forDirective);
  if ("reason" in parsed) {
    skipNode(context, tag, parsed.reason);
    return [];
  }

  // The loop source is evaluated outside the loop scope.
  const sourceCode = hoist(context, tag, () => normalizeExpression(parsed.rawSource, context));
  if (sourceCode === undefined) return [];

  // A `:key` gives ids that follow the item, so that a removed or moved item
  // does not change the ids (and the widget state) of the other items. The key
  // is written into a double-quoted attribute, so quotes and backticks fall back to the index.
  const keySource = findBoundAttribute(element, "key");
  const usableKey = keySource && !/["`]/.test(keySource) ? keySource : undefined;
  const positionAlias = parsed.keyAlias ?? (usableKey ? undefined : SYNTHETIC_LOOP_INDEX_ALIAS);
  const callbackParams = [parsed.valueAlias, positionAlias, parsed.indexAlias].filter(
    (param): param is string => param !== undefined,
  );

  // The key reads loop aliases, so it is normalized inside the loop scope.
  context.loop = {
    sourceCode,
    idSuffix: { template: "", factory: "" },
    localBindings: new Set(callbackParams),
  };

  const editsSnapshot = context.edits.length;
  let entries: string[] = [];
  try {
    if (usableKey) {
      const keyCode = hoist(context, tag, () => normalizeExpression(usableKey, context));
      if (keyCode === undefined) return [];
      context.loop.idSuffix = { template: usableKey, factory: keyCode };
    } else {
      context.loop.idSuffix = { template: positionAlias!, factory: positionAlias! };
    }

    entries = collectElementWidgets(element, context);
  } finally {
    context.loop = undefined;
  }

  if (!entries.length) {
    // Drop id edits that skipped descendants may have left behind.
    context.edits.length = editsSnapshot;
    return [];
  }

  if (!usableKey) {
    context.notices.push(
      `<${element.tag} v-for="${forDirective.exp!.loc.source}"> has no usable :key; widget ids follow item positions, so removing an item re-creates the widgets after it`,
    );
  }

  if (positionAlias === SYNTHETIC_LOOP_INDEX_ALIAS) {
    // Expose the index in the template, for the injected :id bindings.
    const exp = forDirective.exp!;
    context.edits.push({
      start: context.templateOffset + exp.loc.start.offset,
      end: context.templateOffset + exp.loc.end.offset,
      content: `(${parsed.valueAlias}, ${SYNTHETIC_LOOP_INDEX_ALIAS}) in ${parsed.rawSource}`,
    });
  }

  context.usesRenderList = true;
  return [
    `...${RENDER_LIST_ALIAS}(${sourceCode}, (${callbackParams.join(", ")}) => [\n${entries
      .map((entry) => indent(entry, 2))
      .join(",\n")}\n]).flat()`,
  ];
};

type ChainBranch = {
  element: ElementNode;
  flow: Extract<ControlFlow, { kind: "if" | "else-if" | "else" }>;
};

// Reads a v-if / v-else-if / v-else sibling chain that starts at `start`.
// Returns the branches and the index of the first child after the chain.
const readConditionalChain = (children: TemplateChildNode[], start: number) => {
  const first = children[start] as ElementNode;
  const branches: ChainBranch[] = [
    { element: first, flow: getControlFlow(first) as ChainBranch["flow"] },
  ];
  let end = start + 1;

  for (let cursor = start + 1; cursor < children.length; cursor++) {
    const candidate = children[cursor]!;
    if (candidate.type !== NodeTypes.ELEMENT) {
      if (isIgnorableControlFlowSibling(candidate)) continue;
      break;
    }

    const flow = getControlFlow(candidate);
    if (flow.kind !== "else-if" && flow.kind !== "else") break;

    branches.push({ element: candidate, flow });
    end = cursor + 1;
    if (flow.kind === "else") break;
  }

  return { branches, end };
};

const collectConditionalChain = (branches: ChainBranch[], context: GenerationContext): string[] => {
  const tag = normalizeAisTag(branches[0]!.element.tag);

  // Normalize every condition first: one unhoistable condition skips the whole
  // chain, because the remaining branches would change meaning without it.
  const conditions = hoist(context, tag, () =>
    branches.map(({ flow }) =>
      flow.kind === "else" ? undefined : normalizeExpression(flow.condition, context),
    ),
  );
  if (!conditions) return [];

  if (branches.some(({ flow }, index) => flow.kind !== "else" && !conditions[index])) {
    skipNode(context, tag, "v-if / v-else-if with an empty condition");
    return [];
  }

  const compiled: ConditionalBranch[] = branches.map(({ element, flow }, index) => ({
    kind: flow.kind,
    condition: conditions[index],
    entries: collectElementWidgets(element, context),
  }));

  if (compiled.every((branch) => !branch.entries.length)) return [];
  return [`...(${toConditionalEntriesExpression(compiled)})`];
};

export const collectWidgets = (
  children: TemplateChildNode[],
  context: GenerationContext,
): string[] => {
  const expressions: string[] = [];

  for (let index = 0; index < children.length; index++) {
    const child = children[index]!;
    if (child.type !== NodeTypes.ELEMENT) continue;

    const flow = getControlFlow(child);
    switch (flow.kind) {
      case "for-and-if":
        skipNode(
          context,
          normalizeAisTag(child.tag),
          "v-if and v-for on the same element is not supported; move the v-if to a wrapper <template>",
        );
        break;
      case "for":
        expressions.push(...collectForElement(child, flow.forDirective, context));
        break;
      case "if": {
        const chain = readConditionalChain(children, index);
        expressions.push(...collectConditionalChain(chain.branches, context));
        index = chain.end - 1;
        break;
      }
      case "else-if":
      case "else":
        skipNode(
          context,
          normalizeAisTag(child.tag),
          "v-else / v-else-if without a matching v-if in the same parent",
        );
        break;
      default:
        expressions.push(...collectElementWidgets(child, context));
    }
  }

  return expressions;
};

// Childless non-Ais components inside the root are likely wrappers whose own
// template the transform cannot scan. Reports them, so that missing widgets do
// not fail silently (issue #58). Tags that the bridge can resolve are excluded.
export const collectUnscannableComponentTags = (
  children: TemplateChildNode[],
  resolveTag?: (rawTag: string) => unknown,
): string[] => {
  const tags = new Set<string>();

  const visit = (nodes: TemplateChildNode[]) => {
    for (const child of nodes) {
      if (child.type !== NodeTypes.ELEMENT) continue;

      if (child.children.length) {
        visit(child.children);
      } else if (isBridgeCandidate(child) && !resolveTag?.(child.tag)) {
        tags.add(child.tag);
      }
    }
  };

  visit(children);
  return [...tags];
};
