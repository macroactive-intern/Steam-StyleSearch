import { describe, expect, it } from "vitest";
import {
  applyGameFilterUpdates,
  clearGameFilterParams,
  EMPTY_GAME_FILTER_UPDATES,
  parseUrlGameFilters,
  removeGameFilterTag,
} from "./useGameFilters";

describe("useGameFilters URL helpers", () => {
  it("parses URL params into filter state", () => {
    const filters = parseUrlGameFilters(
      new URLSearchParams(
        "q=souls&platform=PC&genre=RPG&tag=rpg&tag=open-world&minRating=8&maxRating=10&yearFrom=2018&yearTo=2022&featured=true&sort=rating_desc",
      ),
    );

    expect(filters).toEqual({
      q: "souls",
      platform: "PC",
      genre: "RPG",
      tag: ["rpg", "open-world"],
      minRating: 8,
      maxRating: 10,
      yearFrom: 2018,
      yearTo: 2022,
      featured: true,
      sort: "rating_desc",
    });
  });

  it("drops invalid sort params", () => {
    const filters = parseUrlGameFilters(
      new URLSearchParams("sort=random_order"),
    );

    expect(filters.sort).toBeUndefined();
  });

  it("preserves reversed rating and year ranges from URL params", () => {
    const filters = parseUrlGameFilters(
      new URLSearchParams(
        "minRating=9&maxRating=5&yearFrom=2023&yearTo=2019",
      ),
    );

    expect(filters.minRating).toBe(9);
    expect(filters.maxRating).toBe(5);
    expect(filters.yearFrom).toBe(2023);
    expect(filters.yearTo).toBe(2019);
  });

  it("applies updates while preserving unrelated params and resetting pagination", () => {
    const query = applyGameFilterUpdates("utm=campaign&tag=rpg&page=2", {
      platform: "Nintendo Switch",
      tag: ["cozy", "farming"],
      minRating: 8,
    });

    expect(new URLSearchParams(query).get("utm")).toBe("campaign");
    expect(new URLSearchParams(query).get("page")).toBeNull();
    expect(new URLSearchParams(query).get("platform")).toBe("Nintendo Switch");
    expect(new URLSearchParams(query).get("minRating")).toBe("8");
    expect(new URLSearchParams(query).getAll("tag")).toEqual([
      "cozy",
      "farming",
    ]);
  });

  it("does not silently reorder rating and year ranges when applying URL updates", () => {
    const query = applyGameFilterUpdates(
      "minRating=9&maxRating=5&yearFrom=2023&yearTo=2019",
      { q: "souls" },
    );
    const params = new URLSearchParams(query);

    expect(params.get("minRating")).toBe("9");
    expect(params.get("maxRating")).toBe("5");
    expect(params.get("yearFrom")).toBe("2023");
    expect(params.get("yearTo")).toBe("2019");
  });

  it("clears filters and pagination while preserving unrelated params", () => {
    const query = clearGameFilterParams(
      "utm=campaign&q=souls&tag=rpg&platform=PC&page=3",
    );

    expect(query).toBe("utm=campaign");
  });

  it("removes tags from the latest URL state so rapid removals compose", () => {
    const afterFirstRemoval = removeGameFilterTag(
      "utm=campaign&tag=rpg&tag=open-world&tag=co-op&page=2",
      "rpg",
    );
    const afterSecondRemoval = removeGameFilterTag(
      afterFirstRemoval,
      "open-world",
    );

    expect(new URLSearchParams(afterSecondRemoval).get("utm")).toBe("campaign");
    expect(new URLSearchParams(afterSecondRemoval).get("page")).toBeNull();
    expect(new URLSearchParams(afterSecondRemoval).getAll("tag")).toEqual([
      "co-op",
    ]);
  });

  it("empty filter updates clear every filter represented by SearchInput", () => {
    const query = applyGameFilterUpdates(
      "utm=campaign&q=souls&platform=PC&genre=RPG&tag=rpg&minRating=8&maxRating=10&yearFrom=2018&yearTo=2022&sort=rating_desc&featured=true",
      EMPTY_GAME_FILTER_UPDATES,
    );

    expect(query).toBe("utm=campaign");
  });
});
