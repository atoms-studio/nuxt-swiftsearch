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
};
