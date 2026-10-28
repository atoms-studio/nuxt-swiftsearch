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
      expect(warn).toHaveBeenCalledTimes(0);

      const alias = aliasFor(config.composable);
      // Each call site for this composable must include a 2nd arg referencing
      // either an explicit id ("...") or the auto-generated swiftsearch-N-M id.
      const callPattern = new RegExp(
        String.raw`${alias}\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*?,\s*"`,
      );
      expect(code).toMatch(callPattern);
    }
  });
});

const sfc = (template: string, script = "") => `
<template>
  <AisInstantSearch :configuration="configuration">
${template}
  </AisInstantSearch>
</template>

<script setup lang="ts">
${script}
const configuration = {
  indexName: "instant_search",
  searchClient: {} as any,
};
</script>
`;

describe("declarative widgets transform — v-for", () => {
  it("generates widgets from a basic v-for over an attribute list (issue #58 repro)", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisSearchBox />
    <AisRefinementList v-for="attr in refinementListAttributes" :key="attr" :attribute="attr" />`,
        `const refinementListAttributes = ["brand", "price", "free_shipping"];`,
      ),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain(':widgets="__swiftsearchWidgets1"');
    // the :key suffixes the id, so the v-for alias list stays untouched
    expect(code).toContain('v-for="attr in refinementListAttributes"');
    // the element resolves the same per-iteration id the factory call uses
    expect(code).toContain(':id="`swiftsearch-1-2-${attr}`"');
    expect(code).toContain("renderList as __swiftsearchRenderList");
    expect(code).toContain(
      "...__swiftsearchRenderList(__swiftsearchUnref(refinementListAttributes), (attr) => [",
    );
    expect(code).toContain(".flat()");
    expect(code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: attr }, `swiftsearch-1-2-${attr}`)",
    );
  });

  it("falls back to the item position when the loop has no :key, with a warning", async () => {
    const { code, warn } = await transform(
      sfc(`    <AisRefinementList v-for="attr in attrs" :attribute="attr" />`),
    );

    // the alias list is rewritten in place to expose an index alias
    expect(code).toContain('v-for="(attr, __swiftsearchI) in attrs"');
    expect(code).toContain(':id="`swiftsearch-1-1-${__swiftsearchI}`"');
    expect(code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: attr }, `swiftsearch-1-1-${__swiftsearchI}`)",
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("has no usable :key");
  });

  it("uses the key expression in the template and its normalized form in the factory", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisRefinementList v-for="item in items" :key="prefix + item.id" :attribute="item.attr" />`,
      ),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain(':id="`swiftsearch-1-1-${prefix + item.id}`"');
    expect(code).toContain("`swiftsearch-1-1-${__swiftsearchUnref(prefix) + item.id}`");
  });

  it("reuses the user's index alias and supports the `of` form", async () => {
    const withIndex = await transform(
      sfc(`    <AisRefinementList v-for="(item, index) in attrs" :key="item" :attribute="item" />`),
    );

    expect(withIndex.warn).toHaveBeenCalledTimes(0);
    // no rewrite: the original alias list is untouched
    expect(withIndex.code).toContain('v-for="(item, index) in attrs"');
    expect(withIndex.code).not.toContain("__swiftsearchI");
    expect(withIndex.code).toContain("(item, index) => [");
    expect(withIndex.code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: item }, `swiftsearch-1-1-${item}`)",
    );

    // without a :key, the user's index alias is the id suffix
    const keyless = await transform(
      sfc(`    <AisRefinementList v-for="(item, index) in attrs" :attribute="item" />`),
    );
    expect(keyless.code).not.toContain("__swiftsearchI");
    expect(keyless.code).toContain("`swiftsearch-1-1-${index}`");

    const ofForm = await transform(
      sfc(`    <AisRefinementList v-for="item of attrs" :key="item" :attribute="item" />`),
    );

    expect(ofForm.warn).toHaveBeenCalledTimes(0);
    expect(ofForm.code).toContain('v-for="item of attrs"');
    expect(ofForm.code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: item }, `swiftsearch-1-1-${item}`)",
    );
  });

  it("unref-wraps the loop source but never the loop aliases", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisRefinementList v-for="attr in attrs" :key="attr" :attribute="attr" :limit="limit" />`,
        `import { ref } from "vue";\nconst attrs = ref(["brand"]);\nconst limit = ref(10);`,
      ),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("__swiftsearchRenderList(__swiftsearchUnref(attrs),");
    // the alias stays a raw identifier inside the callback...
    expect(code).toContain("attribute: attr,");
    expect(code).not.toContain("__swiftsearchUnref(attr)");
    // ...while other setup bindings still get unwrapped
    expect(code).toContain("limit: __swiftsearchUnref(limit)");
  });

  it("passes explicit dynamic :id through and does not dedupe across loops over different sources", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisRefinementList v-for="a in attrsA" :key="a" :id="a" :attribute="a" />
    <AisRefinementList v-for="a in attrsB" :key="a" :id="a" :attribute="a" />`,
      ),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    // explicit :id used verbatim — no generated id, no injected :id attribute
    expect(code).not.toContain("swiftsearch-1-1");
    expect(code).toContain("__swiftsearchUseAisRefinementList({ attribute: a }, a)");
    const calls = code.match(/__swiftsearchUseAisRefinementList\(/g) ?? [];
    expect(calls).toHaveLength(2);
  });

  it("supports v-for on container elements wrapping multiple widgets and inner v-if", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <template v-for="c in configs" :key="c.attr">
      <AisRefinementList :attribute="c.attr" />
      <AisMenu v-if="c.menu" :attribute="c.attr" />
    </template>`,
      ),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("...__swiftsearchRenderList(__swiftsearchUnref(configs), (c) => [");
    expect(code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: c.attr }, `swiftsearch-1-1-${c.attr}`)",
    );
    // inner v-if compiles to a ternary spread with the alias left raw
    expect(code).toContain("...((c.menu) ? [");
    expect(code).toContain(
      "__swiftsearchUseAisMenu({ attribute: c.attr }, `swiftsearch-1-2-${c.attr}`)",
    );
    expect(code).toContain(".flat()");
  });

  it("supports v-for inside AisIndex children", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisIndex index="airbnb">
      <AisRefinementList v-for="a in attrs" :key="a" :attribute="a" />
    </AisIndex>`,
      ),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toMatch(/\.addWidgets\(\[[\s\S]*__swiftsearchRenderList\(/);
    expect(code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: a }, `swiftsearch-1-1-${a}`)",
    );
  });

  it("skips only the unsupported node and keeps generating the rest", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisSearchBox />
    <AisStats v-if="showStats" v-for="n in 5" />
    <AisHits />`,
      ),
    );

    // partial generation: the two supported widgets survive
    expect(code).toContain(':widgets="__swiftsearchWidgets1"');
    expect(code).toContain("__swiftsearchUseAisSearchBox(");
    expect(code).toContain("__swiftsearchUseAisHits(");
    expect(code).not.toContain("__swiftsearchUseAisStats(");

    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0]![0]);
    expect(message).toContain("/tmp/page.vue");
    expect(message).toContain("AisStats");
  });

  it("skips a widget with a static id inside a loop", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisRefinementList v-for="a in attrs" :key="a" id="fixed" :attribute="a" />
    <AisSearchBox />`,
      ),
    );

    expect(code).toContain("__swiftsearchUseAisSearchBox(");
    expect(code).not.toContain("__swiftsearchUseAisRefinementList(");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("AisRefinementList");
  });

  it("skips v-if + v-for on the same element instead of silently emitting one static widget", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisSearchBox />
    <AisStats v-if="showStats" v-for="n in 5" />`,
      ),
    );

    // regression: previously the v-for was silently ignored and a single
    // static-id widget was emitted for N rendered elements
    expect(code).not.toContain("__swiftsearchUseAisStats(");
    expect(code).toContain("__swiftsearchUseAisSearchBox(");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("v-if");
  });

  it("skips nested v-for loops", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <div v-for="g in groups" :key="g.name">
      <AisRefinementList v-for="a in g.attrs" :key="a" :attribute="a" />
    </div>
    <AisSearchBox />`,
      ),
    );

    expect(code).toContain("__swiftsearchUseAisSearchBox(");
    expect(code).not.toContain("__swiftsearchUseAisRefinementList(");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("nested v-for");
  });

  it("skips v-for on AisIndex and AisDynamicWidgets", async () => {
    const onIndex = await transform(
      sfc(
        `    <AisIndex v-for="name in indexes" :key="name" :index="name">
      <AisHits />
    </AisIndex>
    <AisSearchBox />`,
      ),
    );

    expect(onIndex.code).toContain("__swiftsearchUseAisSearchBox(");
    expect(onIndex.code).not.toContain("__swiftsearchUseAisIndex(");
    expect(onIndex.warn).toHaveBeenCalledTimes(1);
    expect(String(onIndex.warn.mock.calls[0]![0])).toContain("AisIndex");

    const onDynamic = await transform(
      sfc(
        `    <AisDynamicWidgets v-for="n in 2" :key="n">
      <AisRefinementList attribute="brand" />
    </AisDynamicWidgets>
    <AisSearchBox />`,
      ),
    );

    expect(onDynamic.code).toContain("__swiftsearchUseAisSearchBox(");
    expect(onDynamic.code).not.toContain("__swiftsearchUseAisDynamicWidgets(");
    expect(onDynamic.warn).toHaveBeenCalledTimes(1);
    expect(String(onDynamic.warn.mock.calls[0]![0])).toContain("AisDynamicWidgets");
  });

  it("skips destructured v-for aliases", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisRefinementList v-for="{ attribute } in defs" :key="attribute" :attribute="attribute" />
    <AisSearchBox />`,
      ),
    );

    expect(code).toContain("__swiftsearchUseAisSearchBox(");
    expect(code).not.toContain("__swiftsearchUseAisRefinementList(");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("AisRefinementList");
  });
});

describe("declarative widgets transform — nested components", () => {
  it("warns about childless custom components inside the root that cannot be scanned", async () => {
    const { code, warn } = await transform(
      sfc(
        `    <AisSearchBox />
    <FiltersPanel :config="cfg" />
    <NuxtLink to="/">home</NuxtLink>
    <div class="plain" />`,
      ),
    );

    // widgets in the root file are still generated
    expect(code).toContain(':widgets="__swiftsearchWidgets1"');
    expect(code).toContain("__swiftsearchUseAisSearchBox(");

    // exactly one informational warning, naming the component; native tags and
    // known framework components do not trigger it
    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0]![0]);
    expect(message).toContain("FiltersPanel");
    expect(message).not.toContain("NuxtLink");
    expect(message).not.toContain("div");
  });

  it("leaves child-component files without an AisInstantSearch root untouched", async () => {
    const source = `
<template>
  <AisRefinementList attribute="brand" />
  <AisRefinementList attribute="price" />
</template>
`;

    const { code, warn } = await transform(source);

    // pins current behavior: discovery is scoped to the file containing the
    // root, so a widgets-only child component is not transformed at all
    expect(code).toBe("");
    expect(warn).toHaveBeenCalledTimes(0);
  });
});
