<template>
  <div v-if="state" :class="[suit(), !state.canRefine && suit('', 'noRefinement')]">
    <slot
      :items="renderItems"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :send-event="state.sendEvent"
    >
      <ul :class="suit('list')">
        <li
          v-for="item in renderItems"
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
            />
            <span :class="suit('labelText')">{{ item.label }}</span>
          </label>
        </li>
      </ul>
    </slot>
  </div>
  <div v-else>Numeric Menu: No state available</div>
</template>

<script
  setup
  lang="ts"
  generic="TItem extends NumericMenuRenderStateItem = NumericMenuRenderStateItem"
>
import type {
  NumericMenuRenderStateItem,
  NumericMenuConnectorParamsItem,
} from "instantsearch.js/es/connectors/numeric-menu/connectNumericMenu";
import { useAisWidget } from "../composables/useAisWidget";
import { useAisNumericMenuRenderState } from "../composables/useAisNumericMenu";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";
import { computed } from "vue";

type NumericMenuProps = {
  id?: string;
  attribute: string;
  items: NumericMenuConnectorParamsItem[];
  transformItems?: TransformItemsTo<NumericMenuRenderStateItem, TItem>;
};

const props = withDefaults(defineProps<NumericMenuProps>(), { id: "" });

const suit = useSuit("NumericMenu");
const { state: numericMenuState } = useAisWidget("numericMenu", props.id);
const numericMenuRenderState = useAisNumericMenuRenderState();

const state = computed(() => {
  if (props.id) {
    return numericMenuState.value;
  }
  return numericMenuRenderState.value[props.attribute] || numericMenuState.value?.[props.attribute];
});

const renderItems = computed(() => (state.value?.items ?? []) as Array<TItem>);
</script>
