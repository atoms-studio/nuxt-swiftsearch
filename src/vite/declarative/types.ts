import type { BindingMetadata, DirectiveNode } from "@vue/compiler-dom";

export const SWIFTSEARCH_ID_PREFIX_ATTR = "data-swiftsearch-id-prefix";
export const SWIFTSEARCH_FACTORY_NAME = "__swiftsearchWidgets";
export const SWIFTSEARCH_FACTORY_PROPS = "__props";
export const SWIFTSEARCH_FACTORY_PREFIX = "__swiftsearchIdPrefix";

export type ResolvedComponentFile = {
  filePath: string;
  mode: "all" | "client" | "server";
};

export type ResolveTagFn = (rawTag: string) => ResolvedComponentFile | undefined;

export type PluginOptions = {
  // Opt-in cross-file discovery of widgets inside child components.
  childWidgetDiscovery?: boolean;
  // Nuxt component registry lookup (pascal name → file), provided by the module.
  resolveComponent?: (name: string) => ResolvedComponentFile | undefined;
  // Absolute directories that the transform never reads (for example the module runtime).
  exclude?: string[];
};

export type ProviderAnalysis = {
  isProvider: boolean;
  cyclic: boolean;
  skipped: SkippedNode[];
  // camelCase prop names the generated factory reads from __props
  referencedProps: string[];
  // this file + transitive provider descendants
  watchFiles: string[];
};

export type WidgetConfig = {
  composable: string;
  usesId?: boolean;
};

export type TemplateEdit = {
  start: number;
  // When present, the edit overwrites [start, end) instead of inserting at start.
  end?: number;
  content: string;
};

export type ExtractedProps = {
  paramsExpr: string;
  idExpr?: string;
  idIsStatic?: boolean;
  // Set when a required prop is missing; the widget is skipped with this reason.
  invalidReason?: string;
};

export type ControlFlow =
  | { kind: "none" | "for-and-if" }
  | { kind: "else" }
  | { kind: "if" | "else-if"; condition: string }
  | { kind: "for"; forDirective: DirectiveNode };

export type ConditionalBranch = {
  kind: "if" | "else-if" | "else";
  condition?: string;
  entries: string[];
};

export type SkippedNode = {
  tag: string;
  reason: string;
};

export type LoopScope = {
  // Normalized JS expression for the loop source (already unref-wrapped when needed).
  sourceCode: string;
  // Per-iteration id suffix: the `:key` expression when present, else the index alias.
  idSuffix: { template: string; factory: string };
  // Loop-local identifiers that must stay raw (never unref-wrapped) in generated expressions.
  localBindings: Set<string>;
};

// Cross-file discovery state, shared by every root (or provider) in one file.
export type DiscoveryContext = {
  resolveTag: ResolveTagFn;
  analyzeChild: (filePath: string, visited: Set<string>) => ProviderAnalysis;
  // Path chain for cycle detection (contains the current file).
  visited: Set<string>;
  // Directory of the file being transformed (for relative import specifiers).
  sourceDir: string;
  // Files whose content this transform depends on (children, grandchildren).
  watchFiles: Set<string>;
  providerAliasByPath: Map<string, string>;
  providerImports: string[];
  encounteredCycle: boolean;
};

// Present when the file is a child component compiled into a widget factory.
export type ProviderScope = {
  // The child's compileScript bindings. Only props, loop locals and value imports
  // can move into the module-scope factory.
  bindings: BindingMetadata;
  imports: Set<string>;
  // Declared prop names that the generated factory reads.
  referencedProps: Set<string>;
};

export type GenerationContext = {
  templateOffset: number;
  rootIndex: number;
  edits: TemplateEdit[];
  usedComposables: Set<string>;
  aliasByComposable: Map<string, string>;
  idCounter: number;
  // Nodes dropped from generation. Each becomes a build warning.
  skipped: SkippedNode[];
  // Warnings that do not imply a skipped node.
  notices: string[];
  usesUnref: boolean;
  usesRenderList: boolean;
  // Set while collecting inside a v-for body; only one level is supported.
  loop?: LoopScope;
  // Tracks (composable + loop source + explicit id) tuples already emitted in this
  // root. A second element with the same explicit id is a view of the first
  // widget's state and contributes no extra factory call.
  seenExplicitIds: Set<string>;
  discovery?: DiscoveryContext;
  provider?: ProviderScope;
};
