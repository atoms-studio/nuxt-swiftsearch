<template>
  <div>
    <NuxtLink to="/Samsung"> Samsung Products </NuxtLink>
    <NuxtLink to="/Apple"> Apple Products </NuxtLink>
    <NuxtLink to="/search?query=Apple"> Search for apple </NuxtLink>
    <NuxtLink to="/nosearch">Go to no search</NuxtLink>
    <SearchExperience />
  </div>
</template>

<script setup lang="ts">
await useFetch("/api/testApi");
</script>

<style scoped></style>
