<template>
  <div
    v-if="state && state.results"
    :class="suit()"
  >
    <slot
      v-if="showPrevious"
      name="loadPrevious"
      :refine-previous="refinePrevious"
      :page="state.results.page"
      :is-first-page="state.isFirstPage"
    >
      <button
        :class="[
          suit('loadPrevious'),
          state.isFirstPage && suit('loadPrevious', 'disabled'),
        ]"
        :disabled="state.isFirstPage"
        @click="refinePrevious()"
      >
        Show previous results
      </button>
    </slot>

    <slot
      :items="state.hits"
      :results="state.results"
      :is-last-page="state.isLastPage"
      :refine-previous="refinePrevious"
      :refine-next="refineNext"
      :refine="refineNext"
      :send-event="state.sendEvent"
    >
      <ol :class="suit('list')">
        <li
          v-for="(item, index) in state.hits"
          :key="item.objectID"
          :class="suit('item')"
          @click="state.sendEvent('click:internal', item, 'Hit Clicked')"
          @auxclick="state.sendEvent('click:internal', item, 'Hit Clicked')"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
            :send-event="state.sendEvent"
          >
            objectID: {{ item.objectID }}, index: {{ index }}
          </slot>
        </li>
      </ol>

      <slot
        name="loadMore"
        :refine-next="refineNext"
        :refine="refineNext"
        :page="state.results.page"
        :is-last-page="state.isLastPage"
      >
        <button
          :class="[
            suit('loadMore'),
            state.isLastPage && suit('loadMore', 'disabled'),
          ]"
          :disabled="state.isLastPage"
          @click="refineNext()"
        >
          Show more results
        </button>
      </slot>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";
const { state, widgetParams } = useAisWidget("infiniteHits");

const suit = useSuit("InfiniteHits");

const showPrevious = computed(() => {
  return widgetParams.value?.showPrevious ?? false;
});

function refinePrevious() {
  state.value?.showPrevious();
}
function refineNext() {
  state.value?.showMore();
}
</script>
