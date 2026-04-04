---
seo:
  title: Nuxt Swiftsearch
  description: SSR-first Algolia InstantSearch for Nuxt with declarative widgets,
    multi-index isolation, and vue-instantsearch-like DX.
---

::u-page-hero
#title
Nuxt Swiftsearch

#description
SSR-first Algolia InstantSearch for Nuxt, with declarative widget syntax and full manual-widget compatibility.

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
size: xl
to: /examples
variant: outline

---

Examples
:::

:::u-button

---

color: neutral
icon: i-simple-icons-github
size: xl
to: https://github.com/atoms-studio/nuxt-swiftsearch
variant: outline

---

View on GitHub
:::
::

::u-page-section
#title
Why teams use it

#features
:::u-page-feature

---

icon: i-lucide-server

---

#title
SSR-first architecture

#description
Widgets are resolved from a parent-owned InstantSearch instance so SSR and hydration stay deterministic.
:::

:::u-page-feature

---

icon: i-lucide-code

---

#title
Declarative widgets

#description
Write `<AisHits />` directly in `<AisInstantSearch>` and let the Vite transform generate `:widgets`.
:::

:::u-page-feature

---

icon: i-lucide-layers

---

#title
Multi-index isolation

#description
Scoped state resolution with `indexId` prevents cross-index leakage for duplicated widget types.
:::

:::u-page-feature

---

icon: i-simple-icons-algolia

---

#title
Vue InstantSearch parity

#description
Declarative DX and widget output are validated against vue-instantsearch parity fixtures.
:::
::
