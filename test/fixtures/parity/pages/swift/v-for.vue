<template>
  <div class="page">
    <AisInstantSearch :configuration="configuration" instance-key="v-for">
      <AisConfigure :search-parameters="{ hitsPerPage: 5 }" />
      <AisSearchBox />

      <section
        v-for="attribute in refinementListAttributes"
        :key="attribute"
        :data-testid="`refinement-${attribute}`"
      >
        <h3>{{ attribute }}</h3>
        <AisRefinementList :attribute="attribute" />
      </section>

      <div v-if="showExtra" data-testid="refinement-extra">
        <AisRefinementList attribute="categories" />
      </div>

      <AisStats data-testid="stats" />
      <AisHits data-testid="hits" />

      <button data-testid="add-attribute" type="button" @click="addAttribute">add attribute</button>
      <button data-testid="remove-attribute" type="button" @click="removeAttribute">
        remove attribute
      </button>
      <button data-testid="remove-first-attribute" type="button" @click="removeFirstAttribute">
        remove first attribute
      </button>
      <button data-testid="toggle-extra" type="button" @click="showExtra = !showExtra">
        toggle extra
      </button>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { algoliasearch } from "algoliasearch";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const refinementListAttributes = ref(["brand", "categories"]);
const showExtra = ref(false);

const addAttribute = () => {
  if (!refinementListAttributes.value.includes("free_shipping")) {
    refinementListAttributes.value = [...refinementListAttributes.value, "free_shipping"];
  }
};

const removeAttribute = () => {
  refinementListAttributes.value = refinementListAttributes.value.slice(0, -1);
};

const removeFirstAttribute = () => {
  refinementListAttributes.value = refinementListAttributes.value.slice(1);
};

const configuration = {
  indexName: "instant_search",
  searchClient,
};
</script>
