<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="items"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :send-event="state.sendEvent"
    >
      <select
        :class="suit('select')"
        @change="
          state.refine(($event?.currentTarget as HTMLInputElement)?.value)
        "
      >
        <option
          :class="suit('option')"
          value=""
        >
          <slot name="defaultOption">
            See all
          </slot>
        </option>
        <option
          v-for="item in items"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
          :selected="item.isRefined"
        >
          <slot
            name="item"
            :item="item"
          >
            {{ item.label }} ({{ item.count }})
          </slot>
        </option>
      </select>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends MenuItem = MenuItem">
import type {
  MenuConnectorParams,
  MenuItem,
} from "instantsearch.js/es/connectors/menu/connectMenu";
import { useAisMenuRenderState } from "../composables/useAisMenu";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";
import { computed } from "vue";

type MenuSelectProps = {
  attribute: string;
  limit?: number;
  sortBy?: MenuConnectorParams["sortBy"];
  transformItems?: TransformItemsTo<MenuItem, TItem>;
};

const props = defineProps<MenuSelectProps>();

const suit = useSuit("MenuSelect");
const menuRenderState = useAisMenuRenderState();
const { state: menuState } = useAisWidget("menu");

const state = computed(() => {
  return menuRenderState.value[props.attribute]
  ? menuRenderState.value[props.attribute]
  : menuState.value[props.attribute];
});

const items = computed(() => (state.value?.items ?? []) as Array<TItem>);
</script>
