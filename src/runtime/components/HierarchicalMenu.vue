<template>
  <div
    v-if="
      state && state.items.length && instance && hierarchicalMenuRenderState
    "
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :can-toggle-show-more="state.canToggleShowMore"
      :is-showing-more="state.isShowingMore"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :toggle-show-more="state.toggleShowMore"
      :send-event="state.sendEvent"
    >
      <hierarchical-menu-list
        :items="state.items"
        :level="0"
        :refine="state.refine"
        :create-u-r-l="state.createURL"
        :suit="suit"
      />

      <button
        v-if="showMore"
        :class="[
          suit('showMore'),
          !state.canToggleShowMore && suit('showMore', 'disabled'),
        ]"
        :disabled="!state.canToggleShowMore"
        @click.prevent="state.toggleShowMore"
      >
        <slot
          name="showMoreLabel"
          :is-showing-more="state.isShowingMore"
        >
          {{ state.isShowingMore ? "Show less" : "Show more" }}
        </slot>
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useSuit } from "../composables/useSuit";
import HierarchicalMenuList from "./HierarchicalMenuList.vue";
import { useAisHierarchicalMenuRenderState } from "../composables/useAisHierarchicalMenu";
import { computed } from "vue";
import { useAisWidget } from "../composables/useAisWidget";
const suit = useSuit("HierarchicalMenu");

const props = withDefaults(
  defineProps<{
    attribute: string;
    showMore?: boolean;
  }>(),
  {
    showMore: false,
  },
);

const hierarchicalMenuRenderState = useAisHierarchicalMenuRenderState();

const { state: hierarchicalMenuState, instance } =
  useAisWidget("hierarchicalMenu");

const state = computed(() => {
  return hierarchicalMenuRenderState.value?.[props.attribute]
    ? hierarchicalMenuRenderState.value?.[props.attribute]
    : hierarchicalMenuState.value?.[props.attribute];
});
</script>
