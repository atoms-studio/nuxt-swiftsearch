<template>
  <div v-if="state" :class="[suit(), !state.canRefine && suit('', 'noRefinement')]">
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :send-event="state.sendEvent"
    >
      <svg style="display: none">
        <symbol id="ais-RatingMenu-starSymbol" viewBox="0 0 24 24">
          <path
            d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
          />
        </symbol>
        <symbol id="ais-RatingMenu-starEmptySymbol" viewBox="0 0 24 24">
          <path
            d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
          />
        </symbol>
      </svg>

      <ul :class="suit('list')">
        <li
          v-for="item in state.items"
          :key="item.value"
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
        >
          <div>
            <a
              :href="state.createURL(item.value)"
              :aria-label="`${item.value} & up`"
              :class="suit('link')"
              @click.exact.left.prevent="state.refine(item.value)"
            >
              <template v-for="(full, n) in item.stars" :key="n">
                <svg
                  v-if="full"
                  aria-hidden="true"
                  width="24"
                  height="24"
                  :class="[suit('starIcon'), suit('starIcon--full')]"
                >
                  <use xlink:href="#ais-RatingMenu-starSymbol" />
                </svg>
                <svg
                  v-else
                  :class="[suit('starIcon'), suit('starIcon--empty')]"
                  aria-hidden="true"
                  width="24"
                  height="24"
                >
                  <use xlink:href="#ais-RatingMenu-starEmptySymbol" />
                </svg>
              </template>

              <span :class="suit('label')" aria-hidden="true">
                <slot name="andUp">&amp; Up</slot>
              </span>
              <span :class="suit('count')">{{ item.count }}</span>
            </a>
          </div>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useAisRatingMenuRenderState } from "../composables/useAisRatingMenu";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

type RatingMenuProps = {
  id?: string;
  attribute: string;
  max?: number;
};

const props = withDefaults(defineProps<RatingMenuProps>(), { id: "" });

const suit = useSuit("RatingMenu");
const { state: ratingMenuState } = useAisWidget("ratingMenu", props.id);
const ratingMenuRenderState = useAisRatingMenuRenderState();

const state = computed(() => {
  if (props.id) {
    return ratingMenuState.value;
  }
  return ratingMenuRenderState.value[props.attribute] || ratingMenuState.value?.[props.attribute];
});
</script>
