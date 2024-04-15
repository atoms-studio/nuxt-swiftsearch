<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :can-refine="canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
    >
      <button
        type="reset"
        :class="[suit('button'), !canRefine && suit('button', 'disabled')]"
        :disabled="!canRefine"
        @click.prevent="refine"
      >
        <slot name="resetLabel">
          Clear refinements
        </slot>
      </button>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";
const { state } = useAisWidget("clearRefinements");

const props = defineProps<{
  includedAttributes?: string[]
  excludedAttributes?: string[]
}>()

const suit = useSuit("ClearRefinements");
const { parentIndex} = useInstantSearch()
const canRefine = computed(() => state.value.hasRefinements);

const refine = async () => {
  if(props.includedAttributes && props.excludedAttributes){
    throw new Error('The options `includedAttributes` and `excludedAttributes` cannot be used together.')
    return
  }
  const helper = parentIndex.value.getHelper();

  if(props.includedAttributes && helper){
    props.includedAttributes.map(attributeToClear => {
      helper.clearRefinements(attributeToClear).search()
    })
    return
  }
  if(props.excludedAttributes && props.excludedAttributes.length > 0 && helper){
    const activeFacets = helper?.state.disjunctiveFacets
    const filterFacetToClear = activeFacets.filter(item => props.excludedAttributes && !props.excludedAttributes.includes(item));
    filterFacetToClear.map(attributeToClear => {
      helper.clearRefinements(attributeToClear).search()
    })
    return
  }
  state.value.refine()
}
</script>
