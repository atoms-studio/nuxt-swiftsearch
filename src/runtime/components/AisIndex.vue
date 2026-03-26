<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";

const props = defineProps<{
  index: string;
  indexId?: string;
}>();

provide("index", props.index);
provide("indexId", props.indexId);
</script>
