import {
  NodeTypes,
  type AttributeNode,
  type DirectiveNode,
  type ElementNode,
} from "@vue/compiler-dom";
import { getDirectiveExpression } from "./expression";
import {
  renderObjectKey,
  shouldIgnoreProp,
  toCamelCase,
} from "./template";
import type {
  ExtractedProps,
  GenerationContext,
  HierarchicalMenuProps,
  IndexProps,
} from "./types";

export const extractWidgetProps = (
  node: ElementNode,
  context: GenerationContext,
): ExtractedProps => {
  const entries: string[] = [];
  let idExpr: string | undefined;

  for (const prop of node.props) {
    if (prop.type === NodeTypes.ATTRIBUTE) {
      const attribute = prop as AttributeNode;

      if (attribute.name === "id") {
        idExpr = attribute.value ? JSON.stringify(attribute.value.content) : "\"\"";
        continue;
      }

      if (shouldIgnoreProp(attribute.name)) {
        continue;
      }

      const key = toCamelCase(attribute.name);
      const valueExpr = attribute.value
        ? JSON.stringify(attribute.value.content)
        : "true";

      entries.push(`${renderObjectKey(key)}: ${valueExpr}`);
      continue;
    }

    if (prop.type !== NodeTypes.DIRECTIVE) {
      continue;
    }

    const directive = prop as DirectiveNode;

    if (["if", "else-if", "else", "for"].includes(directive.name)) {
      continue;
    }

    if (directive.name === "on" || directive.name === "slot") {
      continue;
    }

    if (directive.name !== "bind") {
      continue;
    }

    if (!directive.arg) {
      const spreadExpr = getDirectiveExpression(directive, context);
      if (spreadExpr) {
        entries.push(`...(${spreadExpr})`);
      }
      continue;
    }

    if (directive.arg.type !== NodeTypes.SIMPLE_EXPRESSION || !directive.arg.isStatic) {
      continue;
    }

    const rawName = directive.arg.content;
    const valueExpr = getDirectiveExpression(directive, context) || "true";

    if (rawName === "id") {
      idExpr = valueExpr;
      continue;
    }

    if (shouldIgnoreProp(rawName)) {
      continue;
    }

    const key = toCamelCase(rawName);
    entries.push(`${renderObjectKey(key)}: ${valueExpr}`);
  }

  return {
    paramsExpr: entries.length ? `{ ${entries.join(", ")} }` : "{}",
    idExpr,
  };
};

export const extractIndexProps = (
  node: ElementNode,
  context: GenerationContext,
): IndexProps => {
  const entries: string[] = [];
  let hasIndexName = false;

  for (const prop of node.props) {
    if (prop.type === NodeTypes.ATTRIBUTE) {
      const attribute = prop as AttributeNode;
      const key = toCamelCase(attribute.name);

      if (key === "index" || key === "indexName") {
        const valueExpr = attribute.value
          ? JSON.stringify(attribute.value.content)
          : "true";
        entries.push(`indexName: ${valueExpr}`);
        hasIndexName = true;
      }

      if (key === "indexId") {
        const valueExpr = attribute.value
          ? JSON.stringify(attribute.value.content)
          : "true";
        entries.push(`indexId: ${valueExpr}`);
      }

      continue;
    }

    if (prop.type !== NodeTypes.DIRECTIVE) {
      continue;
    }

    const directive = prop as DirectiveNode;

    if (directive.name !== "bind") {
      continue;
    }

    if (!directive.arg) {
      const spreadExpr = getDirectiveExpression(directive, context);
      if (spreadExpr) {
        entries.push(`...(${spreadExpr})`);
      }
      continue;
    }

    if (directive.arg.type !== NodeTypes.SIMPLE_EXPRESSION || !directive.arg.isStatic) {
      continue;
    }

    const rawName = toCamelCase(directive.arg.content);
    const valueExpr = getDirectiveExpression(directive, context) || "true";

    if (rawName === "index" || rawName === "indexName") {
      entries.push(`indexName: ${valueExpr}`);
      hasIndexName = true;
      continue;
    }

    if (rawName === "indexId") {
      entries.push(`indexId: ${valueExpr}`);
    }
  }

  return {
    paramsExpr: entries.length ? `{ ${entries.join(", ")} }` : "{}",
    hasIndexName,
  };
};

export const extractHierarchicalMenuProps = (
  node: ElementNode,
  context: GenerationContext,
): HierarchicalMenuProps => {
  const entries: string[] = [];
  let attributeExpr: string | undefined;
  let attributesExpr: string | undefined;

  for (const prop of node.props) {
    if (prop.type === NodeTypes.ATTRIBUTE) {
      const attribute = prop as AttributeNode;
      const key = toCamelCase(attribute.name);
      const valueExpr = attribute.value
        ? JSON.stringify(attribute.value.content)
        : "true";

      if (key === "attribute") {
        attributeExpr = valueExpr;
        continue;
      }

      if (key === "attributes") {
        attributesExpr = valueExpr;
        continue;
      }

      if (shouldIgnoreProp(attribute.name)) {
        continue;
      }

      entries.push(`${renderObjectKey(key)}: ${valueExpr}`);
      continue;
    }

    if (prop.type !== NodeTypes.DIRECTIVE) {
      continue;
    }

    const directive = prop as DirectiveNode;

    if (directive.name === "on" || directive.name === "slot") {
      continue;
    }

    if (directive.name !== "bind") {
      continue;
    }

    if (!directive.arg) {
      const spreadExpr = getDirectiveExpression(directive, context);
      if (spreadExpr) {
        entries.push(`...(${spreadExpr})`);
      }
      continue;
    }

    if (directive.arg.type !== NodeTypes.SIMPLE_EXPRESSION || !directive.arg.isStatic) {
      continue;
    }

    const rawName = toCamelCase(directive.arg.content);
    const valueExpr = getDirectiveExpression(directive, context) || "true";

    if (rawName === "attribute") {
      attributeExpr = valueExpr;
      continue;
    }

    if (rawName === "attributes") {
      attributesExpr = valueExpr;
      continue;
    }

    if (shouldIgnoreProp(rawName)) {
      continue;
    }

    entries.push(`${renderObjectKey(rawName)}: ${valueExpr}`);
  }

  const resolvedAttributes = attributesExpr ?? (attributeExpr ? `[${attributeExpr}]` : undefined);
  if (resolvedAttributes) {
    entries.push(`attributes: ${resolvedAttributes}`);
  }

  return {
    paramsExpr: entries.length ? `{ ${entries.join(", ")} }` : "{}",
    hasAttributes: !!resolvedAttributes,
  };
};
