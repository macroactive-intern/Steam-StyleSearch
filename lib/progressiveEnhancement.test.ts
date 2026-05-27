import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  JS_ENABLED_CLASS,
  JS_ENHANCEMENT_SCRIPT,
} from "./progressiveEnhancement";

describe("progressive enhancement toggle", () => {
  it("adds the JS-enabled marker to the document element", () => {
    const addedClasses: string[] = [];

    runInNewContext(JS_ENHANCEMENT_SCRIPT, {
      document: {
        documentElement: {
          classList: {
            add: (className: string) => addedClasses.push(className),
          },
        },
      },
    });

    expect(addedClasses).toEqual([JS_ENABLED_CLASS]);
  });
});
