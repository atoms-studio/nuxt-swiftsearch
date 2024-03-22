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
import { toRefs, watch, shallowRef, provide } from "vue";
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

const _widgets = useState<Array<Widget | IndexWidget>>(
  "_instant_search_widgets",
  () => [],
);

// in client, statify widgets
if (import.meta.client) {
  _widgets.value = props.widgets;
}

// watching if any widget parameter has changed to refresh only that widget
watch(_widgets, (newWidgets, oldWidgets) => {
  search.value.removeWidgets(oldWidgets);
  search.value.addWidgets(newWidgets);
});
// accepting import meta hot updates
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    triggerRef(_searchInstance);
  });
}
await setup(props.widgets);
</script>

<style scoped></style>
