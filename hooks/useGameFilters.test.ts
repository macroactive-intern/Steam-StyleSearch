import { describe, expect, it } from "vitest";
import {
  applyGameFilterUpdates,
  clearGameFilterParams,
  EMPTY_GAME_FILTER_UPDATES,
  parseUrlGameFilters,
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

  it("applies updates while preserving unrelated params", () => {
    const query = applyGameFilterUpdates("utm=campaign&tag=rpg&page=2", {
      platform: "Nintendo Switch",
      tag: ["cozy", "farming"],
      minRating: 8,
    });

    expect(new URLSearchParams(query).get("utm")).toBe("campaign");
    expect(new URLSearchParams(query).get("page")).toBe("2");
    expect(new URLSearchParams(query).get("platform")).toBe("Nintendo Switch");
    expect(new URLSearchParams(query).get("minRating")).toBe("8");
    expect(new URLSearchParams(query).getAll("tag")).toEqual([
      "cozy",
      "farming",
    ]);
  });

  it("clears only known filter params", () => {
    const query = clearGameFilterParams(
      "utm=campaign&q=souls&tag=rpg&platform=PC&page=3",
    );

    expect(query).toBe("utm=campaign&page=3");
  });

  it("empty filter updates clear every filter represented by SearchInput", () => {
    const query = applyGameFilterUpdates(
      "utm=campaign&q=souls&platform=PC&genre=RPG&tag=rpg&minRating=8&maxRating=10&yearFrom=2018&yearTo=2022&sort=rating_desc&featured=true",
      EMPTY_GAME_FILTER_UPDATES,
    );

    expect(query).toBe("utm=campaign");
  });
});
