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
import { shallowRef, provide, ref, toRefs, watch } from "vue";
import instantsearch from "instantsearch.js/es";
import { useState } from "nuxt/app";
import type { Ref } from "vue";

const props = defineProps<{
  configuration: InstantSearchOptions;
  widgets: Array<Widget | IndexWidget>;
  instanceKey?: string;
  middlewares?: Middleware[];
}>();

const { widgets: widgetsRef, middlewares } = toRefs(props);

const searchInstance = import.meta.server
  ? ref(instantsearch(props.configuration))
  : // : shallowRef(instantsearch(props.configuration));
    useState(`instant_search_instance-${props.instanceKey ?? ""}`, () =>
      shallowRef(instantsearch(props.configuration)),
    );

provide<Ref<InstantSearch>>("searchInstance", searchInstance);

const { setup } = useInstantSearch(searchInstance);
await setup(props.widgets);

watch(widgetsRef, async () => {
  await setup(props.widgets);
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
</script>

<style scoped></style>
