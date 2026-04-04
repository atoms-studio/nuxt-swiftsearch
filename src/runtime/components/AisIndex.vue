<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";

const props = defineProps<{
  index?: string;
  indexName?: string;
  indexId?: string;
}>();

const indexName = props.indexName ?? props.index;

if (!indexName) {
  throw new Error("AisIndex requires either `index` or `indexName`.");
}

provide("index", indexName);
provide("indexId", props.indexId);
</script>
