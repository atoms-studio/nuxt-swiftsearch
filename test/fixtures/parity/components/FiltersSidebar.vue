<template>
  <aside class="filters-sidebar">
    <section
      v-for="attribute in attributes"
      :key="attribute"
      :data-testid="`nested-refinement-${attribute}`"
    >
      <h3>{{ attribute }}</h3>
      <AisRefinementList :attribute="attribute" />
    </section>
    <AisStats data-testid="nested-stats" />
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{ attributes: string[] }>();
</script>
