<template>
  <div>
    <NuxtLink to="/nosearch">No Search</NuxtLink>
  </div>
</template>

<script setup lang="ts">
await useFetch("/api/testApi");
</script>

<style scoped></style>
