import { RENDER_LIST_ALIAS } from "./collector";
import { SWIFTSEARCH_UNREF_ALIAS } from "./expression";
import type { DiscoveryContext, GenerationContext, ProviderScope } from "./types";

export const createGenerationContext = (options: {
  templateOffset: number;
  rootIndex: number;
  aliasByComposable: Map<string, string>;
  discovery?: DiscoveryContext;
  provider?: ProviderScope;
}): GenerationContext => ({
  ...options,
  edits: [],
  usedComposables: new Set(),
  idCounter: 0,
  skipped: [],
  notices: [],
  usesUnref: false,
  usesRenderList: false,
  seenExplicitIds: new Set(),
});

export const createDiscoveryContext = (
  options: Pick<DiscoveryContext, "resolveTag" | "analyzeChild" | "visited" | "sourceDir">,
): DiscoveryContext => ({
  ...options,
  watchFiles: new Set(),
  providerAliasByPath: new Map(),
  providerImports: [],
  encounteredCycle: false,
});

// Import lines for generated code: Vue helpers, widget composables, child factories.
export const buildGeneratedImports = (options: {
  vueImports: string[];
  usesRenderList: boolean;
  usesUnref: boolean;
  usedComposables: Iterable<string>;
  aliasByComposable: Map<string, string>;
  providerImports: string[];
}): string[] => {
  const vueImports = [...options.vueImports];
  if (options.usesRenderList) vueImports.push(`renderList as ${RENDER_LIST_ALIAS}`);
  if (options.usesUnref) vueImports.push(`unref as ${SWIFTSEARCH_UNREF_ALIAS}`);

  const composables = [...options.usedComposables]
    .sort()
    .map((composable) => `${composable} as ${options.aliasByComposable.get(composable)!}`);

  return [
    vueImports.length ? `import { ${vueImports.join(", ")} } from "vue";` : "",
    composables.length ? `import { ${composables.join(", ")} } from "#imports";` : "",
    ...options.providerImports,
  ].filter(Boolean);
};
