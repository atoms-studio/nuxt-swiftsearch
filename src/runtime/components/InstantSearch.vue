<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type {
  IndexWidget,
  InstantSearchOptions,
  Widget,
  InstantSearch,
} from "instantsearch.js";
import { useInstantSearch } from "../composables/useInstantSearch";
import { toRefs, watch, shallowRef, provide, ref } from "vue";
import instantsearch, { type InitialResults } from "instantsearch.js/es";
import { useState } from "nuxt/app";

const props = defineProps<{
  configuration: InstantSearchOptions;
  widgets: Array<Widget | IndexWidget>;
}>();

const searchInstance = import.meta.server
  ? ref(instantsearch(props.configuration))
  : useState("instant_search_instance", () =>
      shallowRef(instantsearch(props.configuration)),
    );

provide<Ref<InstantSearch>>("searchInstance", searchInstance);

const { setup, getInstance } = useInstantSearch(searchInstance);

const search = getInstance();

await setup(props.widgets);
</script>

<style scoped></style>
