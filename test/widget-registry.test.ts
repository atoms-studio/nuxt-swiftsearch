import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { WIDGET_COMPONENTS } from "../src/vite/declarative/widgets";

const COMPONENTS_DIR = fileURLToPath(new URL("../src/runtime/components", import.meta.url));
const COMPOSABLES_DIR = fileURLToPath(new URL("../src/runtime/composables", import.meta.url));

const componentTagFromFile = (filename: string) => {
  const base = filename.replace(/\.vue$/, "");
  return base.startsWith("Ais") ? base : `Ais${base}`;
};

// A connector-backed widget is identified by a literal-string useAisWidget("...") call.
// Components that take the connector name from props (e.g. Panel) won't match this regex
// and are correctly excluded — they don't have a fixed connector to register.
const LITERAL_CONNECTOR_REGEX =
  /useAisWidget\(\s*["'][a-zA-Z]+["'](?:\s*,\s*(?<idArg>[^),]+))?\s*\)/;

const composableAcceptsWidgetId = (composable: string): boolean => {
  const file = join(COMPOSABLES_DIR, `${composable}.ts`);
  const source = readFileSync(file, "utf8");
  // Match the exported factory's parameter list — `widgetId` appearing inside the
  // signature means the composable scopes its render state per instance.
  return /export const \w+\s*=\s*\([^)]*\bwidgetId\b[^)]*\)/.test(source);
};

type WidgetEntry = {
  file: string;
  tag: string;
  content: string;
  idArg: string | undefined;
};

const widgetComponents: WidgetEntry[] = readdirSync(COMPONENTS_DIR)
  .filter((file) => file.endsWith(".vue"))
  .map((file) => {
    const content = readFileSync(join(COMPONENTS_DIR, file), "utf8");
    const match = content.match(LITERAL_CONNECTOR_REGEX);
    return {
      file,
      tag: componentTagFromFile(file),
      content,
      idArg: match?.groups?.idArg?.trim(),
    };
  })
  .filter((entry) => LITERAL_CONNECTOR_REGEX.test(entry.content));

describe("WIDGET_COMPONENTS registry", () => {
  it("registers every shipped runtime component that binds to a literal InstantSearch connector", () => {
    const expectedTags = widgetComponents.map((entry) => entry.tag).sort();
    const missing = expectedTags.filter((tag) => !(tag in WIDGET_COMPONENTS));

    expect(missing).toEqual([]);
  });

  it("forwards props.id to useAisWidget so duplicate-connector instances stay isolated", () => {
    const offenders: string[] = [];

    for (const entry of widgetComponents) {
      const config = WIDGET_COMPONENTS[entry.tag];
      if (!config) continue;
      if (!composableAcceptsWidgetId(config.composable)) continue;

      if (entry.idArg !== "props.id") {
        offenders.push(entry.tag);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("sets usesId on every widget whose composable supports per-instance scoping", () => {
    const offenders: string[] = [];

    for (const entry of widgetComponents) {
      const config = WIDGET_COMPONENTS[entry.tag];
      if (!config) continue;
      if (!composableAcceptsWidgetId(config.composable)) continue;

      if (!config.usesId) {
        offenders.push(entry.tag);
      }
    }

    expect(offenders).toEqual([]);
  });
});
