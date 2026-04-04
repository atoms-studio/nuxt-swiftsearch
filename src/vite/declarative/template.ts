import {
  NodeTypes,
  type DirectiveNode,
  type ElementNode,
  type TemplateChildNode,
} from "@vue/compiler-dom";
import { getDirectiveExpression } from "./expression";
import type {
  ConditionalBranch,
  ControlFlow,
  GenerationContext,
} from "./types";
import { normalizeAisTag } from "./widgets";

export const toCamelCase = (value: string) =>
  value.replace(/-([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase());

const isIdentifier = (value: string) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);

export const renderObjectKey = (key: string) =>
  (isIdentifier(key) ? key : JSON.stringify(key));

export const shouldIgnoreProp = (name: string) => {
  const lowered = name.toLowerCase();

  return (
    lowered === "id"
    || lowered === "class"
    || lowered === "style"
    || lowered === "key"
    || lowered === "ref"
    || lowered === "is"
    || lowered === "slot"
    || lowered.startsWith("data-")
    || lowered.startsWith("aria-")
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

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === ">") {
      return index;
    }
  }

  return -1;
};

export const getTagAttributeInsertIndex = (
  node: ElementNode,
  templateOffset: number,
) => {
  const closeIndex = findStartTagClose(node.loc.source);

  if (closeIndex < 0) return null;

  const offsetInNode =
    node.loc.source[closeIndex - 1] === "/" ? closeIndex - 1 : closeIndex;

  return templateOffset + node.loc.start.offset + offsetInNode;
};

export const hasWidgetsProp = (node: ElementNode) => {
  for (const prop of node.props) {
    if (prop.type === NodeTypes.ATTRIBUTE && prop.name === "widgets") {
      return true;
    }

    if (
      prop.type === NodeTypes.DIRECTIVE
      && prop.name === "bind"
      && prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION
      && prop.arg.isStatic
      && prop.arg.content === "widgets"
    ) {
      return true;
    }
  }

  return false;
};

export const getControlFlow = (
  node: ElementNode,
  context?: GenerationContext,
): ControlFlow => {
  for (const prop of node.props) {
    if (prop.type !== NodeTypes.DIRECTIVE) {
      continue;
    }

    if (prop.name === "for") {
      return { kind: "for" };
    }

    if (prop.name === "if" || prop.name === "else-if") {
      const condition = getDirectiveExpression(prop as DirectiveNode, context);
      return { kind: prop.name, condition };
    }

    if (prop.name === "else") {
      return { kind: "else" };
    }
  }

  return { kind: "none" };
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
