<template>
  <div :class="suit()">
    <slot v-bind="{ items }">
      <div
        v-for="(item, index) in items"
        :key="index"
      >
        <slot
          name="item"
          :item="item"
        >
          <div>{{ item }}</div>
        </slot>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { computed } from "vue";
import { useSuit } from "../composables/useSuit";

const { state } = useAisWidget("queryRules");
const suit = useSuit("QueryRuleCustomData");

const items = computed(() => {
  return state.value?.items || [];
});
</script>
