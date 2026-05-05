<template>
  <div v-if="state" :class="[suit(), !state.canRefine && suit('', 'noRefinement')]">
    <slot
      :items="items"
      :can-refine="state.canRefine"
      :can-toggle-show-more="state.canToggleShowMore"
      :is-showing-more="state.isShowingMore"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :toggle-show-more="state.toggleShowMore"
      :send-event="state.sendEvent"
    >
      <hierarchical-menu-list
        :items="items"
        :level="0"
        :refine="state.refine"
        :create-u-r-l="state.createURL"
        :suit="suit"
      />

      <button
        v-if="showMore"
        :class="[suit('showMore'), !state.canToggleShowMore && suit('showMore', 'disabled')]"
        :disabled="!state.canToggleShowMore"
        @click.prevent="state.toggleShowMore"
      >
        <slot name="showMoreLabel" :is-showing-more="state.isShowingMore">
          {{ state.isShowingMore ? "Show less" : "Show more" }}
        </slot>
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends HierarchicalMenuItem = HierarchicalMenuItem">
import type {
  HierarchicalMenuConnectorParams,
  HierarchicalMenuItem,
} from "instantsearch.js/es/connectors/hierarchical-menu/connectHierarchicalMenu";
import { useSuit } from "../composables/useSuit";
import HierarchicalMenuList from "./HierarchicalMenuList.vue";
import type { TransformItemsTo } from "../types/transformItems";
import { computed } from "vue";
import { useAisWidget } from "../composables/useAisWidget";
import { useAisHierarchicalMenuRenderState } from "../composables/useAisHierarchicalMenu";

type HierarchicalMenuProps = {
  id?: string;
  attribute?: string;
  attributes?: string[];
  limit?: number;
  showMoreLimit?: number;
  showMore?: boolean;
  sortBy?: HierarchicalMenuConnectorParams["sortBy"];
  separator?: string;
  rootPath?: string;
  showParentLevel?: boolean;
  transformItems?: TransformItemsTo<HierarchicalMenuItem, TItem>;
};

const suit = useSuit("HierarchicalMenu");

const props = withDefaults(defineProps<HierarchicalMenuProps>(), {
  id: "",
  attribute: undefined,
  showMore: false,
  attributes: () => [],
});

const { state: hierarchicalMenuState } = useAisWidget("hierarchicalMenu", props.id);
const hierarchicalMenuRenderState = useAisHierarchicalMenuRenderState();

const stateAttribute = computed(() => {
  return props.attribute ?? props.attributes[0];
});

const state = computed(() => {
  if (props.id) {
    return hierarchicalMenuState.value;
  }
  if (!stateAttribute.value) return null;
  return (
    hierarchicalMenuRenderState.value[stateAttribute.value] ||
    hierarchicalMenuState.value?.[stateAttribute.value]
  );
});

const items = computed(() => (state.value?.items ?? []) as Array<TItem>);
</script>
