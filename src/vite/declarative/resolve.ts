import { resolve, sep } from "node:path";
import type { ResolvedComponentFile, ResolveTagFn } from "./types";
import { toPascalCase } from "./widgets";

export const normalizeComponentTag = (tag: string) => (tag.includes("-") ? toPascalCase(tag) : tag);

const RELATIVE_VUE_IMPORT_RE = /import\s+([A-Za-z_$][\w$]*)\s+from\s+["'](\.\.?\/[^"']+\.vue)["']/g;

// Resolves a template tag to a component file: explicit relative .vue imports
// in the importer's scripts take precedence, then the Nuxt components registry
// (exact pascal name, then with a leading `Lazy` stripped). Files for which
// `isExcluded` returns true (dependencies, the module runtime) never resolve.
export const createTagResolver = (
  scriptContents: Array<string | undefined>,
  importerDir: string,
  registryResolve: ((name: string) => ResolvedComponentFile | undefined) | undefined,
  isExcluded: (filePath: string) => boolean,
): ResolveTagFn => {
  const localImports = new Map<string, string>();

  for (const content of scriptContents) {
    if (!content) continue;
    for (const match of content.matchAll(RELATIVE_VUE_IMPORT_RE)) {
      localImports.set(match[1]!, resolve(importerDir, match[2]!));
    }
  }

  return (rawTag) => {
    const pascal = normalizeComponentTag(rawTag);

    const local = localImports.get(pascal) ?? localImports.get(rawTag);
    if (local) {
      return isExcluded(local) ? undefined : { filePath: local, mode: "all" };
    }

    if (!registryResolve) return undefined;

    const resolved =
      registryResolve(pascal) ??
      (pascal.startsWith("Lazy") ? registryResolve(pascal.slice(4)) : undefined);

    if (resolved && resolved.filePath.endsWith(".vue") && !isExcluded(resolved.filePath)) {
      return resolved;
    }

    return undefined;
  };
};

// Dependencies and the module's own runtime components never contain user widgets.
export const createExclusionCheck = (exclude: string[] = []) => {
  const prefixes = exclude.map((dir) => (dir.endsWith(sep) ? dir : dir + sep));
  return (filePath: string) =>
    filePath.includes(`${sep}node_modules${sep}`) ||
    prefixes.some((prefix) => filePath.startsWith(prefix));
};
