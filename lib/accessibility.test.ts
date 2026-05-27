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
});
