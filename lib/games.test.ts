import { describe, expect, it } from "vitest";
import { GENRES, getGames, PLATFORMS, RELEASE_YEAR_RANGE, TAGS } from "./games";

describe("getGames", () => {
  it("uses the same title and description text search scope as the JS path", () => {
    const results = getGames({ q: "racing" });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((game) => {
        const query = "racing";

        return (
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query)
        );
      }),
    ).toBe(true);
  });

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

describe("game filter option constants", () => {
  it("exports precomputed platform, genre, tag, and release year options", () => {
    expect(PLATFORMS.length).toBeGreaterThan(0);
    expect(GENRES.length).toBeGreaterThan(0);
    expect(TAGS.length).toBeGreaterThan(0);
    expect(RELEASE_YEAR_RANGE).toEqual({ min: 1995, max: 2026 });
  });
});
