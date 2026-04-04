import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { resolve } from "node:path";

const exists = async (filePath) => {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const rootDir = process.cwd();
const distDir = resolve(rootDir, "dist");
const packageJsonPath = resolve(rootDir, "package.json");

await mkdir(distDir, { recursive: true });

const packageJsonRaw = await readFile(packageJsonPath, "utf8");
const packageJson = JSON.parse(packageJsonRaw);

const moduleJsPath = resolve(distDir, "module.js");
const moduleMjsPath = resolve(distDir, "module.mjs");

if ((await exists(moduleJsPath)) && !(await exists(moduleMjsPath))) {
  await rename(moduleJsPath, moduleMjsPath);
}

const moduleJson = {
  name: packageJson.name,
  configKey: "swiftsearch",
  version: packageJson.version,
  builder: {
    tsdown: packageJson.devDependencies?.tsdown ?? "unknown",
  },
};

await writeFile(
  resolve(distDir, "module.json"),
  `${JSON.stringify(moduleJson, null, 2)}\n`,
  "utf8",
);

const rootTypes = `export { default } from './module.mjs'\n\nexport { type ModuleOptions } from './module.mjs'\n`;

await writeFile(resolve(distDir, "types.d.mts"), rootTypes, "utf8");
