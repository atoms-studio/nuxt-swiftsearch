import { readFileSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { NodeTypes, parse as parseTemplate, type TemplateChildNode } from "@vue/compiler-dom";
import { compileScript, parse as parseSFC, type BindingMetadata } from "@vue/compiler-sfc";
import { collectWidgets } from "./collector";
import { buildGeneratedImports, createDiscoveryContext, createGenerationContext } from "./context";
import { indent } from "./template";
import {
  SWIFTSEARCH_FACTORY_NAME,
  SWIFTSEARCH_FACTORY_PREFIX,
  SWIFTSEARCH_FACTORY_PROPS,
  type DiscoveryContext,
  type GenerationContext,
  type ProviderAnalysis,
  type ResolveTagFn,
  type TemplateEdit,
} from "./types";
import {
  hasInstantSearchRoot,
  normalizeAisTag,
  usesVueInstantSearch,
  WIDGET_COMPONENTS,
} from "./widgets";

export type ProviderGeneration = {
  analysis: ProviderAnalysis;
  edits: TemplateEdit[];
  notices: string[];
  // Module code to add to the child SFC; empty when the file has no widgets.
  factoryModule: string;
  script: { kind: "append"; offset: number } | { kind: "new"; lang?: string };
};

export type ProviderOptions = {
  createTagResolver: (
    scriptContents: Array<string | undefined>,
    importerDir: string,
  ) => ResolveTagFn;
};

const emptyAnalysis = (filePath: string, cyclic = false): ProviderAnalysis => ({
  isProvider: false,
  cyclic,
  skipped: [],
  referencedProps: [],
  watchFiles: [filePath],
});

// Finds widget tags, or child components that are providers (or cyclic, so
// that the collector can report the cycle). Runs before compileScript, which
// is the expensive step.
const hasWidgetCandidates = (children: TemplateChildNode[], discovery: DiscoveryContext): boolean =>
  children.some((child) => {
    if (child.type !== NodeTypes.ELEMENT) return false;

    const tag = normalizeAisTag(child.tag);
    if (tag === "AisIndex" || WIDGET_COMPONENTS[tag]) return true;

    const resolved = !tag.startsWith("Ais") && discovery.resolveTag(child.tag);
    if (resolved && resolved.mode !== "server") {
      const analysis = discovery.analyzeChild(resolved.filePath, discovery.visited);
      analysis.watchFiles.forEach((file) => discovery.watchFiles.add(file));
      if (analysis.isProvider || analysis.cyclic) return true;
    }

    return hasWidgetCandidates(child.children, discovery);
  });

const readBindings = (descriptor: ReturnType<typeof parseSFC>["descriptor"], filePath: string) => {
  if (!descriptor.script && !descriptor.scriptSetup)
    return { bindings: {}, imports: new Set<string>() };
  try {
    const compiled = compileScript(descriptor, { id: filePath });
    const imports = Object.entries(compiled.imports ?? {})
      .filter(([, binding]) => !binding.isType)
      .map(([name]) => name);
    return { bindings: compiled.bindings ?? {}, imports: new Set(imports) };
  } catch {
    // Unanalyzable script: no identifier can be proven hoistable, so every
    // dynamic expression skips its node with a warning.
    return { bindings: {} as BindingMetadata, imports: new Set<string>() };
  }
};

const buildFactoryModule = (context: GenerationContext, entries: string[]) => {
  const discovery = context.discovery!;
  const entriesBlock = entries.length
    ? `[\n${entries.map((entry) => indent(entry, 2)).join(",\n")}\n]`
    : "[]";

  return [
    ...buildGeneratedImports({
      vueImports: [],
      usesRenderList: context.usesRenderList,
      usesUnref: context.usesUnref,
      usedComposables: context.usedComposables,
      aliasByComposable: context.aliasByComposable,
      providerImports: discovery.providerImports,
    }),
    `export const ${SWIFTSEARCH_FACTORY_NAME} = (${SWIFTSEARCH_FACTORY_PROPS}, ${SWIFTSEARCH_FACTORY_PREFIX}) => ${entriesBlock};`,
  ].join("\n");
};

// Compiles a child component (a file without <AisInstantSearch>) into an
// exported widget factory. Returns null for files that cannot be parsed.
const collectProviderGeneration = (
  source: string,
  filePath: string,
  options: ProviderOptions,
  visited: Set<string>,
): ProviderGeneration | null => {
  // A nested search root registers its own widgets.
  if (hasInstantSearchRoot(source) || usesVueInstantSearch(source)) return null;

  const { descriptor, errors } = parseSFC(source, { filename: filePath });
  if (errors.length || !descriptor.template) return null;

  const script: ProviderGeneration["script"] = descriptor.script
    ? { kind: "append", offset: descriptor.script.loc.end.offset }
    : { kind: "new", lang: descriptor.scriptSetup?.lang };

  const discovery = createDiscoveryContext({
    resolveTag: options.createTagResolver(
      [descriptor.script?.content, descriptor.scriptSetup?.content],
      dirname(filePath),
    ),
    analyzeChild: (childPath, childVisited) =>
      analyzeProviderFile(childPath, options, childVisited),
    visited,
    sourceDir: dirname(filePath),
  });
  const templateAst = parseTemplate(descriptor.template.content, { comments: false });

  if (!hasWidgetCandidates(templateAst.children, discovery)) {
    return {
      analysis: { ...emptyAnalysis(filePath), watchFiles: [filePath, ...discovery.watchFiles] },
      edits: [],
      notices: [],
      factoryModule: "",
      script,
    };
  }

  const { bindings, imports } = readBindings(descriptor, filePath);
  const context = createGenerationContext({
    templateOffset: descriptor.template.loc.start.offset,
    rootIndex: 0,
    aliasByComposable: new Map(),
    discovery,
    provider: { bindings, imports, referencedProps: new Set() },
  });

  const entries = collectWidgets(templateAst.children, context);
  const hasContent = entries.length > 0 || context.skipped.length > 0;

  return {
    analysis: {
      // A subtree with a circular component reference is dropped by importers
      // entirely. This keeps factory imports acyclic in any transform order.
      isProvider: hasContent && !discovery.encounteredCycle,
      cyclic: discovery.encounteredCycle,
      skipped: context.skipped,
      referencedProps: [...context.provider!.referencedProps],
      watchFiles: [filePath, ...discovery.watchFiles],
    },
    edits: context.edits,
    notices: context.notices,
    factoryModule: hasContent ? buildFactoryModule(context, entries) : "",
    script,
  };
};

// --- cache ---------------------------------------------------------------

// A file's stamp changes when its content changes. A stat is much cheaper
// than a read, so cache entries are validated with stamps of all their files.
const stampOf = (filePath: string) => {
  try {
    const stats = statSync(filePath);
    return `${stats.mtimeMs}:${stats.size}`;
  } catch {
    return "missing";
  }
};

type CacheEntry = {
  source: string;
  generation: ProviderGeneration | null;
  stamps: Array<[string, string]>;
};

const cache = new Map<string, CacheEntry>();

export const clearProviderCache = () => {
  cache.clear();
};

// Returns the generation for a child file. The transform hook passes the
// source it received. The analysis of a parent reads the file from disk.
export const getProviderGeneration = (
  filePath: string,
  options: ProviderOptions,
  visited: Set<string>,
  source?: string,
): ProviderGeneration | null => {
  const cached = cache.get(filePath);
  if (
    cached &&
    (source === undefined || source === cached.source) &&
    cached.stamps.every(([file, stamp]) => stampOf(file) === stamp)
  ) {
    return cached.generation;
  }

  const selfStamp = stampOf(filePath);
  let text = source;
  if (text === undefined) {
    try {
      text = readFileSync(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  const generation = collectProviderGeneration(
    text,
    filePath,
    options,
    new Set([...visited, filePath]),
  );

  // A cyclic result depends on the path it was reached through: never cache it.
  if (!generation?.analysis.cyclic) {
    const dependencies = (generation?.analysis.watchFiles ?? []).filter(
      (file) => file !== filePath,
    );
    cache.set(filePath, {
      source: text,
      generation,
      stamps: [
        [filePath, selfStamp],
        ...dependencies.map((file): [string, string] => [file, stampOf(file)]),
      ],
    });
  }

  return generation;
};

export const analyzeProviderFile = (
  filePath: string,
  options: ProviderOptions,
  visited: Set<string>,
): ProviderAnalysis => {
  if (visited.has(filePath)) return emptyAnalysis(filePath, true);
  return getProviderGeneration(filePath, options, visited)?.analysis ?? emptyAnalysis(filePath);
};
