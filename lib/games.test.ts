import { describe, expect, it } from "vitest";
import { getGames } from "./games";

describe("getGames", () => {
  it("uses case-insensitive platform matching", () => {
    const lowercaseResults = getGames({ platform: "pc" });
    const canonicalResults = getGames({ platform: "PC" });

    expect(lowercaseResults.length).toBeGreaterThan(0);
    expect(lowercaseResults.map((game) => game.id)).toEqual(
      canonicalResults.map((game) => game.id),
    );
    expect(lowercaseResults.every((game) => game.platform === "PC")).toBe(true);
  });

  it("uses case-insensitive tag matching", () => {
    const lowercaseResults = getGames({ tag: ["rpg"] });
    const uppercaseResults = getGames({ tag: ["RPG"] });

    expect(lowercaseResults.length).toBeGreaterThan(0);
    expect(uppercaseResults.map((game) => game.id)).toEqual(
      lowercaseResults.map((game) => game.id),
    );
  });

  it("supports rating and year ranges", () => {
    const results = getGames({
      minRating: 8,
      maxRating: 9,
      yearFrom: 2018,
      yearTo: 2022,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (game) =>
          game.rating >= 8 &&
          game.rating <= 9 &&
          game.releaseYear >= 2018 &&
          game.releaseYear <= 2022,
      ),
    ).toBe(true);
  });
});
