<template>
  <div :class="[suit(), suit('', theme)]">
    <a
      :class="suit('link')"
      :href="algoliaUrl"
      target="_blank"
      rel="noopener"
      aria-label="search by Algolia"
    >
      <slot>
        Search by <span :class="suit('logo')">Algolia</span>
      </slot>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

type PoweredByProps = {
  url?: string;
  theme?: "light" | "dark";
  id?: string;
};

const props = withDefaults(defineProps<PoweredByProps>(), {
  theme: "light",
  id: "",
});

const { state } = useAisWidget("poweredBy", props.id);
const suit = useSuit("PoweredBy");

const algoliaUrl = computed(() => {
  return state.value?.url || props.url || "https://www.algolia.com/";
});
</script>
