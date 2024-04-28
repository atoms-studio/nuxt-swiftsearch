<template>
  <ul
    v-if="items && items.length > 0"
    :class="[
      suit('list'),
      level > 0 && suit('list', 'child'),
      suit('list', `lvl${level}`),
    ]"
  >
    <li
      v-for="item in items"
      :key="item.value"
      :class="[
        suit('item'),
        item.isRefined && suit('item', 'selected'),
        item.data && item.data.length > 0 && suit('item', 'parent'),
      ]"
    >
      <a
        :href="createURL(item.value)"
        :class="[suit('link'), item.isRefined && suit('link', 'selected')]"
        @click.prevent="refine(item.value)"
      >
        <span :class="suit('label')">{{ item.label }}</span>
        <span :class="suit('count')">{{ item.count }}</span>
      </a>
      <AisHierarchicalMenuList
        v-if="item.data"
        :items="item.data"
        :level="level + 1"
        :refine="refine"
        :create-u-r-l="createURL"
        :suit="suit"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  items: any[];
  level: number;
  refine: (item: any) => void;
  createURL: (item: any) => string;
  suit: (element?: string, modifier?: string) => string;
}>();
</script>
