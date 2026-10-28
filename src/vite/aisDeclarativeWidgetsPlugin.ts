import { parse as parseTemplate } from "@vue/compiler-dom";
import { parse as parseSFC } from "@vue/compiler-sfc";
import MagicString from "magic-string";
import { dirname } from "node:path";
import type { EnvironmentModuleNode, Plugin } from "vite";
import { collectUnscannableComponentTags, collectWidgets } from "./declarative/collector";
import {
  buildGeneratedImports,
  createDiscoveryContext,
  createGenerationContext,
} from "./declarative/context";
import {
  analyzeProviderFile,
  getProviderGeneration,
  type ProviderOptions,
} from "./declarative/provider";
import { createExclusionCheck, createTagResolver } from "./declarative/resolve";
import {
  findInstantSearchRoots,
  getTagAttributeInsertIndex,
  hasWidgetsProp,
  indent,
} from "./declarative/template";
import type { PluginOptions, TemplateEdit } from "./declarative/types";
import { hasInstantSearchRoot, usesVueInstantSearch } from "./declarative/widgets";

const COMPUTED_ALIAS = "__swiftsearchComputed";

const applyEdits = (s: MagicString, edits: TemplateEdit[]) => {
  for (const edit of [...edits].sort((left, right) => left.start - right.start)) {
    if (edit.end !== undefined) {
      s.update(edit.start, edit.end, edit.content);
    } else {
      s.appendLeft(edit.start, edit.content);
    }
  }
};

const toResult = (s: MagicString, id: string) => ({
  code: s.toString(),
  map: s.generateMap({ hires: true, source: id, includeContent: true }),
});

