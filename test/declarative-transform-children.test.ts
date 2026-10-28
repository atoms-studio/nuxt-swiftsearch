import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aisDeclarativeWidgetsPlugin } from "../src/vite/aisDeclarativeWidgetsPlugin";
import { clearProviderCache } from "../src/vite/declarative/provider";
import type { PluginOptions } from "../src/vite/declarative/types";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "swiftsearch-children-"));
  clearProviderCache();
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const write = (name: string, content: string) => {
  const filePath = join(dir, name);
  writeFileSync(filePath, content);
  return filePath;
};

const transform = async (code: string, id: string, options: PluginOptions = {}) => {
  const plugin = aisDeclarativeWidgetsPlugin(options);
  const warn = vi.fn<(warning: unknown) => void>();
  const addWatchFile = vi.fn<(file: string) => void>();
  const transformHook = plugin.transform;
  const transformHandler =
    typeof transformHook === "function" ? transformHook : transformHook?.handler;

  const result = await transformHandler?.call({ warn, addWatchFile } as any, code, id);

  return {
    code: result ? (typeof result === "string" ? result : result.code) : "",
    warn,
    addWatchFile,
  };
};

const registryFor = (entries: Record<string, string>): PluginOptions => ({
  childWidgetDiscovery: true,
  resolveComponent: (name) =>
    entries[name] ? { filePath: entries[name]!, mode: "all" as const } : undefined,
});

const FILTERS_PANEL = `
<template>
  <div class="panel">
    <AisRefinementList :attribute="attribute" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ attribute: string }>();
</script>
`;

const parentPage = (template: string, script = "") => `
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

describe("cross-file widget discovery — flag off (default)", () => {
  it("leaves child provider files untouched and keeps the unscannable warning on the parent", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);

    const child = await transform(FILTERS_PANEL, childPath);
    expect(child.code).toBe("");

    const parent = await transform(
      parentPage(`    <AisSearchBox />\n    <FiltersPanel attribute="brand" />`),
      join(dir, "Page.vue"),
    );

    expect(parent.code).not.toContain("__swiftsearchProvider");
    expect(parent.warn).toHaveBeenCalledTimes(1);
    expect(String(parent.warn.mock.calls[0]![0])).toContain("FiltersPanel");
  });
});

describe("cross-file widget discovery — child provider transform", () => {
  const options: PluginOptions = { childWidgetDiscovery: true };

  it("exports a props-parameterized widget factory from a plain script block", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);
    const { code, warn } = await transform(FILTERS_PANEL, childPath, options);

    expect(warn).toHaveBeenCalledTimes(0);
    // factory in a plain script block with matching lang
    expect(code).toContain('<script lang="ts">');
    expect(code).toContain(
      "export const __swiftsearchWidgets = (__props, __swiftsearchIdPrefix) => [",
    );
    expect(code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: __props.attribute }, `${__swiftsearchIdPrefix}-1`)",
    );
    expect(code).toContain(
      'import { useAisRefinementList as __swiftsearchUseAisRefinementList } from "#imports";',
    );
    // template id binding: prefix-guarded, undefined fallback for standalone use
    expect(code).toContain(
      ":id=\"$attrs['data-swiftsearch-id-prefix'] != null ? `${$attrs['data-swiftsearch-id-prefix']}-1` : undefined\"",
    );
  });

  it("appends a script block without lang when the child has no script", async () => {
    const source = `
<template>
  <AisRefinementList attribute="brand" />
</template>
`;
    const childPath = write("Static.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("<script>");
    expect(code).toContain(
      '__swiftsearchUseAisRefinementList({ attribute: "brand" }, `${__swiftsearchIdPrefix}-1`)',
    );
  });

  it("compiles renamed destructured props through the props alias map", async () => {
    const source = `
<template>
  <AisRefinementList :attribute="attr" />
</template>

<script setup lang="ts">
const { attribute: attr } = defineProps<{ attribute: string }>();
</script>
`;
    const childPath = write("Aliased.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(warn).toHaveBeenCalledTimes(0);
    // the local alias `attr` resolves to the declared prop name
    expect(code).toContain("attribute: __props.attribute");
  });

  it("bails nodes whose expressions use component-local state, keeping siblings", async () => {
    const source = `
<template>
  <AisRefinementList :attribute="attribute" :limit="localLimit" />
  <AisStats />
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ attribute: string }>();
const localLimit = ref(10);
</script>
`;
    const childPath = write("LocalState.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(code).toContain("__swiftsearchUseAisStats({},");
    expect(code).not.toContain("__swiftsearchUseAisRefinementList(");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("localLimit");
  });

  it("supports child-local v-for over a prop", async () => {
    const source = `
