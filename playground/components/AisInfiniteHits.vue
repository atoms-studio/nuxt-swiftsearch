<template>
  <div v-if="state && state.results" :class="suit()">
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
      :items="items"
      :results="state.results"
      :is-last-page="state.isLastPage"
      :refine-previous="refinePrevious"
      :refine-next="refineNext"
      :refine="refineNext"
      :send-event="state.sendEvent"
    >
      <ol :class="suit('list')">
        <li
          v-for="(item, index) in items"
          :class="suit('item')"
          :key="item.objectID"
          @click="state.sendEvent('click:internal', item, 'Hit Clicked')"
          @auxclick="state.sendEvent('click:internal', item, 'Hit Clicked')"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
            :send-event="state.sendEvent"
          >
            objectID: {{ item.name }}, index: {{ index }}
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
const { state, widgetParams } = useWidget("infiniteHits");

const suit = useSuit("infinite-hits");

const showPrevious = computed(() => {
  return widgetParams.value?.showPrevious ?? false;
});

const items = computed(() => {
  // Fixes InstantSearch.js connectors API: every list
  // of things must be called `items`
  return state.value?.hits;
});
function refinePrevious() {
  state.value?.showPrevious();
}
function refineNext() {
  state.value?.showMore();
}
</script>
