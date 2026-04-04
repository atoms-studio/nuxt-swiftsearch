<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="items"
      :send-event="state.sendEvent"
    >
      <ol :class="suit('list')">
        <li
          v-for="(item, itemIndex) in items"
          :key="item.objectID"
          :class="suit('item')"
        >
          <slot
            name="item"
            :item="item"
            :index="itemIndex"
          >
            objectID: {{ item.objectID }}, index: {{ itemIndex }}
          </slot>
        </li>
      </ol>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="THit extends NonNullable<object> = BaseHit">
import type { BaseHit, Hit } from "instantsearch.js/es/types";
import { computed } from "vue";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";

type HitsProps = {
  showBanner?: boolean;
  escapeHTML?: boolean;
  transformItems?: TransformItemsTo<Hit<BaseHit>, Hit<THit>>;
};

defineProps<HitsProps>();

const { state } = useAisWidget("hits");
const suit = useSuit("Hits");
const items = computed(() => (state.value?.items ?? []) as Array<Hit<THit>>);
</script>
