<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})
</script>

<template>
  <div>
    <h1>{{ error.statusCode === 404 ? 'Page not found' : 'Error' }}</h1>
    <p>{{ error.statusMessage || 'Something went wrong' }}</p>
    <button @click="clearError()">
      Go back
    </button>
  </div>
</template>