export const aisDeclarativeWidgetsPlugin = (options: PluginOptions = {}): Plugin => {
  const childWidgetDiscovery = options.childWidgetDiscovery === true;
  const isExcluded = createExclusionCheck(options.exclude);
  const providerOptions: ProviderOptions = {
    createTagResolver: (scriptContents, importerDir) =>
      createTagResolver(scriptContents, importerDir, options.resolveComponent, isExcluded),
  };
  // child file → ids of the root and provider modules whose output embeds its analysis
  const dependents = new Map<string, Set<string>>();

  return {
    name: "nuxt-swiftsearch:declarative-widgets",
    enforce: "pre",
    transform(code, id) {
      if (
        id.includes("?") ||
        !id.endsWith(".vue") ||
        isExcluded(id) ||
        usesVueInstantSearch(code)
      ) {
        return;
      }

      const warn = (message: string) => this.warn(`[nuxt-swiftsearch] ${id}: ${message}`);
      const trackDependencies = (files: Iterable<string>) => {
        for (const file of files) {
          if (file === id) continue;
          this.addWatchFile(file);
          let fileDependents = dependents.get(file);
          if (!fileDependents) dependents.set(file, (fileDependents = new Set()));
          fileDependents.add(id);
        }
      };

      if (!hasInstantSearchRoot(code)) {
        if (!childWidgetDiscovery) return;

        // Child component: export a props-parameterized widget factory that
        // root files import.
        const generation = getProviderGeneration(id, providerOptions, new Set(), code);
        if (!generation) return;

        generation.notices.forEach(warn);
        for (const skipped of generation.analysis.skipped) {
          warn(`skipped <${skipped.tag}> — ${skipped.reason}.`);
        }
        if (!generation.factoryModule) return;

        trackDependencies(generation.analysis.watchFiles);

        const s = new MagicString(code);
        applyEdits(s, generation.edits);
        if (generation.script.kind === "append") {
          s.appendLeft(generation.script.offset, `\n${generation.factoryModule}\n`);
        } else {
          const langAttr = generation.script.lang ? ` lang="${generation.script.lang}"` : "";
          s.append(`\n<script${langAttr}>\n${generation.factoryModule}\n</script>\n`);
        }
        return toResult(s, id);
      }

      const { descriptor, errors } = parseSFC(code, { filename: id });
      if (errors.length || !descriptor.template) return;

      const template = descriptor.template;
      const instantSearchNodes = findInstantSearchRoots(
        parseTemplate(template.content, { comments: false }).children,
      );
      if (!instantSearchNodes.length) return;

      // Shared by all roots in this file, so that each child factory is imported once.
      const discovery = childWidgetDiscovery
        ? createDiscoveryContext({
            resolveTag: providerOptions.createTagResolver(
              [descriptor.script?.content, descriptor.scriptSetup?.content],
              dirname(id),
            ),
            analyzeChild: (filePath, visited) =>
              analyzeProviderFile(filePath, providerOptions, visited),
            visited: new Set([id]),
            sourceDir: dirname(id),
          })
        : undefined;

      const aliasByComposable = new Map<string, string>();
      const usedComposables = new Set<string>();
      const edits: TemplateEdit[] = [];
      const scriptStatements: string[] = [];
      let usesUnref = false;
      let usesRenderList = false;

      instantSearchNodes.forEach((instantSearchNode, index) => {
        const rootIndex = index + 1;
        if (hasWidgetsProp(instantSearchNode)) return;

        const unscannableTags = collectUnscannableComponentTags(
          instantSearchNode.children,
          discovery?.resolveTag,
        );
        if (unscannableTags.length) {
          const enableHint = childWidgetDiscovery
            ? ""
            : " Enable the `swiftsearch.childWidgetDiscovery` module option to auto-discover widgets in resolvable child components.";
          warn(
            `<${unscannableTags.join(">, <")}> inside <AisInstantSearch> cannot be scanned by the declarative transform — widgets rendered inside it are not auto-discovered. If it renders Ais components, declare their widgets in this file (or switch this root to the manual :widgets prop).${enableHint}`,
          );
        }

        const context = createGenerationContext({
          templateOffset: template.loc.start.offset,
          rootIndex,
          aliasByComposable,
          discovery,
        });
        const widgetExpressions = collectWidgets(instantSearchNode.children, context);

        context.notices.forEach(warn);
        for (const skipped of context.skipped) {
          warn(
            `skipped <${skipped.tag}> — ${skipped.reason}. Its component will throw "Connector for component ... not found" at runtime. Other widgets in this <AisInstantSearch> were still generated; restructure the template or switch this root to the manual :widgets prop.`,
          );
        }

        const insertIndex = getTagAttributeInsertIndex(
          instantSearchNode,
          template.loc.start.offset,
        );
        if (!widgetExpressions.length || insertIndex === null) return;

        const widgetsBinding = `__swiftsearchWidgets${rootIndex}`;
        edits.push(...context.edits, {
          start: insertIndex,
          content: ` :widgets="${widgetsBinding}"`,
        });
        context.usedComposables.forEach((composable) => usedComposables.add(composable));
        usesUnref ||= context.usesUnref;
        usesRenderList ||= context.usesRenderList;

        const widgetsArray = widgetExpressions
          .map((expression) => indent(expression, 4))
          .join(",\n");
        scriptStatements.push(
          `const ${widgetsBinding} = ${COMPUTED_ALIAS}(() => [\n${widgetsArray}\n]);`,
        );
      });

      if (!scriptStatements.length) return;

      if (discovery) trackDependencies(discovery.watchFiles);

      const generatedScript = [
        ...buildGeneratedImports({
          vueImports: [`computed as ${COMPUTED_ALIAS}`],
          usesRenderList,
          usesUnref,
          usedComposables,
          aliasByComposable,
          providerImports: discovery?.providerImports ?? [],
        }),
        ...scriptStatements,
      ].join("\n");

      const s = new MagicString(code);
      applyEdits(s, edits);
      if (descriptor.scriptSetup) {
        s.appendLeft(descriptor.scriptSetup.loc.end.offset, `\n${generatedScript}\n`);
      } else {
        s.append(`\n<script setup lang="ts">\n${generatedScript}\n</script>\n`);
      }
      return toResult(s, id);
    },

    // The output of a root or provider module embeds the analysis of its
    // children. When a child file changes, those modules must transform again.
    // The provider cache detects the change itself, through file stamps.
    hotUpdate({ file, modules }) {
      const fileDependents = dependents.get(file);
      if (!fileDependents?.size) return;

      const extraModules: EnvironmentModuleNode[] = [];
      for (const dependentId of fileDependents) {
        const module = this.environment.moduleGraph.getModuleById(dependentId);
        if (module) extraModules.push(module);
      }
      return extraModules.length ? [...modules, ...extraModules] : undefined;
    },
  };
};
