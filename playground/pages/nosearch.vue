<template>
  <div>
    <ClientOnly>
      <NuxtLink to="/Samsung"> Go To brand </NuxtLink>
    </ClientOnly>
    <NuxtLink to="/Nobrands"> No products brands </NuxtLink>

    <NuxtLink to="/nosearch2"> Go to nosearch2 </NuxtLink>
  </div>
</template>

<script setup>
const { data } = await useFetch("/api/testApi");

await useAsyncData(async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500);
  });
});
</script>

<style lang="scss" scoped></style>
