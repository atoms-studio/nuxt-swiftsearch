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
import {
  shallowRef,
  provide,
  ref,
  toRefs,
  watch,
  onUnmounted,
  type Ref,
} from "vue";
import { useAisRefinementListRenderState } from "../composables/useAisRefinementList";
import { useAisHierarchicalMenuRenderState } from "../composables/useAisHierarchicalMenu";
import instantsearch from "instantsearch.js/es";
import { useState } from "nuxt/app";

const props = defineProps<{
  configuration: InstantSearchOptions;
  widgets: Array<Widget | IndexWidget>;
  instanceKey?: string;
}>();

const { widgets: widgetsRef } = toRefs(props);

const refinementListRenderState = useAisRefinementListRenderState();
const hierarchicalRenderState = useAisHierarchicalMenuRenderState();

const searchInstance = import.meta.server
  ? ref(instantsearch(props.configuration))
  : // : shallowRef(instantsearch(props.configuration));
    useState(`instant_search_instance-${props.instanceKey ?? ""}`, () =>
      shallowRef(instantsearch(props.configuration)),
    );

if (searchInstance.value === null) {
  searchInstance.value = instantsearch(props.configuration);
}

provide<Ref<InstantSearch>>("searchInstance", searchInstance);

const unmountInstance = () => {
  searchInstance.value?.mainHelper?.removeAllListeners();
  searchInstance.value?.removeWidgets(props.widgets);
  searchInstance.value?.dispose();
  // @ts-ignore
  searchInstance.value = null;
  // @ts-ignore
  refinementListRenderState.value = null;
  // @ts-ignore
  hierarchicalRenderState.value = null;
};
onUnmounted(() => {
  unmountInstance();
});
const { setup } = useInstantSearch(searchInstance);
await setup(props.widgets);
watch(widgetsRef, async (wdgts) => {
  await setup(wdgts);
});
</script>

<style scoped></style>
