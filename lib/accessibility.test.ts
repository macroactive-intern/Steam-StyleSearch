import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("filter panel accessibility", () => {
  it("labels Radix checkbox buttons with explicit id and htmlFor pairs", async () => {
    const filterPanel = await readFile("components/FilterPanel.tsx", "utf8");

    expect(filterPanel).toContain('id="filter-featured"');
    expect(filterPanel).toContain('htmlFor="filter-featured"');
    expect(filterPanel).toContain("id={`filter-tag-${index}`}");
    expect(filterPanel).toContain("htmlFor={`filter-tag-${index}`}");
    expect(filterPanel).not.toMatch(/<Label[^>]*>\s*<Checkbox/);
  });

  it("identifies the scrollable tag region to keyboard and screen reader users", async () => {
    const filterPanel = await readFile("components/FilterPanel.tsx", "utf8");

    expect(filterPanel).toContain('role="group"');
    expect(filterPanel).toContain('aria-label="Tags, scroll to see more"');
    expect(filterPanel).toContain("tabIndex={0}");
    expect(filterPanel).toContain("overflow-auto");
    expect(filterPanel).toContain("focus-visible:ring-3");
  });
});
