<template>
  <div>
    <NuxtLoadingIndicator color="#000" />
    <NuxtLayout>
      <NuxtPage
        :keepalive="{
          max: 10,
        }"
      />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Hind:wght@400;600&family=Open+Sans:wght@300;400;600;700&display=swap",
      crossorigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "/algolia.css",
      crossorigin: "anonymous",
    },
  ],
});
</script>
