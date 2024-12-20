<template>
  <div
    v-if="state"
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
      <ul :class="suit('list')">
        <li
          v-for="item in state.items"
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
        :class="[
          suit('showMore'),
          !state.canToggleShowMore && suit('showMore', 'disabled'),
        ]"
        :disabled="!state.canToggleShowMore"
        @click.prevent="toggleShowMore"
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
import { useAisMenuRenderState } from "../composables/useAisMenu";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    attribute: string;
    showMore?: boolean;
  }>(),
  {
    showMore: false,
  }
);

const suit = useSuit("Menu");
const menuRenderState = useAisMenuRenderState();
const { state: menuState } = useAisWidget("menu");

const state = computed(() => {
  return menuRenderState.value[props.attribute]
    ? menuRenderState.value[props.attribute]
    : menuState.value[props.attribute];
});

const toggleShowMore = () => {
  state.value.toggleShowMore();
};

const showMoreButton = computed(() => {
  return state.value.canRefine && props.showMore;
});
</script>
