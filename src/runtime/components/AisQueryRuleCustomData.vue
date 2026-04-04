<template>
  <div :class="suit()">
    <slot v-bind="{ items }">
      <div v-for="(item, index) in items" :key="index">
        <slot name="item" :item="item">
          <div>{{ item }}</div>
        </slot>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends NonNullable<object> = Record<string, unknown>">
import { useAisWidget } from "../composables/useAisWidget";
import { computed } from "vue";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";

defineProps<{
  transformItems?: TransformItemsTo<Record<string, unknown>, TItem & Record<string, unknown>>;
}>();

const { state } = useAisWidget("queryRules");
const suit = useSuit("QueryRuleCustomData");

const items = computed(() => {
  return (state.value?.items || []) as Array<TItem>;
});
</script>
