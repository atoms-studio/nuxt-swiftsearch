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

<script setup></script>
