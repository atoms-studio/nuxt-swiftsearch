<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot v-bind="rootSlotProps">
      <button
        type="button"
        :class="suit('button')"
        :title="state.isBrowserSupported ? buttonTitle : disabledButtonTitle"
        :disabled="!state.isBrowserSupported"
        @click="handleClick"
      >
        <slot
          name="buttonText"
          v-bind="innerSlotProps"
        >
          <svg
            v-if="errorNotAllowed"
            v-bind="buttonSvgAttrs"
          >
            <line
              x1="1"
              y1="1"
              x2="23"
              y2="23"
            />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line
              x1="12"
              y1="19"
              x2="12"
              y2="23"
            />
            <line
              x1="8"
              y1="23"
              x2="16"
              y2="23"
            />
          </svg>

          <svg
            v-else
            v-bind="buttonSvgAttrs"
          >
            <path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              :fill="state.isListening ? 'currentColor' : 'none'"
            />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line
              x1="12"
              y1="19"
              x2="12"
              y2="23"
            />
            <line
              x1="8"
              y1="23"
              x2="16"
              y2="23"
            />
          </svg>
        </slot>
      </button>

      <div :class="suit('status')">
        <slot
          name="status"
          v-bind="innerSlotProps"
        >
          <p>{{ state.voiceListeningState.transcript }}</p>
        </slot>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { PlainSearchParameters } from "algoliasearch-helper";
import { computed } from "vue";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

type VoiceSearchProps = {
  searchAsYouSpeak?: boolean;
  language?: string;
  additionalQueryParameters?: (params: { query: string }) => PlainSearchParameters | void;
  buttonTitle?: string;
  disabledButtonTitle?: string;
  id?: string;
};

const props = withDefaults(defineProps<VoiceSearchProps>(), {
  searchAsYouSpeak: undefined,
  language: undefined,
  additionalQueryParameters: undefined,
  buttonTitle: "Search by voice",
  disabledButtonTitle: "Search by voice (not supported on this browser)",
  id: "",
});

const { state } = useAisWidget("voiceSearch", props.id);
const suit = useSuit("VoiceSearch");

const buttonSvgAttrs = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const errorNotAllowed = computed(() => {
  if (!state.value) {
    return false;
  }

  return (
    state.value.voiceListeningState.status === "error"
    && state.value.voiceListeningState.errorCode === "not-allowed"
  );
});

const rootSlotProps = computed(() => ({
  isBrowserSupported: state.value.isBrowserSupported,
  isListening: state.value.isListening,
  toggleListening: state.value.toggleListening,
  voiceListeningState: state.value.voiceListeningState,
}));

const innerSlotProps = computed(() => ({
  status: state.value.voiceListeningState.status,
  errorCode: state.value.voiceListeningState.errorCode,
  isListening: state.value.isListening,
  transcript: state.value.voiceListeningState.transcript,
  isSpeechFinal: state.value.voiceListeningState.isSpeechFinal,
  isBrowserSupported: state.value.isBrowserSupported,
}));

const handleClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLButtonElement | null;
  target?.blur();
  state.value.toggleListening();
};

const { buttonTitle, disabledButtonTitle } = props;
</script>
