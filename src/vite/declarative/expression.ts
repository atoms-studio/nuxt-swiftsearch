import {
  BindingTypes,
  NodeTypes,
  createRoot,
  createSimpleExpression,
  createTransformContext,
  processExpression,
  stringifyExpression,
  type DirectiveNode,
} from "@vue/compiler-dom";
import type { GenerationContext } from "./types";

export const SWIFTSEARCH_UNREF_ALIAS = "__swiftsearchUnref";

const CTX_IDENTIFIER_RE = /_ctx\.([A-Za-z_$][A-Za-z0-9_$]*)/g;

const collectContextIdentifiers = (expression: string) => {
  const identifiers = new Set<string>();

  for (const match of expression.matchAll(CTX_IDENTIFIER_RE)) {
    const identifier = match[1];
    if (identifier) {
      identifiers.add(identifier);
    }
  }

  return [...identifiers];
};

const normalizeDirectiveExpression = (
  expression: string,
  context?: GenerationContext,
) => {
  const source = expression.trim();

  if (!source || !context) {
    return source;
  }

  try {
    const firstPassContext = createTransformContext(createRoot([]), {
      prefixIdentifiers: true,
      inline: true,
      bindingMetadata: {},
    });

    const firstPassExpression = processExpression(
      createSimpleExpression(source, false),
      firstPassContext,
    );

    const firstPassCode = stringifyExpression(firstPassExpression);
    const identifiers = collectContextIdentifiers(firstPassCode);

    if (!identifiers.length) {
      return source;
    }

    const bindingMetadata: Record<string, BindingTypes> = {};
    for (const identifier of identifiers) {
      bindingMetadata[identifier] = BindingTypes.SETUP_MAYBE_REF;
    }

    const secondPassContext = createTransformContext(createRoot([]), {
      prefixIdentifiers: true,
      inline: true,
      bindingMetadata,
    });

    const secondPassExpression = processExpression(
      createSimpleExpression(source, false),
      secondPassContext,
    );

    const secondPassCode = stringifyExpression(secondPassExpression);

    if (!secondPassCode.includes("_unref(")) {
      return secondPassCode;
    }

    context.usesUnref = true;
    return secondPassCode.replace(/\b_unref\b/g, SWIFTSEARCH_UNREF_ALIAS);
  } catch {
    return source;
  }
};

export const getDirectiveExpression = (
  directive: DirectiveNode,
  context?: GenerationContext,
) => {
  const expression = directive.exp;
  if (!expression) return "";

  if (expression.type === NodeTypes.SIMPLE_EXPRESSION) {
    return normalizeDirectiveExpression(expression.content, context);
  }

  return normalizeDirectiveExpression(expression.loc.source, context);
};
