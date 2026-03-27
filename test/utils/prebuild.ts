import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const builtFixtures = new Set<string>();

export const ensureNuxtBuild = (rootDir: string) => {
  if (builtFixtures.has(rootDir)) {
    return;
  }

  const nuxtCliPath = resolve(process.cwd(), "node_modules/nuxt/bin/nuxt.mjs");

  execFileSync(process.execPath, [nuxtCliPath, "build", rootDir], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });

  builtFixtures.add(rootDir);
};
