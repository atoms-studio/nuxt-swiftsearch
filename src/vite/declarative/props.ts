import { NodeTypes, type ElementNode } from "@vue/compiler-dom";
import { getDirectiveExpression } from "./expression";
import { renderObjectKey, shouldIgnoreProp, toCamelCase } from "./template";
import type { ExtractedProps, GenerationContext } from "./types";

type BoundProp =
  | { name: string; key: string; valueExpr: string; isStatic: boolean }
  | { spread: string };

// Yields static attributes and `v-bind` props in template order, so that object
// spreads keep their override semantics. Other directives are ignored.
function* boundProps(node: ElementNode, context: GenerationContext): Generator<BoundProp> {
  for (const prop of node.props) {
    if (prop.type === NodeTypes.ATTRIBUTE) {
      yield {
        name: prop.name,
        key: toCamelCase(prop.name),
        valueExpr: prop.value ? JSON.stringify(prop.value.content) : "true",
        isStatic: true,
      };
      continue;
    }

    if (prop.type !== NodeTypes.DIRECTIVE || prop.name !== "bind") continue;

    if (!prop.arg) {
      const spread = getDirectiveExpression(prop, context);
      if (spread) yield { spread };
      continue;
    }

    if (prop.arg.type !== NodeTypes.SIMPLE_EXPRESSION || !prop.arg.isStatic) continue;

    yield {
      name: prop.arg.content,
      key: toCamelCase(prop.arg.content),
      valueExpr: getDirectiveExpression(prop, context) || "true",
      isStatic: false,
    };
  }
}

const toObjectExpression = (entries: string[]) =>
  entries.length ? `{ ${entries.join(", ")} }` : "{}";

const readId = (prop: { valueExpr: string; isStatic: boolean }) => ({
  idExpr: prop.isStatic && prop.valueExpr === "true" ? '""' : prop.valueExpr,
  idIsStatic: prop.isStatic,
});

export const extractWidgetProps = (
  node: ElementNode,
  context: GenerationContext,
): ExtractedProps => {
  const entries: string[] = [];
  let id: ReturnType<typeof readId> | undefined;

  for (const prop of boundProps(node, context)) {
    if ("spread" in prop) {
      entries.push(`...(${prop.spread})`);
    } else if (prop.key === "id") {
      id = readId(prop);
    } else if (!shouldIgnoreProp(prop.name)) {
      entries.push(`${renderObjectKey(prop.key)}: ${prop.valueExpr}`);
    }
  }

  return { paramsExpr: toObjectExpression(entries), ...id };
};

// `attribute` is accepted as a shorthand for a one-level `attributes` array.
export const extractHierarchicalMenuProps = (
  node: ElementNode,
  context: GenerationContext,
): ExtractedProps => {
  const entries: string[] = [];
  let id: ReturnType<typeof readId> | undefined;
  let attribute: string | undefined;
  let attributes: string | undefined;

  for (const prop of boundProps(node, context)) {
    if ("spread" in prop) {
      entries.push(`...(${prop.spread})`);
    } else if (prop.key === "id") {
      id = readId(prop);
    } else if (prop.key === "attribute") {
      attribute = prop.valueExpr;
    } else if (prop.key === "attributes") {
      attributes = prop.valueExpr;
    } else if (!shouldIgnoreProp(prop.name)) {
      entries.push(`${renderObjectKey(prop.key)}: ${prop.valueExpr}`);
    }
  }

  const resolvedAttributes = attributes ?? (attribute ? `[${attribute}]` : undefined);
  if (resolvedAttributes) entries.push(`attributes: ${resolvedAttributes}`);

  return {
    paramsExpr: toObjectExpression(entries),
    ...id,
    invalidReason: resolvedAttributes ? undefined : "missing an attribute / attributes prop",
  };
};

export const extractIndexProps = (
  node: ElementNode,
  context: GenerationContext,
): ExtractedProps => {
  const entries: string[] = [];
  let hasIndexName = false;

  for (const prop of boundProps(node, context)) {
    if ("spread" in prop) {
      entries.push(`...(${prop.spread})`);
    } else if (prop.key === "index" || prop.key === "indexName") {
      entries.push(`indexName: ${prop.valueExpr}`);
      hasIndexName = true;
    } else if (prop.key === "indexId") {
      entries.push(`indexId: ${prop.valueExpr}`);
    }
  }

  return {
    paramsExpr: toObjectExpression(entries),
    invalidReason: hasIndexName ? undefined : "missing an index / index-name prop",
  };
};

export type ComponentPropsExtraction = {
  paramsExpr: string;
  // camelCase names of statically known props the parent passes
  passedProps: string[];
  // a v-bind="obj" spread makes prop presence statically unknowable
  hasSpread: boolean;
};

// Props passed to a child component's generated widget factory. Keys are
// camelized like Vue's own prop resolution, so they match declared prop names.
export const extractComponentProps = (
  node: ElementNode,
  context: GenerationContext,
): ComponentPropsExtraction => {
  const entries: string[] = [];
  const passedProps: string[] = [];
  let hasSpread = false;

  for (const prop of boundProps(node, context)) {
    if ("spread" in prop) {
      entries.push(`...(${prop.spread})`);
      hasSpread = true;
    } else if (!shouldIgnoreProp(prop.name)) {
      entries.push(`${renderObjectKey(prop.key)}: ${prop.valueExpr}`);
      passedProps.push(prop.key);
    }
  }

  return { paramsExpr: toObjectExpression(entries), passedProps, hasSpread };
};
