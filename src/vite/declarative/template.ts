import {
  NodeTypes,
  type DirectiveNode,
  type ElementNode,
  type TemplateChildNode,
} from "@vue/compiler-dom";
import type { ConditionalBranch, ControlFlow } from "./types";
import { normalizeAisTag } from "./widgets";

export const toCamelCase = (value: string) =>
  value.replace(/-([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase());

const isIdentifier = (value: string) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);

export const renderObjectKey = (key: string) => (isIdentifier(key) ? key : JSON.stringify(key));

export const shouldIgnoreProp = (name: string) => {
  const lowered = name.toLowerCase();

  return (
    lowered === "id" ||
    lowered === "class" ||
    lowered === "style" ||
    lowered === "key" ||
    lowered === "ref" ||
    lowered === "is" ||
    lowered === "slot" ||
    lowered.startsWith("data-") ||
    lowered.startsWith("aria-")
  );
};

export const indent = (value: string, size: number) => {
  const prefix = " ".repeat(size);
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
};

const toEntriesArrayExpression = (entries: string[]) => {
  if (!entries.length) {
    return "[]";
  }

  return `[
${entries.map((entry) => indent(entry, 2)).join(",\n")}
]`;
};

export const toConditionalEntriesExpression = (branches: ConditionalBranch[]) => {
  let expression = "[]";

  for (let index = branches.length - 1; index >= 0; index--) {
    const branch = branches[index]!;
    const branchEntries = toEntriesArrayExpression(branch.entries);

    if (branch.kind === "else") {
      expression = branchEntries;
      continue;
    }

    expression = `(${branch.condition}) ? ${branchEntries} : ${expression}`;
  }

  return expression;
};

const findStartTagClose = (source: string) => {
  let quote: string | null = null;

  for (let index = 0; index < source.length; index++) {
    const char = source[index];

    if (quote) {
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === ">") {
      return index;
    }
  }

  return -1;
};

export const getTagAttributeInsertIndex = (node: ElementNode, templateOffset: number) => {
  const closeIndex = findStartTagClose(node.loc.source);

  if (closeIndex < 0) return null;

  const offsetInNode = node.loc.source[closeIndex - 1] === "/" ? closeIndex - 1 : closeIndex;

  return templateOffset + node.loc.start.offset + offsetInNode;
};

export const hasWidgetsProp = (node: ElementNode) => {
  for (const prop of node.props) {
    if (prop.type === NodeTypes.ATTRIBUTE && prop.name === "widgets") {
      return true;
    }

    if (
      prop.type === NodeTypes.DIRECTIVE &&
      prop.name === "bind" &&
      prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
      prop.arg.isStatic &&
      prop.arg.content === "widgets"
    ) {
      return true;
    }
  }

  return false;
};

const directiveSource = (directive: DirectiveNode) =>
  directive.exp?.type === NodeTypes.SIMPLE_EXPRESSION
    ? directive.exp.content
    : (directive.exp?.loc.source ?? "");

// Structural only: conditions stay raw template source. The collector
// normalizes them, so that it can skip the node when an expression bails.
export const getControlFlow = (node: ElementNode): ControlFlow => {
  let forDirective: DirectiveNode | undefined;
  let conditional: { kind: "if" | "else-if"; condition: string } | { kind: "else" } | undefined;

  for (const prop of node.props) {
    if (prop.type !== NodeTypes.DIRECTIVE) continue;

    if (prop.name === "for") {
      forDirective = prop;
    } else if (prop.name === "if" || prop.name === "else-if") {
      conditional = { kind: prop.name, condition: directiveSource(prop) };
    } else if (prop.name === "else") {
      conditional = { kind: "else" };
    }
  }

  // Both directives on one element cannot be modeled as a single widget call.
  if (forDirective && conditional) return { kind: "for-and-if" };
  if (forDirective) return { kind: "for", forDirective };
  return conditional ?? { kind: "none" };
};

export const findBoundAttribute = (node: ElementNode, name: string) => {
  for (const prop of node.props) {
    if (
      prop.type === NodeTypes.DIRECTIVE &&
      prop.name === "bind" &&
      prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
      prop.arg.isStatic &&
      prop.arg.content === name
    ) {
      return directiveSource(prop).trim() || undefined;
    }
  }
  return undefined;
};

export const SYNTHETIC_LOOP_INDEX_ALIAS = "__swiftsearchI";

export type ParsedForDirective =
  | {
      ok: true;
      rawSource: string;
      valueAlias: string;
      // Second callback argument: array index or object key.
      keyAlias?: string;
      indexAlias?: string;
    }
  | { ok: false; reason: string };

export const parseForDirective = (directive: DirectiveNode): ParsedForDirective => {
  const parseResult = directive.forParseResult;

  if (!parseResult?.source || !directive.exp) {
    return { ok: false, reason: "the v-for expression could not be parsed" };
  }

  const { source, value, key, index } = parseResult;
  const valueAlias = value?.loc.source.trim();
  const keyAlias = key?.loc.source.trim();
  const indexAlias = index?.loc.source.trim();

  if (!valueAlias) {
    return { ok: false, reason: "v-for without an item alias is not supported" };
  }
  if (!isIdentifier(valueAlias)) {
    return {
      ok: false,
      reason:
        "destructured v-for aliases are not supported; use a simple identifier (for example `item in items`)",
    };
  }
  if (keyAlias !== undefined && !isIdentifier(keyAlias)) {
    return { ok: false, reason: "the v-for key/index alias must be a simple identifier" };
  }
  if (indexAlias !== undefined && !isIdentifier(indexAlias)) {
    return { ok: false, reason: "the v-for index alias must be a simple identifier" };
  }
  if (indexAlias !== undefined && keyAlias === undefined) {
    return { ok: false, reason: "v-for with a skipped key alias is not supported" };
  }

  return { ok: true, rawSource: source.loc.source, valueAlias, keyAlias, indexAlias };
};

export const isIgnorableControlFlowSibling = (node: TemplateChildNode) => {
  if (node.type === NodeTypes.COMMENT) {
    return true;
  }

  return node.type === NodeTypes.TEXT && !node.content.trim();
};

export const findInstantSearchRoots = (children: TemplateChildNode[]) => {
  const nodes: ElementNode[] = [];

  const visit = (nodesToVisit: TemplateChildNode[]) => {
    for (const child of nodesToVisit) {
      if (child.type !== NodeTypes.ELEMENT) continue;

      const element = child as ElementNode;
      const tag = normalizeAisTag(element.tag);

      if (tag === "AisInstantSearch") {
        nodes.push(element);
        continue;
      }

      if (element.children.length) {
        visit(element.children);
      }
    }
  };

  visit(children);
  return nodes;
};
