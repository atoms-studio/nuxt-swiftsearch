<template>
  <div
    v-if="state"
    :class="[suit(), noRefinement && suit('', 'noRefinement')]"
  >
    <slot
      :refine="state.refine"
      :items="items"
      :create-u-r-l="state.createURL"
    >
      <ul :class="suit('list')">
        <li
          v-for="item in items"
          :key="item.attribute"
          :class="suit('item')"
        >
          <slot
            name="item"
            :refine="item.refine"
            :item="item"
            :create-u-r-l="state.createURL"
          >
            <span :class="suit('label')">{{ capitalize(item.label) }}: </span>
            <span
              v-for="refinement in item.refinements"
              :key="createItemKey(refinement)"
              :class="suit('category')"
            >
              <slot
                name="refinement"
                :refine="item.refine"
                :refinement="refinement"
                :create-u-r-l="state.createURL"
              >
                <span :class="suit('categoryLabel')">
                  <q v-if="refinement.attribute === 'query'">{{
                    refinement.label
                  }}</q>
                  <template v-else>{{ refinement.label }}</template> </span><button
                  :class="suit('delete')"
                  type="button"
                  @click.left.exact="item.refine(refinement)"
                >
                  ✕
                </button>
              </slot>
            </span>
          </slot>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends CurrentRefinementsConnectorParamsItem = CurrentRefinementsConnectorParamsItem">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";
import type {
  CurrentRefinementsConnectorParamsItem,
  CurrentRefinementsConnectorParamsRefinement,
} from "instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements";
import type { TransformItemsTo } from "../types/transformItems";

type CurrentRefinementsProps = {
  includedAttributes?: string[];
  excludedAttributes?: string[];
  transformItems?: TransformItemsTo<CurrentRefinementsConnectorParamsItem, TItem>;
  id?: string;
};

const props = withDefaults(defineProps<CurrentRefinementsProps>(), {
  id: "",
});
const { state } = useAisWidget("currentRefinements", props.id);

const suit = useSuit("CurrentRefinements");

const items = computed(() => (state.value?.items ?? []) as Array<TItem>);

const noRefinement = computed(
  () => !!state.value && items.value.length === 0,
);

const createItemKey = ({
  attribute,
  value,
  type,
  operator,
}: CurrentRefinementsConnectorParamsRefinement) => {
  return [attribute, type, value, operator].join(":");
};

const capitalize = (value?: string) => {
  if (!value) return "";

  return (
    value.toString().charAt(0).toLocaleUpperCase() + value.toString().slice(1)
  );
};
</script>