<template>
  <AisRefinementList v-for="a in attributes" :key="a" :attribute="a" />
</template>

<script setup lang="ts">
const props = defineProps<{ attributes: string[] }>();
</script>
`;
    const childPath = write("Looped.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("...__swiftsearchRenderList(__props.attributes, (a) => [");
    // the :key gives ids that follow the item, not its position
    expect(code).toContain(
      "__swiftsearchUseAisRefinementList({ attribute: a }, `${__swiftsearchIdPrefix}-1-${a}`)",
    );
  });

  it("warns about static explicit ids shared across all instances but still generates", async () => {
    const source = `
<template>
  <AisStats id="fixed-stats" />
</template>
`;
    const childPath = write("StaticId.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(code).toContain('__swiftsearchUseAisStats({}, "fixed-stats")');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("fixed-stats");
  });

  it("skips only the chain whose condition is unhoistable, never a later sibling", async () => {
    // Regression: a bail recorded while the transform read the rest of a
    // broken v-if chain was attributed to the next, unrelated element.
    const source = `
<template>
  <AisMenu v-if="open" attribute="a" />
  <AisMenu v-else-if="localA" attribute="b" />
  <AisMenu v-else-if="localB" attribute="c" />
  <AisStats />
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ open: boolean }>();
const localA = ref(true);
const localB = ref(true);
</script>
`;
    const childPath = write("Chain.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(code).toContain("__swiftsearchUseAisStats({},");
    expect(code).not.toContain("__swiftsearchUseAisMenu(");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("localA");
  });

  it("hoists value imports, so a shared filter config can drive the widgets", async () => {
    const source = `
<template>
  <AisRefinementList v-for="attribute in FILTERS[index]" :key="attribute" :attribute="attribute" />
</template>

<script setup lang="ts">
import { FILTERS } from "./filters";
import type { FilterConfig } from "./filters";
const props = defineProps<{ index: string }>();
</script>
`;
    const childPath = write("ConfigDriven.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain(
      "...__swiftsearchRenderList(__swiftsearchUnref(FILTERS)[__props.index], (attribute) => [",
    );
    expect(code).toContain("`${__swiftsearchIdPrefix}-1-${attribute}`");
  });

  it("does not hoist type-only imports", async () => {
    const source = `
<template>
  <AisRefinementList :attribute="Attr" />
</template>

