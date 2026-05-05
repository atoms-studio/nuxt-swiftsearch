import type { WidgetConfig } from "./types";

export const WIDGET_COMPONENTS: Record<string, WidgetConfig> = {
  AisAutocomplete: { composable: "useAisAutocomplete", usesId: true },
  AisBreadcrumb: { composable: "useAisBreadcrumb", usesId: true },
  AisClearRefinements: { composable: "useAisClearRefinements", usesId: true },
  AisConfigure: { composable: "useAisConfigure" },
  AisConfigureRelatedItems: { composable: "useAisConfigureRelatedItems" },
  AisCurrentRefinements: { composable: "useAisCurrentRefinements", usesId: true },
  AisDynamicWidgets: { composable: "useAisDynamicWidgets", usesId: true },
  AisExperimentalConfigureRelatedItems: { composable: "useAisConfigureRelatedItems" },
  AisExperimentalDynamicWidgets: { composable: "useAisDynamicWidgets", usesId: true },
  AisHierarchicalMenu: { composable: "useAisHierarchicalMenu", usesId: true },
  AisHits: { composable: "useAisHits", usesId: true },
  AisHitsPerPage: { composable: "useAisHitsPerPage", usesId: true },
  AisInfiniteHits: { composable: "useAisInfiniteHits", usesId: true },
  AisMenu: { composable: "useAisMenu", usesId: true },
  AisMenuSelect: { composable: "useAisMenu", usesId: true },
  AisNumericMenu: { composable: "useAisNumericMenu", usesId: true },
  AisPagination: { composable: "useAisPagination", usesId: true },
  AisPoweredBy: { composable: "useAisPoweredBy", usesId: true },
  AisQueryRuleContext: { composable: "useAisQueryRuleContext" },
  AisQueryRuleCustomData: { composable: "useAisQueryRuleCustomData", usesId: true },
  AisRangeInput: { composable: "useAisRangeInput", usesId: true },
  AisRatingMenu: { composable: "useAisRatingMenu", usesId: true },
  AisRefinementList: { composable: "useAisRefinementList", usesId: true },
  AisRelevantSort: { composable: "useAisRelevantSort", usesId: true },
  AisSearchBox: { composable: "useAisSearchBox", usesId: true },
  AisSortBy: { composable: "useAisSortBy", usesId: true },
  AisStats: { composable: "useAisStats", usesId: true },
  AisToggleRefinement: { composable: "useAisToggleRefinement", usesId: true },
  AisVoiceSearch: { composable: "useAisVoiceSearch", usesId: true },
};

const toPascalCase = (value: string) => {
  return value
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("");
};

export const normalizeAisTag = (tag: string) => {
  if (tag.startsWith("Ais")) return tag;
  if (tag.startsWith("ais-")) return `Ais${toPascalCase(tag.slice(4))}`;
  if (tag.startsWith("ais")) {
    return `Ais${tag.slice(3)}`;
  }
  return tag;
};
