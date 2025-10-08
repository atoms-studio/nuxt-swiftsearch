<script lang="ts" setup>
import { useAisWidget } from "../composables/useAisWidget";
import { useAisRangeInputRenderState } from "../composables/useAisRangeInput";
import { useSuit } from "../composables/useSuit";
import { ref, computed, type Ref } from "vue";

const props = withDefaults(
  defineProps<{
    attribute: string;
    precision?: number;
  }>(),
  { precision: 0 },
);

const { state: rangesState } = useAisWidget("range");
const rangeState = useAisRangeInputRenderState();
const suit = useSuit("RangeInput");

const state = computed(() => {
  return rangeState.value[props.attribute]
    ? rangeState.value[props.attribute]
    : rangesState.value![props.attribute];
});

const minInput: Ref<number | undefined> = ref();
const maxInput: Ref<number | undefined> = ref();

const step = computed(() => 1 / Math.pow(10, props.precision));

const values = computed(() => {
  const [minValue, maxValue] = state.value.start;
  const { min: minRange, max: maxRange } = state.value.range;
  return {
    min: minValue !== -Infinity && minValue !== minRange ? minValue : undefined,
    max: maxValue !== Infinity && maxValue !== maxRange ? maxValue : undefined,
  };
});

const pick = (first: number | null | undefined, second: number | undefined) => {
  if (first !== null && first !== undefined) {
    return first;
  } else {
    return second;
  }
};

const refine = (data: { min: number | undefined; max: number | undefined }) => {
  state.value.refine([data.min, data.max]);
};
</script>
<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :current-refinement="values"
      :refine="refine"
      :can-refine="state.canRefine"
      :range="state.range"
      :send-event="state.sendEvent"
    >
      <form
        :class="suit('form')"
        @submit.prevent="
          refine({
            min: pick(minInput, values.min),
            max: pick(maxInput, values.max),
          })
        "
      >
        <label :class="suit('label')">
          <slot name="minLabel" />
          <input
            type="number"
            :class="[suit('input'), suit('input', 'min')]"
            :step="step"
            :min="state.range.min"
            :max="state.range.max"
            :placeholder="state.range?.min?.toString()"
            :value="values.min"
            @change="
              ($event) =>
                (minInput = parseFloat(
                  ($event?.currentTarget as HTMLInputElement)?.value,
                ))
            "
          >
        </label>
        <span :class="suit('separator')">
          <slot name="separator">to</slot>
        </span>
        <label :class="suit('label')">
          <slot name="maxLabel" />
          <input
            :class="[suit('input'), suit('input', 'max')]"
            type="number"
            :step="step"
            :min="state.range.min"
            :max="state.range.max"
            :placeholder="state.range?.max?.toString()"
            :value="values.max"
            @change="
              ($event) =>
                (maxInput = parseFloat(
                  ($event?.currentTarget as HTMLInputElement)?.value,
                ))
            "
          >
        </label>
        <button
          :class="suit('submit')"
          type="submit"
        >
          <slot name="submitLabel">
            Go
          </slot>
        </button>
      </form>
    </slot>
  </div>
</template>
