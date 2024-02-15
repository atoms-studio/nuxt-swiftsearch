<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  index: string;
}>();

provide("index", props.index);
</script>
