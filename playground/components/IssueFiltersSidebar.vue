<template>
  <aside class="flex flex-col gap-6">
    <section v-for="attribute in attributes" :key="attribute">
      <h3 class="text-sm font-semibold mb-2">{{ attribute }}</h3>
      <AisRefinementList :attribute="attribute" />
    </section>
    <AisStats />
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{ attributes: string[] }>();
</script>
