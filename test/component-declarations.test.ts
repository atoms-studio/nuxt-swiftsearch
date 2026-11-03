import { describe, expect, it } from "vitest";
import { applyTypedComponentDeclarations } from "../src/componentDeclarations";

const componentsDir = "/pkg/dist/runtime/components";

describe("applyTypedComponentDeclarations", () => {
  it("points module components at their .vue.d.ts declarations", () => {
    const components = [{ filePath: `${componentsDir}/RangeInput.vue` }];

    applyTypedComponentDeclarations(components, componentsDir, () => true);

    expect(components[0]).toEqual({
      filePath: `${componentsDir}/RangeInput.vue`,
      declarationPath: `${componentsDir}/RangeInput.vue.d.ts`,
    });
  });

  it("keeps the declarationPath when no .vue.d.ts file exists (development)", () => {
    const components = [
      {
        filePath: "/pkg/src/runtime/components/RangeInput.vue",
        declarationPath: "/pkg/src/runtime/components/RangeInput.vue",
      },
    ];

    applyTypedComponentDeclarations(components, "/pkg/src/runtime/components", () => false);

    expect(components[0]!.declarationPath).toBe("/pkg/src/runtime/components/RangeInput.vue");
  });

  it("does not change components outside the module", () => {
    const components = [{ filePath: "/app/components/RangeInput.vue" }];

    applyTypedComponentDeclarations(components, componentsDir, () => true);

    expect(components[0]).not.toHaveProperty("declarationPath");
  });
});
