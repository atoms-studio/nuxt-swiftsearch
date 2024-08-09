<template>
  <div>{{ id }} - {{ name }} - {{ price }}</div>
</template>

<script setup lang="ts">
const props = defineProps<{ id: string; name: string; price: string }>();
</script>

<style scoped></style>
