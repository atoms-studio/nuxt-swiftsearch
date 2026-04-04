# Nuxt Swiftsearch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A tailor made implementation of algolia instantsearch for nuxt 3.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/@atoms-studio/nuxt-swiftsearch?file=playground%2Fapp.vue) -->
- [📖 &nbsp;Documentation](https://nuxt-swiftsearch.netlify.app)

## Features

- 🍀 &nbsp;SSR First, client only on demand, as is any other nuxt component
- 🗼 &nbsp;Centralized state, you can tap into it from anywhere in your app
- 🌲 &nbsp;99% compatible with vue-instantsearch current implementation
- 👮 &nbsp;Typed components

## Quick Setup

1. Add `@atoms-studio/nuxt-swiftsearch` dependency to your project

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

## Try v1 beta

If you want to test the upcoming v1 beta channel:

```bash
bun add @atoms-studio/nuxt-swiftsearch@beta
```

This installs the npm `beta` dist-tag, so stable users on `latest` are not impacted.

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

# Start v1 beta channel (ex: 1.0.0-beta.0)
bun run release:beta

# Publish next beta iteration (ex: 1.0.0-beta.1)
bun run release:beta:next
```

## GitHub release workflow

This repo also includes a manual GitHub Actions workflow at `.github/workflows/release.yml`.

- Choose `beta-start-v1` to publish `1.0.0-beta.0` on the `beta` npm dist-tag.
- Choose `beta-next` to publish the next prerelease (`1.0.0-beta.x`) on `beta`.
- Choose a `stable-*` option to publish to `latest`.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@atoms-studio/nuxt-swiftsearch/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[npm-downloads-src]: https://img.shields.io/npm/dm/@atoms-studio/nuxt-swiftsearch.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[license-src]: https://img.shields.io/npm/l/@atoms-studio/nuxt-swiftsearch.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
