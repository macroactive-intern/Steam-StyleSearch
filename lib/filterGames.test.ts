import { describe, expect, it } from "vitest";
import { filterGames } from "./filterGames";
import type { Game } from "@/types/game";

const games: Game[] = [
  {
    id: "ember-quest",
    title: "Ember Quest",
    description: "Explore a burning kingdom with tactical party combat.",
    platform: "PC",
    genre: "RPG",
    tags: ["rpg", "open-world", "fantasy"],
    rating: 9.2,
    releaseYear: 2020,
    featured: true,
    coverImage: "/covers/ember-quest.jpg",
  },
  {
    id: "neon-racers",
    title: "Neon Racers",
    description: "Arcade racing through rain-soaked city streets.",
    platform: "PlayStation 5",
    genre: "Racing",
    tags: ["racing", "arcade", "multiplayer"],
    rating: 7.4,
    releaseYear: 2023,
    featured: false,
    coverImage: "/covers/neon-racers.jpg",
  },
  {
    id: "quiet-farm",
    title: "Quiet Farm",
    description: "A cozy farming sim about rebuilding a mountain village.",
    platform: "Nintendo Switch",
    genre: "Simulation",
    tags: ["cozy", "farming", "singleplayer"],
    rating: 8.1,
    releaseYear: 2019,
    featured: true,
    coverImage: "/covers/quiet-farm.jpg",
  },
  {
    id: "shadow-dungeon",
    title: "Shadow Dungeon",
    description: "Dark dungeon crawling with online co-op raids.",
    platform: "PC",
    genre: "RPG",
    tags: ["rpg", "co-op", "difficult"],
    rating: 6.5,
    releaseYear: 2016,
    featured: false,
    coverImage: "/covers/shadow-dungeon.jpg",
  },
  {
    id: "alpha-line",
    title: "Alpha Line",
    description: "Minimalist puzzle routes for fast daily sessions.",
    platform: "PC",
    genre: "Puzzle",
    tags: ["puzzle", "singleplayer"],
    rating: 9.2,
    releaseYear: 2021,
    featured: false,
    coverImage: "/covers/alpha-line.jpg",
  },
];

function ids(filteredGames: Game[]) {
  return filteredGames.map((game) => game.id);
}

function expectOriginalArrayNotMutated(runFilter: () => Game[]) {
  const originalOrder = ids(games);
  const result = runFilter();

  expect(ids(games)).toEqual(originalOrder);
  expect(result).not.toBe(games);
}

describe("filterGames", () => {
  it("filters by text search across title and description", () => {
    const result = filterGames(games, { q: "dungeon" });

    expect(ids(result)).toEqual(["shadow-dungeon"]);
  });

  it("treats an empty text search like no text search", () => {
    const emptyQueryResult = filterGames(games, { q: "" });
    const undefinedQueryResult = filterGames(games, { q: undefined });

    expect(ids(emptyQueryResult)).toEqual(ids(undefinedQueryResult));
    expect(ids(emptyQueryResult)).toEqual(ids(games));
  });

  it("filters by platform", () => {
    const result = filterGames(games, { platform: "pc" });

    expect(ids(result)).toEqual(["ember-quest", "shadow-dungeon", "alpha-line"]);
  });

  it("filters by genre", () => {
    const result = filterGames(games, { genre: "rpg" });

    expect(ids(result)).toEqual(["ember-quest", "shadow-dungeon"]);
  });

  it("requires all tag filters to match", () => {
    const result = filterGames(games, { tag: ["rpg", "open-world"] });

    expect(ids(result)).toEqual(["ember-quest"]);
  });

  it("matches tag filters case-insensitively", () => {
    const result = filterGames(games, { tag: ["RPG", "OPEN-WORLD"] });

    expect(ids(result)).toEqual(["ember-quest"]);
  });

  it("filters by rating minimum and maximum", () => {
    const result = filterGames(games, { minRating: 7, maxRating: 8.5 });

    expect(ids(result)).toEqual(["neon-racers", "quiet-farm"]);
  });

  it("normalizes reversed rating ranges", () => {
    const result = filterGames(games, { minRating: 8.5, maxRating: 7 });

    expect(ids(result)).toEqual(["neon-racers", "quiet-farm"]);
  });

  it("includes games exactly on the maximum rating boundary", () => {
    const result = filterGames(games, { maxRating: 7.4 });

    expect(ids(result)).toEqual(["neon-racers", "shadow-dungeon"]);
  });

  it("filters by release year range", () => {
    const result = filterGames(games, { yearFrom: 2019, yearTo: 2021 });

    expect(ids(result)).toEqual(["ember-quest", "quiet-farm", "alpha-line"]);
  });

  it("normalizes reversed release year ranges", () => {
    const result = filterGames(games, { yearFrom: 2021, yearTo: 2019 });

    expect(ids(result)).toEqual(["ember-quest", "quiet-farm", "alpha-line"]);
  });

  it("filters to featured games only", () => {
    const result = filterGames(games, { featured: true });

    expect(ids(result)).toEqual(["ember-quest", "quiet-farm"]);
  });

  it("filters to non-featured games only", () => {
    const result = filterGames(games, { featured: false });

    expect(ids(result)).toEqual(["neon-racers", "shadow-dungeon", "alpha-line"]);
  });

  it("sorts by rating descending with title tie-breaks", () => {
    const result = filterGames(games, { sort: "rating_desc" });

    expect(ids(result)).toEqual([
      "alpha-line",
      "ember-quest",
      "quiet-farm",
      "neon-racers",
      "shadow-dungeon",
    ]);
  });

  it("sorts by rating ascending with title tie-breaks", () => {
    const result = filterGames(games, { sort: "rating_asc" });

    expect(ids(result)).toEqual([
      "shadow-dungeon",
      "neon-racers",
      "quiet-farm",
      "alpha-line",
      "ember-quest",
    ]);
  });

  it("sorts by title ascending", () => {
    const result = filterGames(games, { sort: "title_asc" });

    expect(ids(result)).toEqual([
      "alpha-line",
      "ember-quest",
      "neon-racers",
      "quiet-farm",
      "shadow-dungeon",
    ]);
  });

  it("sorts by year descending with title tie-breaks", () => {
    const result = filterGames(games, { sort: "year_desc" });

    expect(ids(result)).toEqual([
      "neon-racers",
      "alpha-line",
      "ember-quest",
      "quiet-farm",
      "shadow-dungeon",
    ]);
  });

  it("combines filters before sorting", () => {
    const result = filterGames(games, {
      q: "combat",
      platform: "pc",
      genre: "rpg",
      tag: ["fantasy"],
      minRating: 9,
      maxRating: 10,
      yearFrom: 2020,
      yearTo: 2020,
      featured: true,
      sort: "title_asc",
    });

    expect(ids(result)).toEqual(["ember-quest"]);
  });

  it("does not mutate the original array when filtering only", () => {
    expectOriginalArrayNotMutated(() => filterGames(games, { platform: "pc" }));
  });

  it("does not mutate the original array when filtering and sorting", () => {
    expectOriginalArrayNotMutated(() =>
      filterGames(games, { platform: "pc", sort: "title_asc" }),
    );
  });

  it("does not mutate the original array when sorting only", () => {
    expectOriginalArrayNotMutated(() =>
      filterGames(games, { sort: "rating_desc" }),
    );
  });
});
