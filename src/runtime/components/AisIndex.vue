<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";

const props = defineProps<{
  index: string;
}>();

provide("index", props.index);
</script>
