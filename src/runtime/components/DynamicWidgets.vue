<template>
  <div
    :class="suit()"
    :hidden="hidden"
  >
    <div
      v-for="entry in renderedEntries"
      :key="entry.key"
      :class="suit('widget')"
    >
      <RenderVNode :vnode="entry.vnode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  type PropType,
  type Slot,
  type VNode,
  useSlots,
} from "vue";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

type DynamicWidgetsProps = {
  transformItems?: (...args: any[]) => any;
  facets?: ["*"] | string[];
  maxValuesPerFacet?: number;
  id?: string;
};

const props = withDefaults(defineProps<DynamicWidgetsProps>(), {
  id: "",
});

const { state } = useAisWidget("dynamicWidgets", props.id);
const suit = useSuit("DynamicWidgets");
const slots = useSlots();

const getWidgetAttribute = (vnode: VNode): string | undefined => {
  const vnodeProps = vnode.props as Record<string, any> | null;
  if (vnodeProps) {
    if (typeof vnodeProps.attribute === "string") {
      return vnodeProps.attribute;
    }

    if (
      Array.isArray(vnodeProps.attributes)
      && typeof vnodeProps.attributes[0] === "string"
    ) {
      return vnodeProps.attributes[0];
    }
  }

  if (!vnode.children) {
    return undefined;
  }

  if (Array.isArray(vnode.children)) {
    for (const child of vnode.children) {
      if (typeof child === "object" && child !== null) {
        const attribute = getWidgetAttribute(child as VNode);
        if (attribute) {
          return attribute;
        }
      }
    }

    return undefined;
  }

  if (typeof vnode.children === "object") {
    const defaultSlot = (vnode.children as { default?: Slot }).default;
    const children = defaultSlot?.() || [];
    for (const child of children) {
      const attribute = getWidgetAttribute(child);
      if (attribute) {
        return attribute;
      }
    }
  }

  return undefined;
};

const componentEntries = computed(() => {
  const entries = new Map<string, VNode>();
  const children = slots.default?.() || [];

  for (const vnode of children) {
    const attribute = getWidgetAttribute(vnode);
    if (attribute) {
      entries.set(attribute, vnode);
    }
  }

  return entries;
});

const renderedEntries = computed(() => {
  const entries: Array<{ key: string; vnode: VNode }> = [];
  const components = componentEntries.value;

  if (!state.value) {
    components.forEach((vnode, key) => {
      entries.push({ key, vnode });
    });

    return entries;
  }

  for (const attribute of state.value.attributesToRender) {
    const vnode = components.get(attribute);
    if (vnode) {
      entries.push({ key: attribute, vnode });
    }
  }

  return entries;
});

const hidden = computed(() => {
  return !state.value;
});

const RenderVNode = defineComponent({
  name: "AisDynamicWidgetsRenderVNode",
  props: {
    vnode: {
      type: Object as PropType<VNode>,
      required: true,
    },
  },
  setup(renderProps) {
    return () => renderProps.vnode;
  },
});
</script>
