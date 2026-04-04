---
seo:
  title: Build fast Nuxt search with Swiftsearch
  description: SSR-first Algolia InstantSearch for Nuxt with declarative widgets, multi-index isolation, typed APIs, and strong Vue InstantSearch parity.
---

::u-page-hero
#title
Build fast Nuxt search with [Algolia]{.text-primary}.

#description
SSR-first Algolia InstantSearch for Nuxt with declarative widgets, multi-index isolation, and strong vue-instantsearch parity — without sacrificing control.

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
  target: _blank
  ---
  Star on GitHub
  :::

#headline
  :::u-button
  ---
  size: sm
  to: https://www.npmjs.com/package/@atoms-studio/nuxt-swiftsearch
  variant: outline
  target: _blank
  ---
  Available on npm →
  :::
::

::u-page-section
  :::u-page-grid
    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---

    ```ts [nuxt.config.ts]
    export default defineNuxtConfig({
      modules: ["@atoms-studio/nuxt-swiftsearch"],
    });
    ```

    #title
    One module, [zero boilerplate]{.text-primary}

    #description
    Add `@atoms-studio/nuxt-swiftsearch` to your Nuxt config and you're ready to go. SSR, hydration, and widget registration are handled automatically — no manual setup required.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    ---

    #title
    [SSR-first]{.text-primary} by default

    #description
    `AisInstantSearch` owns widget registration, so SSR output and hydration remain deterministic. Your search results render on the server and hydrate seamlessly on the client — great for SEO and perceived performance.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    ---

    #title
    [Declarative]{.text-primary} widgets

    #description
    Author `<AisHits />`, `<AisSearchBox />`, `<AisRefinementList />`, and 30+ other widgets directly in your Vue templates. No imperative API calls, no widget factories — just components.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    ---

    #title
    [Multi-index]{.text-primary} isolation

    #description
    Use explicit `indexId` scoping to query multiple Algolia indices side by side without state leakage. Perfect for autocomplete, federated search, or dashboards with independent search contexts.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    ---

    #title
    Nuxt-native [URL sync]{.text-primary}

    #description
    `useAisRouter()` keeps query, filters, and pagination in route state. Users can share search URLs, use the back button naturally, and your search state survives page reloads.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---

    ::note
    Swiftsearch tracks `vue-instantsearch@4.24.3` parity.
    ::

    ::tip
    36 of 37 upstream widgets are implemented with equivalent behavior.
    ::

    ::caution
    `AisInstantSearchSsr` is intentionally merged into `AisInstantSearch` in Swiftsearch — one component handles both SSR and client rendering.
    ::

    #title
    [36 of 37]{.text-primary} widgets — near-complete vue-instantsearch parity

    #description
    Swiftsearch mirrors the full vue-instantsearch widget catalog. From `AisHits` and `AisRefinementList` to `AisDynamicWidgets` and `AisVoiceSearch`, the API surface matches upstream so migration is straightforward.
    ::::

  :::
::
