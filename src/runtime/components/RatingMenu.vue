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
      :max="max"
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
            <span :class="suit('label')">{{ renderStars(Number(item.value), max ?? 5) }} & Up</span>
            <span :class="suit('count')">({{ item.count }})</span>
          </a>
        </li>
      </ul>
    </slot>
  </div>
  <div v-else>
    Rating Menu: No state available
  </div>
</template>

<script setup lang="ts">
import { useAisRatingMenuRenderState } from "../composables/useAisRatingMenu";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

const props = defineProps<{
    attribute: string;
    max?: number;
}>();

const suit = useSuit("Rating");
const ratingMenuRenderState = useAisRatingMenuRenderState();
const { state: ratingMenuState } = useAisWidget("ratingMenu");

const state = computed(() => {
  try {
    return ratingMenuRenderState.value[props.attribute]
      ? ratingMenuRenderState.value[props.attribute]
      : ratingMenuState.value?.[props.attribute];
  } catch (error) {
    console.warn('RatingMenu: Error accessing state:', error);
    return null;
  }
});

const renderStars = (rating: number, max: number) => {
  const filledStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(max - rating);
  return filledStars + emptyStars;
};
</script>
