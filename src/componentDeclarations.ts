import { existsSync } from "node:fs";

interface ComponentEntry {
  filePath: string;
  declarationPath?: string;
}

/**
 * The module build removes the TypeScript from the runtime `.vue` files and
 * writes the types to a `<name>.vue.d.ts` file next to each one. Nuxt writes
 * `.nuxt/types/components.d.ts` from `declarationPath`, else from `filePath`.
 * Without a `declarationPath`, a type checker that reads `.vue` files (for
 * example the TS 7.1 content mapper) infers the slot and prop types from the
 * untyped `.vue` file.
 *
 * This function sets `declarationPath` to the `.vue.d.ts` file for each
 * component in `componentsDir` that has one. In development the components
 * come from `src/` with their TypeScript and have no `.vue.d.ts` file, so this
 * function does not change them.
 */
export const applyTypedComponentDeclarations = (
  components: ComponentEntry[],
  componentsDir: string,
  fileExists: (path: string) => boolean = existsSync,
) => {
  for (const component of components) {
    if (!component.filePath.startsWith(componentsDir) || !component.filePath.endsWith(".vue")) {
      continue;
    }
    const declarationPath = `${component.filePath}.d.ts`;
    if (fileExists(declarationPath)) {
      component.declarationPath = declarationPath;
    }
  }
};
