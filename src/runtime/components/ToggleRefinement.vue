<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
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
          :value="on"
          :checked="state.value?.isRefined"
          @change="state.refine(state.value)"
        >
        <span :class="suit('labelText')">{{ label || state.value?.name }}</span>
        <span
          v-if="state.value.count !== null"
          :class="suit('count')"
        >{{
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
const props = defineProps<{ attribute: string; label?: string }>();

const { state: refinementsState } = useAisWidget("toggleRefinement");

const state = computed(() => refinementsState.value[props.attribute]);

const widgetParams = computed(() => state.value.widgetParams);

const suit = useSuit("ToggleRefinement");

const on = computed(() => widgetParams.value?.on ?? true);
</script>
