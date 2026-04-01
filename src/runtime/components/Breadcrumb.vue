<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="items"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
    >
      <ul :class="suit('list')">
        <li
          :class="[suit('item'), !items.length && suit('item', 'selected')]"
        >
          <a
            :href="state.createURL(null)"
            :class="suit('link')"
            @click.exact.left.prevent="state.refine(null)"
          >
            <slot name="rootLabel">
              Home
            </slot>
          </a>
        </li>
        <li
          v-for="(item, index) in items"
          :key="createItemKey(item, index)"
          :class="[suit('item'), isLastItem(index) && suit('item', 'selected')]"
        >
          <span
            :class="suit('separator')"
            aria-hidden="true"
          >
            <slot name="separator">></slot>
          </span>
          <a
            v-if="!isLastItem(index)"
            :href="state.createURL(item.value)"
            :class="suit('link')"
            @click.exact.left.prevent="state.refine(item.value)"
          >
            {{ item.label }}
          </a>
          <template v-else>
            {{ item.label }}
          </template>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends BreadcrumbConnectorParamsItem = BreadcrumbConnectorParamsItem">
import type {
  BreadcrumbConnectorParamsItem,
} from "instantsearch.js/es/connectors/breadcrumb/connectBreadcrumb";
import { computed } from "vue";
import { useAisBreadcrumbRenderState } from "../composables/useAisBreadcrumb";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";

type BreadcrumbProps = {
  attributes: string[];
  separator?: string;
  rootPath?: string;
  transformItems?: TransformItemsTo<BreadcrumbConnectorParamsItem, TItem>;
  id?: string;
};

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  id: "",
});

const { state: breadcrumbState } = useAisWidget("breadcrumb", props.id);
const breadcrumbRenderState = useAisBreadcrumbRenderState(props.id);
const suit = useSuit("Breadcrumb");

const attribute = computed(() => props.attributes[0] || "");

const state = computed(() => {
  if (props.id) {
    return breadcrumbState.value;
  }

  return (
    breadcrumbRenderState.value[attribute.value]
    || breadcrumbState.value?.[attribute.value]
  );
});

const items = computed(() => (state.value?.items ?? []) as Array<TItem>);

const isLastItem = (index: number) => {
  return items.value.length - 1 === index;
};

const createItemKey = (item: TItem, index: number) => {
  return `${item.label}-${index}`;
};
</script>
