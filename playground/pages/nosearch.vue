<template>
  <div>
    <ClientOnly>
      <NuxtLink to="/Samsung"> Go To brand </NuxtLink>
    </ClientOnly>
    <NuxtLink to="/nosearch2"> Go to nosearch2</NuxtLink>
  </div>
</template>

<script setup>
await useAsyncData(async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500);
  });
});
</script>

<style lang="scss" scoped></style>
