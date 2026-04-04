import { describe, expect, it, vi } from "vitest";
import { aisDeclarativeWidgetsPlugin } from "../src/vite/aisDeclarativeWidgetsPlugin";

const transform = async (code: string) => {
  const plugin = aisDeclarativeWidgetsPlugin();
  const warn = vi.fn();
  const transformHook = plugin.transform;
  const transformHandler =
    typeof transformHook === "function" ? transformHook : transformHook?.handler;

  const result = await transformHandler?.call({ warn } as any, code, "/tmp/page.vue");

  if (!result) {
    return { code: "", warn };
  }

  return {
    code: typeof result === "string" ? result : result.code,
    warn,
  };
};

describe("declarative widgets transform", () => {
  it("supports widget v-if / v-else-if / v-else branches", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <AisStats v-if="showStats" />
    <AisHits v-else-if="showHits" />
    <AisSearchBox v-else />
  </AisInstantSearch>
</template>

<script setup lang="ts">
const configuration = {
  indexName: "instant_search",
  searchClient: {} as any,
}
</script>
`;

    const { code, warn } = await transform(source);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("unref as __swiftsearchUnref");
    expect(code).toContain(':widgets="__swiftsearchWidgets1"');
    expect(code).toContain("...((__swiftsearchUnref(showStats)) ? [");
    expect(code).toContain("(__swiftsearchUnref(showHits)) ? [");
    expect(code).toContain("__swiftsearchUseAisStats({})");
    expect(code).toContain("__swiftsearchUseAisHits({})");
    expect(code).toContain("__swiftsearchUseAisSearchBox({})");
  });

  it("supports control flow on wrapper templates", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <template v-if="showA">
      <AisStats />
      <AisHits />
    </template>
    <template v-else>
      <AisSearchBox />
    </template>
  </AisInstantSearch>
</template>

<script setup lang="ts">
const configuration = {
  indexName: "instant_search",
  searchClient: {} as any,
}
</script>
`;

    const { code, warn } = await transform(source);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("unref as __swiftsearchUnref");
    expect(code).toContain("__swiftsearchUseAisStats({})");
    expect(code).toContain("__swiftsearchUseAisHits({})");
    expect(code).toContain("__swiftsearchUseAisSearchBox({})");
    expect(code).toContain("...((__swiftsearchUnref(showA)) ? [");
  });

  it("unwraps refs in declarative widget prop expressions", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <AisConfigure
      :search-parameters="{ filters, distinct: true, facetFilters: [\`free_shipping:\${isFreeShipping}\`] }"
    />
  </AisInstantSearch>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const filters = computed(() => "brand:Apple");
const isFreeShipping = ref(false);

const configuration = {
  indexName: "instant_search",
  searchClient: {} as any,
};
</script>
`;

    const { code, warn } = await transform(source);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("unref as __swiftsearchUnref");
    expect(code).toContain("filters: __swiftsearchUnref(filters)");
    expect(code).toContain("`free_shipping:${__swiftsearchUnref(isFreeShipping)}`");
  });

  it("collects nested widgets inside AisDynamicWidgets", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <AisDynamicWidgets>
      <AisRefinementList attribute="brand" />
      <AisRefinementList attribute="categories" />
    </AisDynamicWidgets>
  </AisInstantSearch>
</template>

<script setup lang="ts">
const configuration = {
  indexName: "instant_search",
  searchClient: {} as any,
};
</script>
`;

    const { code, warn } = await transform(source);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("__swiftsearchUseAisDynamicWidgets({})");
    expect(code).toContain('__swiftsearchUseAisRefinementList({ attribute: "brand" },');
    expect(code).toContain('__swiftsearchUseAisRefinementList({ attribute: "categories" },');
  });
});
