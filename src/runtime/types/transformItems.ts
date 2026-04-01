import type { TransformItemsMetadata } from "instantsearch.js/es/types";

export type TransformItemsTo<
  TInput,
  TOutput extends TInput = TInput,
  TMetadata = TransformItemsMetadata,
> = (items: TInput[], metadata: TMetadata) => TOutput[];
