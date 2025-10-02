<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :send-event="state.sendEvent"
    >
      <ul :class="suit('list')">
        <li
          v-for="item in state.items"
          :key="item.value"
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
        >
          <label :class="suit('label')">
            <input
              type="radio"
              :class="suit('radio')"
              :name="`${props.attribute}`" 
              :checked="item.isRefined"
              :value="item.value"
              @change="state.refine(item.value)"
            >
            <span :class="suit('labelText')">{{ item.label }}</span>
          </label>
        </li>
      </ul>
    </slot>
  </div>
  <div v-else>
    Numeric Menu: No state available
  </div>
</template>

<script setup lang="ts">
import type { NumericMenuConnectorParamsItem } from "instantsearch.js/es/connectors/numeric-menu/connectNumericMenu";
import { useAisNumericMenuRenderState } from "../composables/useAisNumericMenu";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

const props = defineProps<{
  attribute: string;
  items: NumericMenuConnectorParamsItem[];
}>();

const suit = useSuit("NumericMenu");
const numericMenuRenderState = useAisNumericMenuRenderState();
const { state: numericMenuState } = useAisWidget("numericMenu");

const state = computed(() => {
  try {
    return numericMenuRenderState.value[props.attribute]
      ? numericMenuRenderState.value[props.attribute]
      : numericMenuState.value?.[props.attribute];
  } catch (error) {
    console.warn("NumericMenu: Error accessing state:", error);
    return null;
  }
});
</script>
