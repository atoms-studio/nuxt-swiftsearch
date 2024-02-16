<template>
  <div :class="suit()" v-if="state && state.state && state.results">
    <slot v-bind="stateResults">
      <p>
        Use this component to have a different layout based on a certain state.
      </p>
      <p>Fill in the slot, and get access to the following things:</p>
      <pre>results: {{ Object.keys(state.results) }}</pre>
      <pre>state: {{ Object.keys(state.state) }}</pre>
      <pre>status: {{ state.status }}</pre>
      <pre>error: {{ state.error }}</pre>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useSuit } from "../composables/useSuit";
import { useInstantSearch } from "../composables/useInstantSearch";
import { computed, toRefs } from "vue";

const { getInstance, parentIndex } = useInstantSearch();
const suit = useSuit("StateResults");

const props = withDefaults(
  defineProps<{ catchError?: boolean; errorFn?: () => void }>(),
  { catchError: false },
);

const { catchError } = toRefs(props);
const instance = getInstance();

// custom state
const state = computed(() => {
  const status = instance.value.status;
  const error = instance.value.error;
  const results = parentIndex.value.getResults();
  const helper = parentIndex.value.getHelper();
  const state = helper ? helper.state : null;
  return {
    results,
    state,
    status,
    error,
  };
});

const stateResults = computed(() => ({
  results: state.value.results,
  state: state.value.state,
  status: state.value.status,
  error: state.value.error,
}));

// TODO: handle errors
// const noopErrorFn = () => {};
//
// watch(
//   catchError,
//   (shouldCatch) => {
//     if (shouldCatch) {
//       instance.value.addListener("error", noopErrorFn);
//     } else if (props.errorFn) {
//       instance.value.removeListener("error", noopErrorFn);
//     }
//   },
//   { immediate: true },
// );
</script>
