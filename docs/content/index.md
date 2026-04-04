---
seo:
  title: Build fast Nuxt search with Swiftsearch
  description: SSR-first Algolia InstantSearch for Nuxt with declarative widgets,
    multi-index isolation, typed APIs, and strong Vue InstantSearch parity.
---

::u-page-hero
#headline
:::u-button

---

size: sm
to: https://www.npmjs.com/package/@atoms-studio/nuxt-swiftsearch
variant: outline

---

Nuxt Swiftsearch v1 ->
:::

#title
Build fast Nuxt search with Algolia.

#description
Nuxt Swiftsearch gives you SSR-first InstantSearch for Nuxt, declarative widgets, and strong vue-instantsearch parity without sacrificing control.

#links
:::u-button

---

color: neutral
size: xl
to: /getting-started/installation
trailing-icon: i-lucide-arrow-right

---

Get started
:::

:::u-button

---

color: neutral
icon: i-simple-icons-github
size: xl
to: https://github.com/atoms-studio/nuxt-swiftsearch
variant: outline

---

Star on GitHub
:::
::

::u-page-section
:::u-page-grid
::::u-page-card
---
spotlight: true
class: col-span-2 lg:col-span-1
to: /getting-started/usage
---
#title
SSR-first by default

    #description
    InstantSearch widgets are resolved from a parent-owned instance, so SSR and hydration stay deterministic in Nuxt apps.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /getting-started/declarative-transform
    ---
    #title
    Declarative widgets

    #description
    Write components like `<AisHits />` directly in `<AisInstantSearch>` and let the compile-time transform generate `:widgets` for you.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---
      :::::tabs
        ::::::tabs-item{.mt-5 icon="i-lucide-sparkles" label="Declarative"}
        ```vue [app.vue]
        <AisInstantSearch index-name="products">
          <AisSearchBox />
          <AisRefinementList attribute="brand" />
          <AisHits />
        </AisInstantSearch>
        ```
        ::::::

        ::::::tabs-item
        ---
        class: mt-5 mb-2 text-xs overflow-x-auto
        icon: i-lucide-code
        label: Manual widgets
        ---
        ```ts [search.ts]
        import { useAisInstantSearch } from "#imports"

        const search = useAisInstantSearch()
        // Add connectors/widgets manually when you need full control
        ```
        ::::::
      :::::

    #title
    Start declarative, drop to manual when needed

    #description
    Swiftsearch keeps both styles first-class, so teams can move quickly and still handle advanced custom search UIs.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 md:col-span-1
    to: /examples/multi-index-isolation
    ---
    #title
    Multi-index isolation

    #description
    Scoped widget state with explicit `indexId` avoids cross-index leakage when the same widget type appears in multiple indices.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 md:col-span-1
    to: /composables/use-ais-router
    ---
    #title
    Nuxt-first routing sync

    #description
    Use `useAisRouter()` to keep filters, queries, and pagination in URL state with Nuxt-native navigation behavior.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    to: /getting-started/widget-coverage-upstream-audit
    ---
    ```mdc
    ::note
    Swiftsearch tracks `vue-instantsearch@4.24.3` parity.
    ::

    ::tip
    36 of 37 upstream widgets are implemented with equivalent behavior.
    ::

    ::caution
    `AisInstantSearchSsr` is intentionally merged into `AisInstantSearch` in Swiftsearch.
    ::
    ```

    #title
    Strong Vue InstantSearch compatibility

    #description
    Migration feels familiar for existing InstantSearch teams while still embracing Nuxt-first patterns.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---
    ```ts [nuxt.config.ts]
    export default defineNuxtConfig({
      modules: ["@atoms-studio/nuxt-swiftsearch"],
    })
    ```

    #title
    Add the module and go

    #description
    Setup is minimal, typed APIs are included, and examples cover faceted layouts, route-driven filters, autocomplete, analytics, and more.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---
      :::::div{.flex.flex-col.items-center.justify-center.py-8.text-center.gap-3}
        ::::::u-button
        ---
        color: primary
        size: lg
        to: /examples
        trailing-icon: i-lucide-arrow-right
        ---
        Explore examples
        ::::::

        ::::::u-button
        ---
        color: neutral
        icon: i-simple-icons-github
        size: lg
        target: _blank
        to: https://github.com/atoms-studio/nuxt-swiftsearch
        variant: outline
        ---
        View repository
        ::::::
      :::::

    #title
    Ready to build search experiences?

    #description
    Follow the installation guide, then compose your own InstantSearch UI with declarative components or manual widgets.
    ::::

:::
::
