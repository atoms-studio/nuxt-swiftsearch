import { parse as parseTemplate } from "@vue/compiler-dom";
import { parse as parseSFC } from "@vue/compiler-sfc";
import MagicString from "magic-string";
import type { Plugin } from "vite";
import { collectWidgets } from "./declarative/collector";
import { SWIFTSEARCH_UNREF_ALIAS } from "./declarative/expression";
import {
  findInstantSearchRoots,
  getTagAttributeInsertIndex,
  hasWidgetsProp,
  indent,
} from "./declarative/template";
import type { GenerationContext, TemplateEdit } from "./declarative/types";

const toMainVueId = (id: string) => id.split("?", 1)[0] || id;

export const aisDeclarativeWidgetsPlugin = (): Plugin => {
  return {
    name: "nuxt-swiftsearch:declarative-widgets",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("?")) {
        return;
      }

      const normalizedId = toMainVueId(id);
      if (!normalizedId.endsWith(".vue")) {
        return;
      }

      if (!/<AisInstantSearch|<ais-instant-search/.test(code)) {
        return;
      }

      if (/from\s+["']vue-instantsearch/.test(code)) {
        return;
      }

      const { descriptor, errors } = parseSFC(code, { filename: normalizedId });
      if (errors.length || !descriptor.template) {
        return;
      }

      const template = descriptor.template;
      const templateAst = parseTemplate(template.content, { comments: false });
      const instantSearchNodes = findInstantSearchRoots(templateAst.children);

      if (!instantSearchNodes.length) {
        return;
      }

      const scriptStatements: string[] = [];
      const edits: TemplateEdit[] = [];
      const aliasByComposable = new Map<string, string>();
      const usedComposables = new Set<string>();
      const computedAlias = "__swiftsearchComputed";

      let rootIndex = 0;
      let needsUnref = false;

      for (const instantSearchNode of instantSearchNodes) {
        rootIndex += 1;

        if (hasWidgetsProp(instantSearchNode)) {
          continue;
        }

        const rootEdits: TemplateEdit[] = [];
        const rootUsedComposables = new Set<string>();

        const context: GenerationContext = {
          templateOffset: template.loc.start.offset,
          rootIndex,
          edits: rootEdits,
          usedComposables: rootUsedComposables,
          aliasByComposable,
          idCounter: 0,
          indexCounter: 0,
          unsupported: false,
          usesUnref: false,
        };

        const widgetExpressions = collectWidgets(instantSearchNode.children, context);

        if (context.unsupported || !widgetExpressions.length) {
          this.warn(
            `[nuxt-swiftsearch] Skipping declarative widget transform for ${normalizedId}: unsupported dynamic widget structure.`,
          );
          continue;
        }

        const insertIndex = getTagAttributeInsertIndex(
          instantSearchNode,
          template.loc.start.offset,
        );

        if (insertIndex === null) {
          continue;
        }

        const widgetsBinding = `__swiftsearchWidgets${rootIndex}`;
        edits.push(...rootEdits);
        edits.push({
          index: insertIndex,
          content: ` :widgets="${widgetsBinding}"`,
        });

        rootUsedComposables.forEach((composable) => {
          usedComposables.add(composable);
        });

        if (context.usesUnref) {
          needsUnref = true;
        }

        const widgetsArray = widgetExpressions
          .map((expression) => indent(expression, 4))
          .join(",\n");

        scriptStatements.push(
          `const ${widgetsBinding} = ${computedAlias}(() => [\n${widgetsArray}\n]);`,
        );
      }

      if (!scriptStatements.length) {
        return;
      }

      const s = new MagicString(code);

      edits
        .slice()
        .sort((left, right) => left.index - right.index)
        .forEach((edit) => {
          s.appendLeft(edit.index, edit.content);
        });

      const composableImport = [...usedComposables]
        .sort()
        .map((composable) => `${composable} as ${aliasByComposable.get(composable)!}`)
        .join(", ");

      const vueImports = [`computed as ${computedAlias}`];
      if (needsUnref) {
        vueImports.push(`unref as ${SWIFTSEARCH_UNREF_ALIAS}`);
      }

      const generatedScript = [
        `import { ${vueImports.join(", ")} } from "vue";`,
        composableImport ? `import { ${composableImport} } from "#imports";` : "",
        ...scriptStatements,
      ]
        .filter(Boolean)
        .join("\n");

      if (descriptor.scriptSetup) {
        s.appendLeft(descriptor.scriptSetup.loc.end.offset, `\n${generatedScript}\n`);
      } else {
        s.append(`\n<script setup lang="ts">\n${generatedScript}\n</script>\n`);
      }

      if (!s.hasChanged()) {
        return;
      }

      return {
        code: s.toString(),
        map: s.generateMap({
          hires: true,
          source: normalizedId,
          includeContent: true,
        }),
      };
    },
  };
};
