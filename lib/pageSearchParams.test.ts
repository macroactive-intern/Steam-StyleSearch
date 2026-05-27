import { describe, expect, it } from "vitest";
import { getGames } from "./games";
import { getFallbackFilters, getPageNumber } from "./pageSearchParams";

describe("page search param helpers", () => {
  it("parses no-JS fallback filters from URL params", () => {
    const filters = getFallbackFilters({
      genre: "RPG",
      minRating: "8",
      tag: ["RPG", "Fantasy"],
      sort: "rating_desc",
    });

    expect(filters).toEqual({
      genre: "RPG",
      minRating: 8,
      tag: ["RPG", "Fantasy"],
      sort: "rating_desc",
    });
  });

  it("feeds filtered games to the paginated no-JS fallback", () => {
    const allGames = getGames();
    const fallbackGames = getGames(
      getFallbackFilters({
        genre: "RPG",
        minRating: "8",
      }),
    );

    expect(fallbackGames.length).toBeGreaterThan(0);
    expect(fallbackGames.length).toBeLessThan(allGames.length);
    expect(
      fallbackGames.every(
        (game) => game.genre === "RPG" && game.rating >= 8,
      ),
    ).toBe(true);
  });

  it("parses valid positive page numbers", () => {
    expect(getPageNumber({ page: "3" })).toBe(3);
    expect(getPageNumber({ page: "-1" })).toBe(1);
    expect(getPageNumber({ page: "nope" })).toBe(1);
  });
});
