import type { WidgetConfig } from "./types";

export const WIDGET_COMPONENTS: Record<string, WidgetConfig> = {
  AisAutocomplete: { composable: "useAisAutocomplete", usesId: true },
  AisBreadcrumb: { composable: "useAisBreadcrumb" },
  AisClearRefinements: { composable: "useAisClearRefinements", usesId: true },
  AisConfigure: { composable: "useAisConfigure" },
  AisConfigureRelatedItems: { composable: "useAisConfigureRelatedItems" },
  AisCurrentRefinements: { composable: "useAisCurrentRefinements", usesId: true },
  AisDynamicWidgets: { composable: "useAisDynamicWidgets" },
  AisExperimentalConfigureRelatedItems: { composable: "useAisConfigureRelatedItems" },
  AisExperimentalDynamicWidgets: { composable: "useAisDynamicWidgets" },
  AisHierarchicalMenu: { composable: "useAisHierarchicalMenu" },
  AisHits: { composable: "useAisHits" },
  AisHitsPerPage: { composable: "useAisHitsPerPage" },
  AisInfiniteHits: { composable: "useAisInfiniteHits" },
  AisMenu: { composable: "useAisMenu" },
  AisNumericMenu: { composable: "useAisNumericMenu" },
  AisPagination: { composable: "useAisPagination" },
  AisPoweredBy: { composable: "useAisPoweredBy" },
  AisQueryRuleContext: { composable: "useAisQueryRuleContext" },
  AisQueryRuleCustomData: { composable: "useAisQueryRuleCustomData" },
  AisRangeInput: { composable: "useAisRangeInput" },
  AisRatingMenu: { composable: "useAisRatingMenu" },
  AisRefinementList: { composable: "useAisRefinementList", usesId: true },
  AisRelevantSort: { composable: "useAisRelevantSort" },
  AisSearchBox: { composable: "useAisSearchBox" },
  AisSortBy: { composable: "useAisSortBy" },
  AisStats: { composable: "useAisStats" },
  AisToggleRefinement: { composable: "useAisToggleRefinement" },
  AisVoiceSearch: { composable: "useAisVoiceSearch" },
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
