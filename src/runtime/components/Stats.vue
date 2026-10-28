<template>
  <div v-if="state" :class="suit()">
    <slot v-bind="state" :results="instance.helper?.lastResults">
      <!-- prettier-ignore -->
      <span :class="suit('text')"><template v-if="state.areHitsSorted">{{ sortedResultsSentence }}</template><template v-else>{{ resultsSentence }}</template> found in {{ state.processingTimeMS.toLocaleString() }}ms</span>
    </slot>
    <span
      :class="suit('announcement')"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      :style="visuallyHiddenStyle"
      >{{ announcement }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(defineProps<{ id?: string }>(), { id: "" });

const { instance, state } = useAisWidget("stats", props.id);

const suit = useSuit("Stats");

const sortedResultsSentence = computed(() => {
  if (!state.value) return "";
  const { nbHits, nbSortedHits } = state.value;

  const suffix = `sorted out of ${nbHits.toLocaleString()}`;

  if (nbSortedHits === 0) {
    return `No relevant results ${suffix}`;
  }

  if (nbSortedHits === 1) {
    return `1 relevant result ${suffix}`;
  }

  if (nbSortedHits && nbSortedHits > 1) {
    return `${(nbSortedHits || 0).toLocaleString()} relevant results ${suffix}`;
  }

  return "";
});

const resultsSentence = computed(() => {
  if (!state.value) return "";
  const { nbHits } = state.value;

  if (nbHits === 0) {
    return "No results";
  }

  if (nbHits === 1) {
    return "1 result";
  }

  if (nbHits > 1) {
    return `${nbHits.toLocaleString()} results`;
  }

  return "";
});

// Screen readers hear the result count when it changes, as in vue-instantsearch.
// The delay lets fast typing settle. Like upstream, the first change is not announced.
// The style values use the browser-normalized form, so SSR markup and client
// markup are the same.
const ANNOUNCEMENT_DELAY_MS = 1400;
const visuallyHiddenStyle = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0px",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  whiteSpace: "nowrap",
  border: "0px",
} as const;

const announcement = ref("");
let announcementTimer: ReturnType<typeof setTimeout> | undefined;
let isInitialAnnouncement = true;

watch(
  () => (state.value?.areHitsSorted ? sortedResultsSentence.value : resultsSentence.value),
  (text) => {
    if (isInitialAnnouncement) {
      isInitialAnnouncement = false;
      return;
    }
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => {
      announcement.value = text;
    }, ANNOUNCEMENT_DELAY_MS);
  },
);

onBeforeUnmount(() => clearTimeout(announcementTimer));
</script>
