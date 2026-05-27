import { describe, expect, it } from "vitest";
import { parseQuery } from "./parseQuery";
import { filtersToSearchValue } from "./searchValue";
import type { UrlGameFilters } from "@/hooks/useGameFilters";

describe("filtersToSearchValue", () => {
  it("round-trips external filter state with quoted field values", () => {
    const filters: UrlGameFilters = {
      q: "dark souls",
      platform: "PlayStation 5",
      genre: "Action RPG",
      tag: ["open world", "co-op"],
      minRating: 8,
      maxRating: 10,
      yearFrom: 2018,
      yearTo: 2022,
    };

    const parsed = parseQuery(filtersToSearchValue(filters));

    expect(parsed.filters).toEqual({
      tags: ["open world", "co-op"],
      platform: "PlayStation 5",
      genre: "Action RPG",
      minRating: 8,
      maxRating: 10,
      yearFrom: 2018,
      yearTo: 2022,
    });
    expect(parsed.terms).toEqual(["dark souls"]);
  });
});
