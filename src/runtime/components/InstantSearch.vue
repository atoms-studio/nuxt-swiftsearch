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
import isEqual from "lodash.isequal";

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
  // dirty checking which widgets to change

  const widgetsToAdd = newWidgets.filter(
    (newW) =>
      !oldWidgets.some(
        // @ts-ignore
        (oldW) => isEqual(oldW.$$widgetParams, newW.$$widgetParams),
      ),
  );
  const widgetsToRemove = oldWidgets.filter(
    (oldW) =>
      !newWidgets.some((newW) =>
        // @ts-ignore
        isEqual(oldW.$$widgetParams, newW.$$widgetParams),
      ),
  );
  search.value.removeWidgets(widgetsToRemove);
  search.value.addWidgets(widgetsToAdd);
});
await setup(props.widgets);
</script>

<style scoped></style>
