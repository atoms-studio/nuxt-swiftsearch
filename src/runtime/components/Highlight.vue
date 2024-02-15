<template>
  <AisHighlighter
    :hit="hit"
    :attribute="attribute"
    :highlighted-tag-name="highlightedTagName"
    :suit="suit"
    highlight-property="_highlightResult"
    pre-tag="<mark>"
    post-tag="</mark>"
  />
</template>

<script setup lang="ts">
import type { Hit } from "instantsearch.js";
import { useSuit } from "../composables/useSuit";

const suit = useSuit("Highlight");
withDefaults(
  defineProps<{
    hit: Hit;
    attribute: string;
    highlightedTagName?: string;
  }>(),
  {
    highlightedTagName: "mark",
  },
);
</script>
