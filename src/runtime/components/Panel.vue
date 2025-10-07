<template>
  <div v-if="state" :class="[suit(), !canRefine && suit('', 'noRefinement')]">
    <div v-if="$slots.header" :class="suit('header')">
      <slot name="header" :has-refinements="canRefine" />
    </div>

    <div :class="suit('body')">
      <slot :has-refinements="canRefine" />
    </div>

    <div v-if="$slots.footer" :class="suit('footer')">
      <slot name="footer" :has-refinements="canRefine" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RenderState } from 'instantsearch.js'
import { useAisWidget } from '../composables/useAisWidget'
import { useSuit } from '../composables/useSuit'

const props = withDefaults(defineProps<{
  component?: keyof RenderState["string"]
  attribute: string
}>(), {
  component: undefined,
})

defineSlots<{
  default(props: { hasRefinements: boolean }): unknown
  header(props: { hasRefinements: boolean }): unknown
  footer(props: { hasRefinements: boolean }): unknown
}>()

const suit = useSuit('Panel')
const { state } = useAisWidget(props.component as keyof RenderState["string"])

const canRefine = computed<boolean>(() => {
  const widgetState: any = state.value
  if (!widgetState) return false
  const candidate = props.attribute in widgetState ? widgetState[props.attribute] : widgetState
  return !!(candidate && candidate.canRefine)
})

</script>
