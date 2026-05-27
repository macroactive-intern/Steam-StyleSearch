import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  JS_ENABLED_CLASS,
  JS_ENHANCEMENT_SCRIPT,
} from "./progressiveEnhancement";

describe("progressive enhancement toggle", () => {
  it("adds the JS-enabled marker used by the CSS switch", () => {
    expect(JS_ENHANCEMENT_SCRIPT).toBe(
      "document.documentElement.classList.add('js-enabled');",
    );
    expect(JS_ENHANCEMENT_SCRIPT).toContain(JS_ENABLED_CLASS);
  });

  it("keeps fallback visible by default and hides it only after JS is enabled", async () => {
    const css = await readFile("app/globals.css", "utf8");

    expect(css).toContain(`.${JS_ENABLED_CLASS} [data-js-enhanced]`);
    expect(css).toContain(`.${JS_ENABLED_CLASS} [data-no-js-fallback]`);
    expect(css).toContain("display: flex;");
    expect(css).toContain("display: none;");
  });

  it("uses a visible JS-enhanced Suspense fallback instead of null", async () => {
    const page = await readFile("app/page.tsx", "utf8");

    expect(page).toContain("fallback={<GameBrowserSuspenseFallback />}");
    expect(page).toContain("data-js-enhanced");
    expect(page).not.toContain("fallback={null}");
  });
});
