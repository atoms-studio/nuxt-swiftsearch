import { describe, expect, it, vi } from "vitest";
import { aisDeclarativeWidgetsPlugin } from "../src/vite/aisDeclarativeWidgetsPlugin";
import { WIDGET_COMPONENTS } from "../src/vite/declarative/widgets";

const transform = async (code: string) => {
  const plugin = aisDeclarativeWidgetsPlugin();
  const warn = vi.fn<(warning: unknown) => void>();
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
    expect(code).toContain("__swiftsearchUseAisStats({},");
    expect(code).toContain("__swiftsearchUseAisHits({},");
    expect(code).toContain("__swiftsearchUseAisSearchBox({},");
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
    expect(code).toContain("__swiftsearchUseAisStats({},");
    expect(code).toContain("__swiftsearchUseAisHits({},");
    expect(code).toContain("__swiftsearchUseAisSearchBox({},");
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
    expect(code).toContain("__swiftsearchUseAisDynamicWidgets({},");
    expect(code).toContain('__swiftsearchUseAisRefinementList({ attribute: "brand" },');
    expect(code).toContain('__swiftsearchUseAisRefinementList({ attribute: "categories" },');
  });

  it("emits a single factory call when multiple elements share an explicit id", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <AisInfiniteHits id="hits-source" :show-previous="true" />
    <AisInfiniteHits id="hits-source" />
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
    const calls = code.match(/__swiftsearchUseAisInfiniteHits\(/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(code).toContain(
      '__swiftsearchUseAisInfiniteHits({ showPrevious: true }, "hits-source")',
    );
  });

  it("keeps separate factory calls when no explicit id is shared", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <AisInfiniteHits />
    <AisInfiniteHits />
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
    const calls = code.match(/__swiftsearchUseAisInfiniteHits\(/g) ?? [];
    expect(calls).toHaveLength(2);
  });

  it("does not dedupe explicit ids that recur in separate AisIndex scopes", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <AisIndex index="airbnb">
      <AisClearRefinements id="shared-clear" />
    </AisIndex>
    <AisIndex index="airbnb" index-id="bnb2">
      <AisClearRefinements id="shared-clear" />
    </AisIndex>
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
    const calls = code.match(/__swiftsearchUseAisClearRefinements\(/g) ?? [];
    expect(calls).toHaveLength(2);
  });

  it("does not dedupe across composables that happen to share an id literal", async () => {
    const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    <AisHits id="shared" />
    <AisInfiniteHits id="shared" />
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
    expect(code).toContain('__swiftsearchUseAisHits({}, "shared")');
    expect(code).toContain('__swiftsearchUseAisInfiniteHits({}, "shared")');
  });

  it("injects an id argument for every usesId entry in WIDGET_COMPONENTS", async () => {
    const placeholderTemplate = (tag: string): string => {
      if (tag === "AisHierarchicalMenu") {
        return `<${tag} :attributes="['cat']" />`;
      }
      if (tag === "AisDynamicWidgets" || tag === "AisExperimentalDynamicWidgets") {
        return `<${tag}><AisRefinementList attribute="x" /></${tag}>`;
      }
      return `<${tag} />`;
    };

    const aliasFor = (composable: string) =>
      `__swiftsearch${composable.charAt(0).toUpperCase()}${composable.slice(1)}`;

    for (const [tag, config] of Object.entries(WIDGET_COMPONENTS)) {
      if (!config.usesId) continue;

      const source = `
<template>
  <AisInstantSearch :configuration="configuration">
    ${placeholderTemplate(tag)}
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
      expect(warn, `transform warned for ${tag}`).toHaveBeenCalledTimes(0);

      const alias = aliasFor(config.composable);
      // Each call site for this composable must include a 2nd arg referencing
      // either an explicit id ("...") or the auto-generated swiftsearch-N-M id.
      const callPattern = new RegExp(
        String.raw`${alias}\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*?,\s*"`,
      );
      expect(code, `${tag} did not inject an id arg`).toMatch(callPattern);
    }
  });
});
