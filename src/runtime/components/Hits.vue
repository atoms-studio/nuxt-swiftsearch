<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="state.hits"
      :send-event="state.sendEvent"
    >
      <ol :class="suit('list')">
        <li
          v-for="(item, itemIndex) in state.hits"
          :key="item.objectID"
          :class="suit('item')"
        >
          <slot
            name="item"
            :item="item"
            :index="itemIndex"
          >objectID: {{ item.objectID }}, index: {{ itemIndex }}</slot>
        </li>
      </ol>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
const { state } = useAisWidget("hits");
const suit = useSuit("Hits");
</script>
