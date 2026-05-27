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

  it("round-trips multi-word tag filters without demoting them to search terms", () => {
    const filters: UrlGameFilters = {
      tag: ["dark souls"],
    };

    const parsed = parseQuery(filtersToSearchValue(filters));

    expect(filtersToSearchValue(filters)).toBe('tag:"dark souls"');
    expect(parsed.filters).toEqual({
      tags: ["dark souls"],
    });
    expect(parsed.terms).toEqual([]);
  });

  it("serializes exact, bounded, and one-sided year filters", () => {
    expect(
      filtersToSearchValue({
        tag: [],
        yearFrom: 2020,
        yearTo: 2020,
      }),
    ).toBe("year:2020");
    expect(
      filtersToSearchValue({
        tag: [],
        yearFrom: 2018,
        yearTo: 2022,
      }),
    ).toBe("year:2018-2022");
    expect(
      filtersToSearchValue({
        tag: [],
        yearFrom: 2018,
      }),
    ).toBe("year:>=2018");
    expect(
      filtersToSearchValue({
        tag: [],
        yearTo: 2022,
      }),
    ).toBe("year:<=2022");
  });

  it("round-trips year ranges through the advanced query parser", () => {
    const parsed = parseQuery(
      filtersToSearchValue({
        tag: [],
        yearFrom: 2018,
        yearTo: 2022,
      }),
    );

    expect(parsed.filters).toEqual({
      tags: [],
      yearFrom: 2018,
      yearTo: 2022,
    });
  });
});
