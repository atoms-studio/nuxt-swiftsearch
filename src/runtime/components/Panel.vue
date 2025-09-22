<template>
  <div
    v-if="state"
    :class="rootClass"
  >
    <div :class="headerClass">
      <slot
        name="header"
        :has-refinements="hasRefinements"
      />
    </div>

    <div :class="bodyClass">
      <slot :has-refinements="hasRefinements" />
    </div>

    <div :class="footerClass">
      <slot
        name="footer"
        :has-refinements="hasRefinements"
      />
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
  classNames?: Record<string, string>
}>(), {
  component: undefined,
  classNames: () => ({})
})

defineSlots<{
  default(props: { hasRefinements: boolean }): unknown
  header(props: { hasRefinements: boolean }): unknown
  footer(props: { hasRefinements: boolean }): unknown
}>()

const suit = useSuit('Panel')

const { state } = useAisWidget(props.component as keyof RenderState["string"])

const hasRefinements = computed<boolean>(() => {
  const s: any = state.value
  if (!s) return false
  const r = props.attribute in s ? s[props.attribute] : s
  return !!(r && r.canRefine)
})

const baseRoot = suit()
const noRefine = `${baseRoot}--noRefinement`
const baseHeader = suit('header')
const baseBody = suit('body')
const baseFooter = suit('footer')

function resolve(key: string): string {
  return props.classNames[key] || ''
}

const rootClass = computed(() => {
  const base = baseRoot
  const custom = resolve('root')
  const noRefinement = !hasRefinements.value ? noRefine : ''
  return [base, custom, noRefinement].filter(Boolean).join(' ')
})

const headerClass = computed(() => {
  const base = baseHeader
  const custom = resolve('header')
  return [base, custom].filter(Boolean).join(' ')
})

const bodyClass = computed(() => {
  const base = baseBody
  const custom = resolve('body')
  return [base, custom].filter(Boolean).join(' ')
})

const footerClass = computed(() => {
  const base = baseFooter
  const custom = resolve('footer')
  return [base, custom].filter(Boolean).join(' ')
})
</script>
