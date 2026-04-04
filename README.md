# Nuxt Swiftsearch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A tailor-made Nuxt 4 module for Algolia InstantSearch with strong Vue InstantSearch parity.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/@atoms-studio/nuxt-swiftsearch?file=playground%2Fapp.vue) -->
- [📖 &nbsp;Documentation](https://nuxt-swiftsearch.netlify.app)

## Features

- 🍀 &nbsp;SSR First, client only on demand, as is any other nuxt component
- 🗼 &nbsp;Centralized state, you can tap into it from anywhere in your app
- 🌲 &nbsp;Near-full parity with vue-instantsearch widget APIs
- 👮 &nbsp;Typed components

## v1 release

`@atoms-studio/nuxt-swiftsearch@1.x` is now live on the `latest` npm dist-tag.

- Install stable:

```bash
bun add @atoms-studio/nuxt-swiftsearch
```

- Track prereleases:

```bash
bun add @atoms-studio/nuxt-swiftsearch@beta
```

## What's in v1

- ✅ &nbsp;Nuxt 4-first SSR architecture with deterministic widget tree ownership
- 🧠 &nbsp;Compile-time declarative transform that generates `:widgets`
- 🧩 &nbsp;Scoped widget IDs with explicit `indexId` isolation rules
- 🛣️ &nbsp;Nuxt-first router state sync through `useAisRouter()`
- 🧪 &nbsp;Expanded parity/e2e coverage against Vue InstantSearch fixtures

## Vue InstantSearch compatibility

Swiftsearch v1 tracks `vue-instantsearch@4.24.3` parity:

- 36/37 upstream widgets are implemented with equivalent behavior
- `AisInstantSearchSsr` is intentionally not a separate component because SSR is built into `AisInstantSearch`
- `AisConfigureRelatedItems` is available as a compatibility alias for `AisExperimentalConfigureRelatedItems`

See full matrix and audit details in `docs/content/1.getting-started/6.widget-coverage-upstream-audit.md`.

## Quick Setup

1. Add `@atoms-studio/nuxt-swiftsearch` dependency to your project

```bash
bun add @atoms-studio/nuxt-swiftsearch
```

Or use Nuxt's module command:

```bash
npx nuxi@latest module add swiftsearch
```

2. Add `@atoms-studio/nuxt-swiftsearch` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ["@atoms-studio/nuxt-swiftsearch"],
});
```

That's it! You can now use Nuxt Swiftsearch in your Nuxt app ✨

## Development

```bash
# Install dependencies
bun install

# Generate type stubs
bun run dev:prepare

# Develop with the playground
bun run dev

# Build the playground
bun run dev:build

# Run Oxlint and Oxfmt check
bun run lint
bun run format:check

# Run Vitest
bun run test
bun run test:watch

# Release new version
bun run release

# Start next premajor beta channel (ex: 2.0.0-beta.0)
bun run release:beta

# Publish next beta iteration (ex: 2.0.0-beta.1)
bun run release:beta:next
```

## GitHub release workflow

This repo also includes a manual GitHub Actions workflow at `.github/workflows/release.yml`.

- Choose a `stable-*` option to publish to `latest`.
- Choose `beta-start-v1` to start the next premajor beta line on the `beta` dist-tag.
- Choose `beta-next` to publish the next prerelease iteration on `beta`.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@atoms-studio/nuxt-swiftsearch/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[npm-downloads-src]: https://img.shields.io/npm/dm/@atoms-studio/nuxt-swiftsearch.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[license-src]: https://img.shields.io/npm/l/@atoms-studio/nuxt-swiftsearch.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
