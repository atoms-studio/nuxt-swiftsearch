import { describe, expect, it } from "vitest";
import { computed, reactive, ref } from "vue";
import { createWidgetIdScope } from "../src/runtime/composables/widgetIdScope";
import {
  getWidgetStateRegistry,
  widgetStateKey,
} from "../src/runtime/composables/widgetStateRegistry";

const renderStateFor = (instantSearchInstance: object, value = "state") =>
  ref({ instantSearchInstance, value });

describe("widget state registry", () => {
  it("keeps one registry per InstantSearch instance, also through reactive proxies", () => {
    const instanceA = {};
    const instanceB = {};

    const registryA = getWidgetStateRegistry(instanceA);

    expect(getWidgetStateRegistry(instanceB)).not.toBe(registryA);
    expect(getWidgetStateRegistry(instanceA)).toBe(registryA);
    expect(getWidgetStateRegistry(reactive(instanceA))).toBe(registryA);
  });

  it("registers the state ref under the instance from the render state", () => {
    const instance = {};
    const stateRef = renderStateFor(instance);

    createWidgetIdScope("swiftsearch-1-2-brand").provideWidgetState("refinementList", stateRef);

    // the registry stores the ref itself, so readers follow later renders
    expect(getWidgetStateRegistry(instance)["refinementList-swiftsearch-1-2-brand"]).toBe(stateRef);
  });

  it("scopes registry keys by index", () => {
    const instance = {};
    const scope = createWidgetIdScope("shared-clear");
    scope.setIndexScope("bnb2");
    scope.provideWidgetState("clearRefinements", renderStateFor(instance));

    const registry = getWidgetStateRegistry(instance);
    expect(registry[widgetStateKey("clearRefinements", "bnb2", "shared-clear")]).toBeDefined();
    expect(registry[widgetStateKey("clearRefinements", "", "shared-clear")]).toBeUndefined();
  });

  it("overwrites a key when the same widget id registers again (remove + re-add)", () => {
    const instance = {};
    const fresh = renderStateFor(instance, "fresh");

    createWidgetIdScope("id-1").provideWidgetState("refinementList", renderStateFor(instance));
    createWidgetIdScope("id-1").provideWidgetState("refinementList", fresh);

    expect(getWidgetStateRegistry(instance)["refinementList-id-1"]).toBe(fresh);
  });

  it("notifies readers when a widget registers after they started to read", () => {
    const instance = {};
    const registry = getWidgetStateRegistry(instance);
    const state = computed(
      () => (registry["stats-late"]?.value as { value: string } | undefined)?.value,
    );

    expect(state.value).toBeUndefined();
    createWidgetIdScope("late").provideWidgetState("stats", renderStateFor(instance, "ready"));
    expect(state.value).toBe("ready");
  });

  it("ignores widgets without an id or without a render state", () => {
    const instance = {};

    createWidgetIdScope("").provideWidgetState("refinementList", renderStateFor(instance));
    expect(() =>
      createWidgetIdScope("orphan").provideWidgetState("stats", ref(null)),
    ).not.toThrow();

    expect(Object.keys(getWidgetStateRegistry(instance))).toHaveLength(0);
  });
});
