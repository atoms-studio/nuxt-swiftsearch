import { defineNuxtConfig } from "nuxt/config";
import Swiftsearch from "../../../src/module";

export default defineNuxtConfig({
  // Inline options are typed here; the `swiftsearch` config key is typed only in a prepared app.
  modules: [[Swiftsearch, { childWidgetDiscovery: true }]],
});
