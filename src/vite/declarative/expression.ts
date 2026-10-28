import {
  BindingTypes,
  NodeTypes,
  createRoot,
  createSimpleExpression,
  createTransformContext,
  processExpression,
  stringifyExpression,
  type BindingMetadata,
  type DirectiveNode,
} from "@vue/compiler-dom";
import type { GenerationContext, ProviderScope } from "./types";

export const SWIFTSEARCH_UNREF_ALIAS = "__swiftsearchUnref";

// Thrown in provider mode when an expression reads state that cannot move into
// the module-scope widget factory. The collector catches it and skips the node.
export class UnhoistableExpressionError extends Error {
  constructor(readonly identifier: string) {
    super(`unhoistable identifier \`${identifier}\``);
  }
}

const CTX_IDENTIFIER_RE = /_ctx\.([A-Za-z_$][A-Za-z0-9_$]*)/g;

const compileExpression = (source: string, bindingMetadata: BindingMetadata) => {
  const transformContext = createTransformContext(createRoot([]), {
    prefixIdentifiers: true,
    inline: true,
    bindingMetadata,
  });
  return stringifyExpression(
    processExpression(createSimpleExpression(source, false), transformContext),
  );
};

const resolveProviderBinding = (identifier: string, provider: ProviderScope): BindingTypes => {
  const binding = provider.bindings[identifier];
  if (binding === BindingTypes.PROPS) {
    provider.referencedProps.add(identifier);
    return binding;
  }
  if (binding === BindingTypes.PROPS_ALIASED) {
    const original = (provider.bindings.__propsAliases as Record<string, string> | undefined)?.[
      identifier
    ];
    if (original) provider.referencedProps.add(original);
    return binding;
  }
  // Value imports are hoisted to module scope by the SFC compiler, so the
  // factory can read them. They can be refs, so they stay unref-wrapped.
  if (provider.imports.has(identifier)) {
    return BindingTypes.SETUP_MAYBE_REF;
  }
  throw new UnhoistableExpressionError(identifier);
};

// Rewrites a template expression into code that runs outside the template:
// refs are unwrapped, props read from __props, loop aliases stay raw.
export const normalizeExpression = (expression: string, context?: GenerationContext) => {
  const source = expression.trim();
  if (!source || !context) return source;

  let identifiers: string[];
  try {
    const probe = compileExpression(source, {});
    identifiers = [...new Set(Array.from(probe.matchAll(CTX_IDENTIFIER_RE), (match) => match[1]!))];
  } catch {
    return source;
  }
  if (!identifiers.length) return source;

  const bindingMetadata: BindingMetadata = {};
  for (const identifier of identifiers) {
    if (context.loop?.localBindings.has(identifier)) {
      bindingMetadata[identifier] = BindingTypes.SETUP_CONST;
    } else if (context.provider) {
      bindingMetadata[identifier] = resolveProviderBinding(identifier, context.provider);
    } else {
      bindingMetadata[identifier] = BindingTypes.SETUP_MAYBE_REF;
    }
  }
  if (context.provider?.bindings.__propsAliases) {
    bindingMetadata.__propsAliases = context.provider.bindings.__propsAliases;
  }

  let code: string;
  try {
    code = compileExpression(source, bindingMetadata);
  } catch {
    return source;
  }

  if (!code.includes("_unref(")) return code;
  context.usesUnref = true;
  return code.replace(/\b_unref\b/g, SWIFTSEARCH_UNREF_ALIAS);
};

export const getDirectiveExpression = (directive: DirectiveNode, context?: GenerationContext) => {
  const expression = directive.exp;
  if (!expression) return "";

  return normalizeExpression(
    expression.type === NodeTypes.SIMPLE_EXPRESSION ? expression.content : expression.loc.source,
    context,
  );
};
