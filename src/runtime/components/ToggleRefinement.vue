<template>
  <div v-if="state" :class="[suit(), !state.canRefine && suit('', 'noRefinement')]">
    <slot
      :value="state.value"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :send-event="state.sendEvent"
    >
      <label :class="suit('label')">
        <input
          :class="suit('checkbox')"
          type="checkbox"
          :name="state.value?.name"
          :value="onValue"
          :checked="state.value?.isRefined"
          @change="state.refine(state.value)"
        />
        <span :class="suit('labelText')">{{ label || state.value?.name }}</span>
        <span v-if="state.value.count !== null" :class="suit('count')">{{
          state.value?.count?.toLocaleString()
        }}</span>
      </label>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

type ToggleRefinementProps = {
  id?: string;
  attribute: string;
  on?: string | number | boolean | unknown[];
  off?: string | number | boolean | unknown[];
  label?: string;
};

const props = withDefaults(defineProps<ToggleRefinementProps>(), { id: "" });

const { state: refinementsState } = useAisWidget("toggleRefinement", props.id);

const state = computed(() => {
  if (props.id) {
    return refinementsState.value;
  }
  return refinementsState.value?.[props.attribute];
});

const widgetParams = computed(() => state.value.widgetParams);

const suit = useSuit("ToggleRefinement");

const onValue = computed(() => widgetParams.value?.on ?? true);
</script>
