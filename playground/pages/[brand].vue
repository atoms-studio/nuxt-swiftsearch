<template>
  <div>
    <SearchExperience />
    <NuxtLink to="/Samsung">
      Samsung Products
    </NuxtLink>
    <NuxtLink to="/Apple">
      Apple Products
    </NuxtLink>
    <NuxtLink to="/Nobrands">
      No products brands
    </NuxtLink>
    <NuxtLink to="/search?query=Apple">
      Search for apple
    </NuxtLink>
    <NuxtLink to="/nosearch">
      Go to no search
    </NuxtLink>
    <NuxtLink to="/">
      Go to home
    </NuxtLink>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
