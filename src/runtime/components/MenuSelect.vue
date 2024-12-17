<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
      :send-event="state.sendEvent"
    >
      <select
        :class="suit('select')"
        @change="
          state.refine(($event?.currentTarget as HTMLInputElement)?.value)
        "
      >
        <option
          :class="suit('option')"
          value=""
        >
          <slot name="defaultOption">
            See all
          </slot>
        </option>
        <option
          v-for="item in state.items"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
          :selected="item.isRefined"
        >
          <slot
            name="item"
            :item="item"
          >
            {{ item.label }} ({{ item.count }})
          </slot>
        </option>
      </select>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisMenuRenderState } from "../composables/useAisMenu";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

const props = defineProps<{
  attribute: string;
}>();

const suit = useSuit("MenuSelect");
const menuRenderState = useAisMenuRenderState();
const { state: menuState } = useAisWidget("menu");

const state = computed(() => {
  return menuRenderState.value[props.attribute]
  ? menuRenderState.value[props.attribute]
  : menuState.value[props.attribute];
});
</script>