<script setup lang="ts">
import type { Attr } from "./types";
</script>
`;
    const childPath = write("TypeOnly.vue", source);
    const { code, warn } = await transform(source, childPath, options);

    expect(code).not.toContain("__swiftsearchUseAisRefinementList(");
    expect(String(warn.mock.calls[0]![0])).toContain("`Attr`");
  });
});

describe("cross-file widget discovery — parent bridging", () => {
  it("resolves relative script imports, imports the factory and passes props + prefix", async () => {
    write("FiltersPanel.vue", FILTERS_PANEL);
    const source = parentPage(
      `    <AisSearchBox />\n    <FiltersPanel attribute="brand" :limit="limitRef" />`,
      `import FiltersPanel from "./FiltersPanel.vue";\nimport { ref } from "vue";\nconst limitRef = ref(5);`,
    );

    const { code, warn, addWatchFile } = await transform(source, join(dir, "Page.vue"), {
      childWidgetDiscovery: true,
    });

    expect(code).toContain(
      'import { __swiftsearchWidgets as __swiftsearchProvider1 } from "./FiltersPanel.vue";',
    );
    // SearchBox consumed counter 1, the component consumes 2
    expect(code).toContain(
      '...__swiftsearchProvider1({ attribute: "brand", limit: __swiftsearchUnref(limitRef) }, "swiftsearch-1-2")',
    );
    expect(code).toContain(' data-swiftsearch-id-prefix="swiftsearch-1-2"');
    expect(addWatchFile).toHaveBeenCalledWith(join(dir, "FiltersPanel.vue"));
    // child factory reads `attribute`, parent passes it, plus `limit` extra — no missing-prop warning
    expect(warn).toHaveBeenCalledTimes(0);
  });

  it("resolves via the injected registry, including kebab and Lazy variants", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);
    const options = registryFor({ FiltersPanel: childPath });

    const pascal = await transform(
      parentPage(`    <FiltersPanel attribute="brand" />`),
      join(dir, "PagePascal.vue"),
      options,
    );
    expect(pascal.code).toContain("__swiftsearchProvider1({");

    const kebab = await transform(
      parentPage(`    <filters-panel attribute="brand" />`),
      join(dir, "PageKebab.vue"),
      options,
    );
    expect(kebab.code).toContain("__swiftsearchProvider1({");

    const lazy = await transform(
      parentPage(`    <LazyFiltersPanel attribute="brand" />`),
      join(dir, "PageLazy.vue"),
      options,
    );
    expect(lazy.code).toContain("__swiftsearchProvider1({");
  });

  it("gives each instance of the same child a distinct prefix with a single import", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);
    const { code, warn } = await transform(
      parentPage(
        `    <FiltersPanel attribute="brand" />\n    <FiltersPanel attribute="categories" />`,
      ),
      join(dir, "Page.vue"),
      registryFor({ FiltersPanel: childPath }),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    const imports = code.match(/import \{ __swiftsearchWidgets as/g) ?? [];
    expect(imports).toHaveLength(1);
    expect(code).toContain('...__swiftsearchProvider1({ attribute: "brand" }, "swiftsearch-1-1")');
    expect(code).toContain(
      '...__swiftsearchProvider1({ attribute: "categories" }, "swiftsearch-1-2")',
    );
    expect(code).toContain(' data-swiftsearch-id-prefix="swiftsearch-1-1"');
    expect(code).toContain(' data-swiftsearch-id-prefix="swiftsearch-1-2"');
  });

  it("composes with v-for on the child component", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);
    const { code, warn } = await transform(
      parentPage(`    <FiltersPanel v-for="attr in attrs" :key="attr" :attribute="attr" />`),
      join(dir, "Page.vue"),
      registryFor({ FiltersPanel: childPath }),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain("...__swiftsearchRenderList(__swiftsearchUnref(attrs), (attr) => [");
    expect(code).toContain(
      "...__swiftsearchProvider1({ attribute: attr }, `swiftsearch-1-1-${attr}`)",
    );
    expect(code).toContain(':data-swiftsearch-id-prefix="`swiftsearch-1-1-${attr}`"');
  });

  it("collects slot content in the parent scope alongside the child factory", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);
    const { code, warn } = await transform(
      parentPage(`    <FiltersPanel attribute="brand">\n      <AisStats />\n    </FiltersPanel>`),
      join(dir, "Page.vue"),
      registryFor({ FiltersPanel: childPath }),
    );

    expect(warn).toHaveBeenCalledTimes(0);
    expect(code).toContain('...__swiftsearchProvider1({ attribute: "brand" }, "swiftsearch-1-1")');
    // slot content stays parent-scope with a parent-counter id
    expect(code).toContain('__swiftsearchUseAisStats({}, "swiftsearch-1-2")');
  });

  it("bridges through widgetless components to grandchildren", async () => {
    write(
      "GrandFilters.vue",
      `
<template>
  <AisRefinementList :attribute="foo" />
</template>

<script setup lang="ts">
const props = defineProps<{ foo: string }>();
</script>
`,
    );
    const bridgeSource = `
<template>
  <section>
    <GrandFilters :foo="limit" />
  </section>
</template>

<script setup lang="ts">
import GrandFilters from "./GrandFilters.vue";
const props = defineProps<{ limit: string }>();
</script>
`;
    const bridgePath = write("Bridge.vue", bridgeSource);

    // the bridge itself becomes a provider that spreads the grandchild factory
    const bridge = await transform(bridgeSource, bridgePath, { childWidgetDiscovery: true });
    expect(bridge.code).toContain(
      "export const __swiftsearchWidgets = (__props, __swiftsearchIdPrefix) => [",
    );
    expect(bridge.code).toContain(
      "...__swiftsearchProvider1({ foo: __props.limit }, `${__swiftsearchIdPrefix}-1`)",
    );
    expect(bridge.code).toContain(
      ":data-swiftsearch-id-prefix=\"$attrs['data-swiftsearch-id-prefix'] != null ? `${$attrs['data-swiftsearch-id-prefix']}-1` : undefined\"",
    );

    // the parent treats the bridge as a provider
    const parent = await transform(
      parentPage(`    <Bridge limit="brand" />`, `import Bridge from "./Bridge.vue";`),
      join(dir, "Page.vue"),
      { childWidgetDiscovery: true },
    );
    expect(parent.code).toContain(
      '...__swiftsearchProvider1({ limit: "brand" }, "swiftsearch-1-1")',
    );
    expect(parent.warn).toHaveBeenCalledTimes(0);
  });

  it("breaks provider cycles with a warning instead of recursing forever", async () => {
    const aSource = `
<template>
  <AisStats />
  <CycleB />
</template>

<script setup lang="ts">
import CycleB from "./CycleB.vue";
</script>
`;
    const bSource = `
<template>
  <AisHits />
  <CycleA />
</template>

