<template>
  <div>
    <SearchExperience />
    <section
      class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
    >
      <h2 class="text-base font-semibold text-cosmos-black mb-8">Route shortcuts</h2>
      <div class="flex flex-wrap -mx-4">
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/Samsung?query=channel"
        >
          Samsung with query
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/Samsung"
        >
          Samsung products
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/Apple"
        >
          Apple products
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/Nobrands"
        >
          No brand products
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/search?query=Apple"
        >
          Manual search page
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/nosearch"
        >
          No-search route
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/"
        >
          Home
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
await useFetch("/api/testApi");
</script>
