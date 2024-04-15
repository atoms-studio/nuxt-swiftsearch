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
import { shallowRef, provide, ref } from "vue";
import instantsearch from "instantsearch.js/es";
import { useState } from "nuxt/app";

const props = defineProps<{
  configuration: InstantSearchOptions;
  widgets: Array<Widget | IndexWidget>;
  instanceKey?: string;
}>();

const searchInstance = import.meta.server
  ? ref(instantsearch(props.configuration))
  : // : shallowRef(instantsearch(props.configuration));
    useState(`instant_search_instance-${props.instanceKey ?? ""}`, () =>
      shallowRef(instantsearch(props.configuration)),
    );

provide<Ref<InstantSearch>>("searchInstance", searchInstance);

const { setup } = useInstantSearch(searchInstance);

await setup(props.widgets);
</script>

<style scoped></style>