<script setup lang="ts">
import CycleA from "./CycleA.vue";
</script>
`;
    const aPath = write("CycleA.vue", aSource);
    write("CycleB.vue", bSource);

    const { code, warn } = await transform(aSource, aPath, { childWidgetDiscovery: true });

    // A's own widgets survive; the cyclic edge is dropped with a warning
    expect(code).toContain("__swiftsearchUseAisStats({},");
    expect(code).not.toContain("__swiftsearchProvider");
    expect(warn.mock.calls.some((call) => String(call[0]).includes("CycleB"))).toBe(true);
  });

  it("keeps the unscannable warning for unresolvable tags when the flag is on", async () => {
    const { code, warn } = await transform(
      parentPage(`    <AisSearchBox />\n    <MysteryPanel :config="cfg" />`),
      join(dir, "Page.vue"),
      { childWidgetDiscovery: true },
    );

    expect(code).toContain(':widgets="__swiftsearchWidgets1"');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("MysteryPanel");
  });

  it("does not resolve server components and warns specifically", async () => {
    const childPath = write("ServerPanel.vue", FILTERS_PANEL);
    const { code, warn } = await transform(
      parentPage(`    <AisSearchBox />\n    <ServerPanel attribute="brand" />`),
      join(dir, "Page.vue"),
      {
        childWidgetDiscovery: true,
        resolveComponent: (name) =>
          name === "ServerPanel" ? { filePath: childPath, mode: "server" as const } : undefined,
      },
    );

    expect(code).not.toContain("__swiftsearchProvider");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("server");
  });

  it("warns when the child factory references a prop the parent does not pass", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);

    const missing = await transform(
      parentPage(`    <FiltersPanel />`),
      join(dir, "PageMissing.vue"),
      registryFor({ FiltersPanel: childPath }),
    );
    expect(missing.warn).toHaveBeenCalledTimes(1);
    expect(String(missing.warn.mock.calls[0]![0])).toContain("attribute");

    // a v-bind spread makes prop presence statically unknowable — no warning
    const spread = await transform(
      parentPage(`    <FiltersPanel v-bind="panelProps" />`),
      join(dir, "PageSpread.vue"),
      registryFor({ FiltersPanel: childPath }),
    );
    expect(spread.warn).toHaveBeenCalledTimes(0);
  });

  it("re-analyzes a child when its file changes on disk", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);
    const options = registryFor({ FiltersPanel: childPath });
    const page = parentPage(`    <FiltersPanel attribute="brand" />`);

    expect((await transform(page, join(dir, "Page.vue"), options)).code).toContain(
      "__swiftsearchProvider1(",
    );

    write("FiltersPanel.vue", `<template><div /></template>`);
    expect((await transform(page, join(dir, "Page.vue"), options)).code).toBe("");
  });

  it("never resolves components from node_modules or excluded directories", async () => {
    mkdirSync(join(dir, "node_modules", "ui"), { recursive: true });
    mkdirSync(join(dir, "runtime"), { recursive: true });
    const dependencyPath = write("node_modules/ui/Panel.vue", FILTERS_PANEL);
    const runtimePath = write("runtime/Internal.vue", FILTERS_PANEL);
    const options: PluginOptions = {
      ...registryFor({ UiPanel: dependencyPath, Internal: runtimePath }),
      exclude: [join(dir, "runtime")],
    };

    const { code, warn } = await transform(
      parentPage(`    <UiPanel attribute="brand" />
    <Internal attribute="brand" />
    <AisStats />`),
      join(dir, "Page.vue"),
      options,
    );

    expect(code).not.toContain("__swiftsearchProvider");
    expect(String(warn.mock.calls[0]![0])).toContain("<UiPanel>, <Internal>");

    // excluded files are never transformed as providers either
    expect((await transform(FILTERS_PANEL, dependencyPath, options)).code).toBe("");
    expect((await transform(FILTERS_PANEL, runtimePath, options)).code).toBe("");
  });

  it("leaves manual :widgets roots untouched even with resolvable children", async () => {
    const childPath = write("FiltersPanel.vue", FILTERS_PANEL);
    const source = `
<template>
  <AisInstantSearch :configuration="configuration" :widgets="widgets">
    <FiltersPanel attribute="brand" />
  </AisInstantSearch>
</template>

<script setup lang="ts">
const widgets = [] as any[];
const configuration = {} as any;
</script>
`;

    const { code, warn } = await transform(
      source,
      join(dir, "Page.vue"),
      registryFor({ FiltersPanel: childPath }),
    );

    expect(code).toBe("");
    expect(warn).toHaveBeenCalledTimes(0);
  });
});
