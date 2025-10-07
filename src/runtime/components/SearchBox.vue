<template>
  <div v-if="state" :class="suit()">
    <slot :current-refinement="currentRefinement" :is-search-stalled="state.isSearchStalled" :refine="state.refine">
      <AisSearchInput ref="searchInput" v-model="currentRefinement" :placeholder="placeholder" :autofocus="autofocus"
        :show-loading-indicator="showLoadingIndicator" :should-show-loading-indicator="state.isSearchStalled"
        :ignore-composition-events="ignoreCompositionEvents" :submit-title="submitTitle" :reset-title="resetTitle"
        @focus="emit('focus', $event)" @blur="emit('blur', $event)" @reset="emit('reset')">
        <template #loading-indicator>
          <slot name="loading-indicator" />
        </template>

        <template #submit-icon>
          <slot name="submit-icon" />
        </template>

        <template #reset-icon>
          <slot name="reset-icon" />
        </template>
      </AisSearchInput>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
const { state } = useAisWidget("searchBox");
import { useSuit } from "../composables/useSuit";
import { ref, computed } from "vue";
const props = withDefaults(
  defineProps<{
    placeholder?: string;
    autofocus?: boolean;
    showLoadingIndicator?: boolean;
    shouldShowLoadingIndicator?: boolean;
    ignoreCompositionEvents?: boolean;
    submitTitle?: string;
    resetTitle?: string;
  }>(),
  {
    placeholder: "",
    autofocus: false,
    showLoadingIndicator: false,
    shouldShowLoadingIndicator: false,
    ignoreCompositionEvents: false,
    submitTitle: "Submit the search query",
    resetTitle: "Clear the search query",
  },
);

const suit = useSuit("SearchBox");

const localValue = ref("");

const modelValue = defineModel<string>();
const emit = defineEmits([
  "input",
  "update:modelValue",
  "focus",
  "blur",
  "reset",
]);

const searchInput = ref<any>();
const currentRefinement = computed({
  get() {
    return modelValue.value || state.value!.query || "";
  },
  set(val) {
    if (val !== state.value!.query) {
      state.value!.refine(val);
    }
    if (modelValue.value) {
      emit("input", val);
      emit("update:modelValue", val);
    }
  },
});
</script>
