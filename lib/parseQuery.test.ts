import { describe, expect, it } from "vitest";
import { parseQuery } from "./parseQuery";

describe("parseQuery", () => {
  it("parses platform filters and plain search terms", () => {
    const result = parseQuery("platform:PC dark souls");

    expect(result.filters).toEqual({
      tags: [],
      platform: "PC",
    });
    expect(result.terms).toEqual(["dark", "souls"]);
  });

  it("parses minimum rating filters", () => {
    const result = parseQuery("rating:>8");

    expect(result.filters).toEqual({
      tags: [],
      minRating: 8,
    });
  });

  it("parses maximum rating filters", () => {
    const result = parseQuery("rating:<6");

    expect(result.filters).toEqual({
      tags: [],
      maxRating: 6,
    });
  });

  it("parses multiple tag filters", () => {
    const result = parseQuery("tag:rpg tag:open-world");

    expect(result.filters).toEqual({
      tags: ["rpg", "open-world"],
    });
  });

  it("parses genre filters", () => {
    const result = parseQuery("genre:rpg");

    expect(result.filters).toEqual({
      tags: [],
      genre: "rpg",
    });
  });

  it("parses exact year filters", () => {
    const result = parseQuery("year:2020");

    expect(result.filters).toEqual({
      tags: [],
      yearFrom: 2020,
      yearTo: 2020,
    });
  });

  it("keeps quoted phrases intact as search terms", () => {
    const result = parseQuery('"dark souls"');

    expect(result.filters).toEqual({
      tags: [],
    });
    expect(result.terms).toEqual(["dark souls"]);
  });

  it("keeps invalid field tokens as search terms while parsing valid filters", () => {
    const result = parseQuery(
      'platform:PC genre:rpg rating:>8 rating:=7 tag:rpg mood:grim year:2020 "dark souls"',
    );

    expect(result.filters).toEqual({
      tags: ["rpg"],
      platform: "PC",
      genre: "rpg",
      minRating: 8,
      yearFrom: 2020,
      yearTo: 2020,
    });
    expect(result.terms).toEqual(["rating:=7", "mood:grim", "dark souls"]);
  });
});
