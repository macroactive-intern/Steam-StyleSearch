import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("game browser layout constraints", () => {
  it("keeps the sticky filter sidebar outside the results scroll container", async () => {
    const gameBrowser = await readFile("components/GameBrowser.tsx", "utf8");
    const virtualGameList = await readFile("components/VirtualGameList.tsx", "utf8");

    expect(gameBrowser).toContain("data-sticky-filter-sidebar");
    expect(gameBrowser).toContain("lg:sticky lg:top-6");
    expect(gameBrowser).not.toMatch(/\boverflow-(auto|hidden|scroll)\b/);
    expect(virtualGameList).toContain("data-game-results-scroll");
    expect(virtualGameList).toContain("overflow-auto");
  });
});
