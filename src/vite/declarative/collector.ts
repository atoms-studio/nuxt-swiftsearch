import { NodeTypes, type ElementNode, type TemplateChildNode } from "@vue/compiler-dom";
import { extractHierarchicalMenuProps, extractIndexProps, extractWidgetProps } from "./props";
import {
  getControlFlow,
  getTagAttributeInsertIndex,
  indent,
  isIgnorableControlFlowSibling,
  toConditionalEntriesExpression,
} from "./template";
import type { ConditionalBranch, GenerationContext, WidgetConfig } from "./types";
import { normalizeAisTag, WIDGET_COMPONENTS } from "./widgets";

const useComposableAlias = (composable: string, context: GenerationContext) => {
  context.usedComposables.add(composable);

  const existing = context.aliasByComposable.get(composable);
  if (existing) return existing;

  const alias = `__swiftsearch${composable.charAt(0).toUpperCase()}${composable.slice(1)}`;
  context.aliasByComposable.set(composable, alias);
  return alias;
};

type WidgetIdResolution = { kind: "none" } | { kind: "ok"; arg: string } | { kind: "duplicate" };

const resolveWidgetIdArg = (
  widgetConfig: WidgetConfig,
  element: ElementNode,
  idExpr: string | undefined,
  context: GenerationContext,
): WidgetIdResolution => {
  if (!widgetConfig.usesId) return { kind: "none" };

  if (idExpr) {
    const dedupeKey = `${widgetConfig.composable}::${idExpr}`;
    if (context.seenExplicitIds.has(dedupeKey)) {
      return { kind: "duplicate" };
    }
    context.seenExplicitIds.add(dedupeKey);
    return { kind: "ok", arg: idExpr };
  }

  const generatedId = `swiftsearch-${context.rootIndex}-${++context.idCounter}`;
  const insertIndex = getTagAttributeInsertIndex(element, context.templateOffset);
  if (insertIndex !== null) {
    context.edits.push({
      index: insertIndex,
      content: ` id="${generatedId}"`,
    });
  }
  return { kind: "ok", arg: JSON.stringify(generatedId) };
};

const buildWidgetCall = (
  composableAlias: string,
  paramsExpr: string,
  resolution: WidgetIdResolution,
): string | null => {
  if (resolution.kind === "duplicate") return null;
  const args = resolution.kind === "ok" ? [paramsExpr, resolution.arg] : [paramsExpr];
  return `${composableAlias}(${args.join(", ")})`;
};

const collectElementWidgets = (element: ElementNode, context: GenerationContext): string[] => {
  const tag = normalizeAisTag(element.tag);

  if (tag === "AisInstantSearch") {
    return [];
  }

  if (tag === "AisIndex") {
    const indexProps = extractIndexProps(element, context);

    if (!indexProps.hasIndexName) {
      context.unsupported = true;
      return [];
    }

    // AisIndex starts a new index scope at runtime, so explicit ids reused
    // inside a different index are not duplicates of ones in the parent scope.
    const parentSeenExplicitIds = context.seenExplicitIds;
    context.seenExplicitIds = new Set();
    const nested = collectWidgets(element.children, context);
    context.seenExplicitIds = parentSeenExplicitIds;
    if (context.unsupported) return [];

    const indexAlias = useComposableAlias("useAisIndex", context);
    const variableName = `__swiftsearchIndexWidget${context.rootIndex}_${++context.indexCounter}`;
    const nestedArray = nested.length
      ? `[
${nested.map((entry) => indent(entry, 6)).join(",\n")}
    ]`
      : "[]";

    return [
      `(() => {\n    const ${variableName} = ${indexAlias}(${indexProps.paramsExpr});\n    ${variableName}.addWidgets(${nestedArray});\n    return ${variableName};\n  })()`,
    ];
  }

  const widgetConfig = WIDGET_COMPONENTS[tag];
  if (widgetConfig) {
    const composableAlias = useComposableAlias(widgetConfig.composable, context);

    if (tag === "AisDynamicWidgets" || tag === "AisExperimentalDynamicWidgets") {
      const extractedProps = extractWidgetProps(element, context);
      const resolution = resolveWidgetIdArg(widgetConfig, element, extractedProps.idExpr, context);
      const nestedWidgets = collectWidgets(element.children, context);

      if (context.unsupported) {
        return [];
      }

      const call = buildWidgetCall(composableAlias, extractedProps.paramsExpr, resolution);
      return call !== null ? [call, ...nestedWidgets] : nestedWidgets;
    }

    if (tag === "AisHierarchicalMenu") {
      const extractedProps = extractHierarchicalMenuProps(element, context);
      if (!extractedProps.hasAttributes) {
        context.unsupported = true;
        return [];
      }

      const resolution = resolveWidgetIdArg(widgetConfig, element, extractedProps.idExpr, context);
      const call = buildWidgetCall(composableAlias, extractedProps.paramsExpr, resolution);
      return call !== null ? [call] : [];
    }

    const extractedProps = extractWidgetProps(element, context);
    const resolution = resolveWidgetIdArg(widgetConfig, element, extractedProps.idExpr, context);
    const call = buildWidgetCall(composableAlias, extractedProps.paramsExpr, resolution);
    return call !== null ? [call] : [];
  }

  if (element.children.length) {
    return collectWidgets(element.children, context);
  }

  return [];
};

export const collectWidgets = (
  children: TemplateChildNode[],
  context: GenerationContext,
): string[] => {
  const expressions: string[] = [];

  for (let index = 0; index < children.length; index++) {
    const child = children[index]!;
    if (child.type !== NodeTypes.ELEMENT) continue;

    const element = child as ElementNode;
    const controlFlow = getControlFlow(element, context);

    if (controlFlow.kind === "for") {
      context.unsupported = true;
      return expressions;
    }

    if (controlFlow.kind === "if") {
      const branches: ConditionalBranch[] = [];
      let cursor = index;

      while (cursor < children.length) {
        const candidate = children[cursor]!;

        if (candidate.type !== NodeTypes.ELEMENT) {
          if (isIgnorableControlFlowSibling(candidate)) {
            cursor++;
            continue;
          }

          break;
        }

        const branchElement = candidate as ElementNode;
        const branchFlow = getControlFlow(branchElement, context);

        if (branchFlow.kind === "for") {
          context.unsupported = true;
          return expressions;
        }

        const isFirstBranch = branches.length === 0;
        const validBranch = isFirstBranch
          ? branchFlow.kind === "if"
          : branchFlow.kind === "else-if" || branchFlow.kind === "else";

        if (!validBranch) {
          break;
        }

        if ((branchFlow.kind === "if" || branchFlow.kind === "else-if") && !branchFlow.condition) {
          context.unsupported = true;
          return expressions;
        }

        const entries = collectElementWidgets(branchElement, context);
        if (context.unsupported) return expressions;

        branches.push({
          kind: branchFlow.kind as ConditionalBranch["kind"],
          condition: branchFlow.condition,
          entries,
        });

        cursor++;
        if (branchFlow.kind === "else") {
          break;
        }
      }

      expressions.push(`...(${toConditionalEntriesExpression(branches)})`);
      index = cursor - 1;
      continue;
    }

    if (controlFlow.kind === "else-if" || controlFlow.kind === "else") {
      context.unsupported = true;
      return expressions;
    }

    expressions.push(...collectElementWidgets(element, context));
    if (context.unsupported) return expressions;
  }

  return expressions;
};
