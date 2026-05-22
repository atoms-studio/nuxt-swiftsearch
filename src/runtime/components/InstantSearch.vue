<template>
  <div class="ais-InstantSearch">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type {
  IndexWidget,
  InstantSearchOptions,
  Widget,
  InstantSearch,
  Middleware,
} from "instantsearch.js";
import { useInstantSearch } from "../composables/useInstantSearch";
import { shallowRef, provide, toRefs, watch, onBeforeUnmount } from "vue";
import instantsearch from "instantsearch.js/es";
import { useState, clearNuxtState } from "nuxt/app";
import type { Ref } from "vue";

const props = defineProps<{
  configuration: InstantSearchOptions;
  widgets?: Array<Widget | IndexWidget>;
  instanceKey?: string;
  middlewares?: Middleware[];
}>();

const { widgets: widgetsRef, middlewares } = toRefs(props);
const instanceKey = props.instanceKey ?? "";
const stateKey = `instant_search_instance_${instanceKey}`;

let searchInstance: Ref<InstantSearch>;
if (import.meta.server) {
  searchInstance = shallowRef(instantsearch(props.configuration));
} else {
  searchInstance = useState(stateKey, () => shallowRef(instantsearch(props.configuration)));
}

provide<Ref<InstantSearch>>("searchInstance", searchInstance);
provide<string>("instanceKey", instanceKey);

const { setup } = useInstantSearch(searchInstance);
await setup(props.widgets ?? [], props.instanceKey);

watch(widgetsRef, async () => {
  await setup(props.widgets ?? [], props.instanceKey);
});

// watching middlewares
watch(
  middlewares,
  (next, prev) => {
    (prev || [])
      .filter((middleware) => (next || []).indexOf(middleware) === -1)
      .forEach((middlewareToRemove) => {
        searchInstance.value.unuse(middlewareToRemove);
      });

    (next || [])
      .filter((middleware) => (prev || []).indexOf(middleware) === -1)
      .forEach((middlewareToAdd) => {
        searchInstance.value.use(middlewareToAdd);
      });
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (searchInstance.value?.started) {
    searchInstance.value.dispose();
  }
  clearNuxtState(stateKey);
});
</script>

<style scoped></style>
