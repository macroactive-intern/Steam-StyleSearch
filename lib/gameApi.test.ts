import { describe, expect, it } from "vitest";
import { sanitizeGamesResponse } from "./gameApi";
import type { Game } from "@/types/game";

const validGame: Game = {
  id: "game-1",
  title: "Shadow Circuit",
  description: "A fast tactical action game.",
  platform: "PC",
  genre: "Action",
  tags: ["Action", "Tactical"],
  rating: 8.7,
  releaseYear: 2024,
  featured: true,
  coverImage: "/covers/shadow-circuit.svg",
};

describe("game API payload sanitization", () => {
  it("keeps valid games and copies tag arrays", () => {
    const result = sanitizeGamesResponse({ games: [validGame] });

    expect(result.games).toEqual([validGame]);
    expect(result.games[0]?.tags).not.toBe(validGame.tags);
  });

  it("drops malformed game objects before they reach rendering", () => {
    const result = sanitizeGamesResponse({
      games: [
        validGame,
        { ...validGame, id: 1 },
        { ...validGame, rating: "high" },
        { ...validGame, featured: "true" },
      ],
    });

    expect(result.games).toEqual([validGame]);
  });

  it("keeps games with malformed tag entries and drops only the bad tags", () => {
    const result = sanitizeGamesResponse({
      games: [
        {
          ...validGame,
          tags: [" Action ", 42, null, "", "Tactical"],
        },
      ],
    });

    expect(result.games).toEqual([
      {
        ...validGame,
        tags: ["Action", "Tactical"],
      },
    ]);
  });

  it("returns an empty list for non-array responses", () => {
    expect(sanitizeGamesResponse({ games: null })).toEqual({ games: [] });
    expect(sanitizeGamesResponse({})).toEqual({ games: [] });
  });
});
