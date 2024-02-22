# Nuxt Swiftsearch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A tailor made implementation of algolia instantsearch for nuxt 3.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/@atoms-studio/nuxt-swiftsearch?file=playground%2Fapp.vue) -->
  <!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- 🍀 &nbsp;SSR First, client only on demand, as is any other nuxt component
- 🗼 &nbsp;Centralized state, you can tap into it from anywhere in your app
- 🌲 &nbsp;99% compatible with vue-instantsearch current implementation
- 👮 &nbsp;Typed components

## Quick Setup

1. Add `@atoms-studio/nuxt-swiftsearch` dependency to your project

```bash
# Using pnpm
pnpm add -D @atoms-studio/nuxt-swiftsearch

# Using yarn
yarn add --dev @atoms-studio/nuxt-swiftsearch

# Using npm
npm install --save-dev @atoms-studio/nuxt-swiftsearch

# Using bun
bun add -D @atoms-studio/nuxt-swiftsearch
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
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@atoms-studio/nuxt-swiftsearch/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[npm-downloads-src]: https://img.shields.io/npm/dm/@atoms-studio/nuxt-swiftsearch.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[license-src]: https://img.shields.io/npm/l/@atoms-studio/nuxt-swiftsearch.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@atoms-studio/nuxt-swiftsearch
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
