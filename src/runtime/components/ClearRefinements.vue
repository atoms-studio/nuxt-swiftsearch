<template>
  <div v-if="state" :class="suit()">
    <slot :can-refine="canRefine" :refine="state.refine" :create-u-r-l="state.createURL">
      <button
        type="reset"
        :class="[suit('button'), !canRefine && suit('button', 'disabled')]"
        :disabled="!canRefine"
        @click.prevent="refine"
      >
        <slot name="resetLabel"> Clear refinements </slot>
      </button>
    </slot>
  </div>
</template>
<script setup lang="ts">
import type { ClearRefinementsConnectorParams } from "instantsearch.js/es/connectors/clear-refinements/connectClearRefinements";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

type ClearRefinementsProps = {
  excludedAttributes?: string[];
  includedAttributes?: string[];
  transformItems?: ClearRefinementsConnectorParams["transformItems"];
  id?: string;
};

const props = withDefaults(defineProps<ClearRefinementsProps>(), {
  id: "",
});
const { state } = useAisWidget("clearRefinements", props.id);
const canRefine = computed(() => state.value?.canRefine);
const refine = () => state.value!.refine();

const suit = useSuit("ClearRefinements");
</script>
