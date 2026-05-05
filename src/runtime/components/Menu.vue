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
      <ul :class="suit('list')">
        <li
          v-for="item in items"
          :key="item.value"
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
        >
          <a
            :href="state.createURL(item.value)"
            :class="suit('link')"
            @click.exact.left.prevent="state.refine(item.value)"
          >
            <span :class="suit('label')">{{ item.label }}</span>
            <span :class="suit('count')">{{ item.count }}</span>
          </a>
        </li>
      </ul>

      <button
        v-if="showMoreButton"
        :class="[suit('showMore'), !state.canToggleShowMore && suit('showMore', 'disabled')]"
        :disabled="!state.canToggleShowMore"
        @click.prevent="toggleShowMore"
      >
        <slot name="showMoreLabel" :is-showing-more="state.isShowingMore">
          {{ state.isShowingMore ? "Show less" : "Show more" }}
        </slot>
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends MenuItem = MenuItem">
import type {
  MenuConnectorParams,
  MenuItem,
} from "instantsearch.js/es/connectors/menu/connectMenu";
import { useAisWidget } from "../composables/useAisWidget";
import { useAisMenuRenderState } from "../composables/useAisMenu";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";
import { computed } from "vue";

type MenuProps = {
  id?: string;
  attribute: string;
  limit?: number;
  showMoreLimit?: number;
  showMore?: boolean;
  sortBy?: MenuConnectorParams["sortBy"];
  transformItems?: TransformItemsTo<MenuItem, TItem>;
};

const props = withDefaults(defineProps<MenuProps>(), {
  id: "",
  showMore: false,
});

const suit = useSuit("Menu");
const { state: menuState } = useAisWidget("menu", props.id);
const menuRenderState = useAisMenuRenderState();

const state = computed(() => {
  if (props.id) {
    return menuState.value;
  }
  return menuRenderState.value[props.attribute] || menuState.value?.[props.attribute];
});

const items = computed(() => (state.value?.items ?? []) as Array<TItem>);

const toggleShowMore = () => {
  state.value.toggleShowMore();
};

const showMoreButton = computed(() => {
  return state.value.canRefine && props.showMore;
});
</script>
