import type { RouterConfig } from "@nuxt/schema";
import qs from "qs";

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
};
