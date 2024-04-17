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
  { precision: 1 },
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
    min: minValue !== -Infinity && minValue !== minRange ? minValue : minRange,
    max: maxValue !== Infinity && maxValue !== maxRange ? maxValue : maxRange,
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
  <div class="range-input">
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
              min: pick(minInput, state.range.min),
              max: pick(maxInput, state.range.max),
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
              label
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
              type="number"
              :class="[suit('input'), suit('input', 'max')]"
              :step="step"
              :min="state.range.min"
              :max="state.range.max"
              :placeholder="state.range?.min?.toString()"
              :value="values.max"
              label
              @change="
                ($event) =>
                  (maxInput = parseFloat(
                    ($event?.currentTarget as HTMLInputElement)?.value,
                  ))
              "
            >
            <button
              :class="suit('submit')"
              type="submit"
            >
              <slot name="submitLabel"> Go </slot>
            </button>
          </label>
        </form>
      </slot>
    </div>
  </div>
</template>
