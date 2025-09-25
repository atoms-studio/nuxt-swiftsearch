<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :refine="state.refine"
      :current-refinement="state.currentRefinement"
      :indices="state.indices"
    >
      <ClientOnly>
        <p>
          This widget doesn't render anything without a filled in default slot.
        </p>
        <p>query, function to refine and results are provided.</p>
        <pre>refine: Function</pre>
        <pre>currentRefinement: "{{ state.currentRefinement }}"</pre>
        <details>
          <summary><code>indices</code>:</summary>
          <pre>{{ state.indices }}</pre>
        </details>
      </ClientOnly>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

const props = withDefaults(defineProps<{ id?: string }>(), {
  id: ''
})
const { state } = useAisWidget("autocomplete", props.id);

const suit = useSuit("autocomplete");
</script>
