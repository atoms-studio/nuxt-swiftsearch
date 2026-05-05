<template>
  <div v-if="state && state.state && state.results" :class="suit()">
    <slot v-bind="stateResults">
      <ClientOnly>
        <p>Use this component to have a different layout based on a certain state.</p>
        <p>Fill in the slot, and get access to the following things:</p>
        <pre>results: {{ Object.keys(state.results) }}</pre>
        <pre>state: {{ Object.keys(state.state) }}</pre>
        <pre>status: {{ state.status }}</pre>
        <pre>error: {{ state.error }}</pre>
      </ClientOnly>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useSuit } from "../composables/useSuit";
import { useInstantSearch } from "../composables/useInstantSearch";
import { computed } from "vue";

const { getInstance, parentIndex, status, error } = useInstantSearch();
const suit = useSuit("StateResults");

defineProps<{ catchError?: boolean; errorFn?: () => void }>();

const instance = getInstance();

const state = computed(() => {
  const results = parentIndex.value.getResults();
  const helper = parentIndex.value.getHelper();
  return {
    results,
    state: helper ? helper.state : null,
    status: status!.value,
    error: error!.value,
    instance: instance.value,
  };
});

const stateResults = computed(() => ({
  results: state.value.results,
  state: state.value.state,
  status: state.value.status,
  error: state.value.error,
}));
</script>
