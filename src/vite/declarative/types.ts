export type WidgetConfig = {
  composable: string;
  usesId?: boolean;
};

export type TemplateEdit = {
  index: number;
  content: string;
};

export type ExtractedProps = {
  paramsExpr: string;
  idExpr?: string;
};

export type IndexProps = {
  paramsExpr: string;
  hasIndexName: boolean;
};

export type HierarchicalMenuProps = {
  paramsExpr: string;
  idExpr?: string;
  hasAttributes: boolean;
};

export type ControlFlowKind = "none" | "if" | "else-if" | "else" | "for";

export type ControlFlow = {
  kind: ControlFlowKind;
  condition?: string;
};

export type ConditionalBranch = {
  kind: "if" | "else-if" | "else";
  condition?: string;
  entries: string[];
};

export type GenerationContext = {
  templateOffset: number;
  rootIndex: number;
  edits: TemplateEdit[];
  usedComposables: Set<string>;
  aliasByComposable: Map<string, string>;
  idCounter: number;
  indexCounter: number;
  unsupported: boolean;
  usesUnref: boolean;
  // Tracks (composable + explicit id) pairs already emitted in this root.
  // A second element with the same explicit id is treated as a view of the
  // first widget's state and contributes no extra factory call.
  seenExplicitIds: Set<string>;
};
