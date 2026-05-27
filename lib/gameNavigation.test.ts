import { describe, expect, it } from "vitest";
import { buildGameHref, buildPathWithSearch, getBackHref } from "./gameNavigation";

describe("game navigation helpers", () => {
  it("builds detail links that preserve the current games URL", () => {
    expect(
      buildGameHref(
        "ember-quest",
        buildPathWithSearch("/", {
          genre: "RPG",
          minRating: "8",
          sort: "rating_desc",
        }),
      ),
    ).toBe(
      "/games/ember-quest?returnTo=%2F%3Fgenre%3DRPG%26minRating%3D8%26sort%3Drating_desc",
    );
  });

  it("supports repeated search params in return URLs", () => {
    expect(
      buildPathWithSearch("/", {
        tag: ["rpg", "open-world"],
      }),
    ).toBe("/?tag=rpg&tag=open-world");
  });

  it("rejects unsafe return URLs", () => {
    expect(getBackHref("javascript:alert(1)")).toBe("/");
    expect(getBackHref("//example.com")).toBe("/");
    expect(buildGameHref("ember-quest", "https://example.com")).toBe(
      "/games/ember-quest",
    );
  });
});
