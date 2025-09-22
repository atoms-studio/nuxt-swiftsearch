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

type AisPanelClassKeys =
  | 'ais-Panel'
  | 'ais-Panel--noRefinement'
  | 'ais-Panel-header'
  | 'ais-Panel-body'
  | 'ais-Panel-footer'

type AliasKeys = 'root' | 'header' | 'body' | 'footer' | 'noRefinement'

type ClassNamesProp = Partial<Record<AisPanelClassKeys | AliasKeys, string>>

const props = withDefaults(defineProps<{
  component?: keyof RenderState["string"]
  attribute: string
  classNames?: ClassNamesProp
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
  const widgetState: any = state.value
  if (!widgetState) return false
  const candidate = props.attribute in widgetState ? widgetState[props.attribute] : widgetState
  return !!(candidate && candidate.canRefine)
})

const baseRoot   = suit()
const baseHeader = suit('header')
const baseBody   = suit('body')
const baseFooter = suit('footer')
const baseNoRef  = `${baseRoot}--noRefinement`

function resolveClass(key: AisPanelClassKeys, alias?: AliasKeys): string {
  const map = props.classNames || {}
  if (map[key]) return map[key]!
  if (alias && map[alias]) return map[alias]!
  return ''
}

const rootClass = computed(() => {
  const customRoot = resolveClass('ais-Panel', 'root')
  const noRefClass = !hasRefinements.value ? baseNoRef : ''
  return [baseRoot, customRoot, noRefClass].filter(Boolean).join(' ')
})

const headerClass = computed(() => {
  const custom = resolveClass('ais-Panel-header', 'header')
  return [baseHeader, custom].filter(Boolean).join(' ')
})

const bodyClass = computed(() => {
  const custom = resolveClass('ais-Panel-body', 'body')
  return [baseBody, custom].filter(Boolean).join(' ')
})

const footerClass = computed(() => {
  const custom = resolveClass('ais-Panel-footer', 'footer')
  return [baseFooter, custom].filter(Boolean).join(' ')
})
</script>
