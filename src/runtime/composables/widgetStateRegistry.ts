import { shallowReactive, toRaw, type Ref } from "vue";

export type WidgetStateRegistry = Record<string, Ref<unknown>>;

const registries = new WeakMap<object, WidgetStateRegistry>();

// One registry per InstantSearch instance. Each widget writes its state ref
// into it on its first render, and `useAisWidget` reads the ref by key. A
// lookup works at any time, so components that mount after start() (a grown
// v-for source, a late v-if branch, a kept-alive page) also find their state.
// The registry is shallow: it stores the refs themselves, not their values.
export const getWidgetStateRegistry = (instance: object): WidgetStateRegistry => {
  const key = toRaw(instance);
  let registry = registries.get(key);
  if (!registry) {
    registry = shallowReactive<WidgetStateRegistry>({});
    registries.set(key, registry);
  }
  return registry;
};

export const widgetStateKey = (widgetName: string, indexScope: string, widgetId: string) =>
  indexScope ? `${widgetName}-${indexScope}-${widgetId}` : `${widgetName}-${widgetId}`;
