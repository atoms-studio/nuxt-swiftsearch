<script lang="ts" setup>
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

const { state } = useAisWidget("pagination");
const suit = useSuit("Pagination");

withDefaults(defineProps<{
  showFirst?: boolean
  showLast?: boolean
  showNext?: boolean
  showPrevious?: boolean
}>(), {
  showFirst: true,
  showLast: true,
  showNext: true,
  showPrevious: true
})

const emit = defineEmits<{
  (e: "page-change", page: number): void
}>()

const refine = (page: number) => {
  const p = Math.min(Math.max(page, 0), state.value.nbPages - 1);
  state.value.refine(p);
  emit('page-change', p);
}
</script>
<template>
  <div v-if="state" :class="suit()">
    <slot :refine="refine" :create-u-r-l="state.createURL" :current-refinement="state.currentRefinement"
      :nb-hits="state.nbHits" :nb-pages="state.nbPages" :pages="state.pages" :is-first-page="state.isFirstPage"
      :is-last-page="state.isLastPage">
      <ul :class="suit('list')">
        <li v-if="showFirst" :class="{
          [suit('item')]: true,
          [suit('item', 'disabled')]: state.isFirstPage,
          [suit('item', 'firstPage')]: true,

        }">
          <slot name="first" :create-u-r-l="() => state.createURL(0)" :is-first-page="state.isFirstPage"
            :refine="() => refine(0)">
            <template v-if="!state.isFirstPage">
              <a :class="suit('link')" aria-label="First Page" :href="state.createURL(0)"
                @click.prevent="refine(0)">‹‹</a>
            </template>
            <template v-else>
              <span :class="suit('link')" aria-label="First Page">‹‹</span>
            </template>
          </slot>
        </li>
        <li v-if="showPrevious" :class="{
          [suit('item')]: true,
          [suit('item', 'disabled')]: state.isFirstPage,
          [suit('item', 'previousPage')]: true,

        }">
          <slot name="previous" :create-u-r-l="() => state.createURL(state.currentRefinement - 1)"
            :is-first-page="state.isFirstPage" :refine="() => refine(state.currentRefinement - 1)">
            <template v-if="!state.isFirstPage">
              <a :class="suit('link')" aria-label="Previous Page" :href="state.createURL(state.currentRefinement - 1)"
                @click.prevent="refine(state.currentRefinement - 1)">‹</a>
            </template>
            <template v-else>
              <span :class="suit('link')" aria-label="Previous Page">‹</span>
            </template>
          </slot>
        </li>

        <li v-for="(page, i) in state.pages" :key="page" :class="{
          [suit('item')]: true,
          [suit('item', 'page')]: true,
          [suit('item', 'selected')]: state.currentRefinement === page
        }">
          <slot name="item" :page="page" :create-u-r-l="() => state.createURL(page)" :is-first-page="state.isFirstPage"
            :is-last-page="state.isLastPage" :refine="() => refine(page)">
            <a :class="suit('link')" :href="state.createURL(page)" :aria-label="'Page ' + (i + 1)"
              @click.prevent="refine(page)">{{
                page + 1 }}</a>
          </slot>
        </li>

        <li v-if="showNext" :class="{
          [suit('item')]: true,
          [suit('item', 'nextPage')]: true,
          [suit('item', 'disabled')]: state.isLastPage
        }">
          <slot name="next" :create-u-r-l="() => state.createURL(state.currentRefinement + 1)"
            :is-last-page="state.isLastPage" :refine="() => refine(state.currentRefinement + 1)">
            <template v-if="!state.isLastPage">
              <a :class="suit('link')" aria-label="Next Page" :href="state.createURL(state.currentRefinement + 1)"
                @click.prevent="refine(state.currentRefinement + 1)">›</a>
            </template>
            <template v-else>
              <span :class="suit('link')" aria-label="Next Page">›</span>
            </template>
          </slot>
        </li>
        <li v-if="showLast" :class="{
          [suit('item')]: true,
          [suit('item', 'lastPage')]: true,
          [suit('item', 'disabled')]: state.isLastPage,
        }">
          <slot name="last" :create-u-r-l="() => state.createURL(state.nbPages - 1)" :is-last-page="state.isLastPage"
            :refine="() => refine(state.nbPages - 1)">
            <template v-if="!state.isLastPage">
              <a :class="suit('link')" :aria-label="'Last Page, Page ' + state.nbPages"
                :href="state.createURL(state.nbPages - 1)" @click.prevent="refine(state.nbPages - 1)">››</a>
            </template>
            <template v-else>
              <span :class="suit('link')" :aria-label="'Last Page, Page ' + state.nbPages">››</span>
            </template>
          </slot>
        </li>
      </ul>
    </slot>
  </div>
</template>
