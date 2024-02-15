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
} from "instantsearch.js";

const props = defineProps<{
  configuration: InstantSearchOptions;
  widgets: Array<Widget | IndexWidget>;
}>();
const { setup, getInstance } = useInstantSearch();

const search = getInstance(props.configuration);

search.value.addWidgets(props.widgets);

// react to widget change
const { widgets: widgetsRef } = toRefs(props);

watch(widgetsRef, (newWidgets, oldWidgets) => {
  search.value.removeWidgets(oldWidgets);
  search.value.addWidgets(newWidgets);
});

await setup();
</script>

<style scoped></style>
