<template>
  <div v-if="state" :class="suit()">
    <slot
      :current-refinement="currentRefinement"
      :is-search-stalled="state.isSearchStalled"
      :refine="state.refine"
    >
      <AisSearchInput
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @reset="emit('reset')"
        :placeholder="placeholder"
        :autofocus="autofocus"
        :show-loading-indicator="showLoadingIndicator"
        :should-show-loading-indicator="state.isSearchStalled"
        :ignore-composition-events="ignoreCompositionEvents"
        :submit-title="submitTitle"
        :reset-title="resetTitle"
        v-model="currentRefinement"
        ref="searchInput"
      >
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
const { widgetParams, state } = useWidget("searchBox");
const props = withDefaults(
  defineProps<{
    placeholder?: string;
    autofocus?: boolean;
    showLoadingIndicator?: boolean;
    shouldShowLoadingIndicator?: boolean;
    ignoreCompositionEvents?: boolean;
    submitTitle?: string;
    resetTitle?: string;
    value?: string;
  }>(),
  {
    placeholder: "Search here...",
    autofocus: false,
    showLoadingIndicator: false,
    shouldShowLoadingIndicator: false,
    ignoreCompositionEvents: false,
    submitTitle: "Search",
    resetTitle: "Clear",
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

const isControlled = computed(
  () =>
    typeof props.value !== "undefined" ||
    typeof modelValue.value !== "undefined",
);

const model = computed(() => props.value || modelValue.value);
const searchInput = ref<any>();
const currentRefinement = computed({
  get() {
    // if the input is controlled, but not up to date
    // this means it didn't search, and we should pretend it was `set`
    if (isControlled.value && model.value !== localValue.value) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      localValue.value = model.value ?? "";
      emit("input", model.value);
      emit("update:modelValue", model.value);
      state.value.refine(model.value ?? "");
    }

    // we return the local value if the input is focused to avoid
    // concurrent updates when typing
    if (
      searchInput.value &&
      searchInput.value.isFocused &&
      searchInput.value.isFocused()
    ) {
      return localValue.value;
    }

    return model.value || state.value.query || "";
  },
  set(val) {
    localValue.value = val;
    state.value.refine(val);
    if (isControlled.value) {
      emit("input", val);
      emit("update:modelValue", val);
    }
  },
});
</script>
