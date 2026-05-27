// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@/types/game";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams("genre=RPG"),
}));

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getTotalSize: () => count * 200,
    getVirtualItems: () =>
      Array.from({ length: Math.min(count, 2) }, (_, index) => ({
        index,
        start: index * 200,
      })),
    measureElement: vi.fn(),
  }),
}));

import { VirtualGameList } from "./VirtualGameList";

function createGame(overrides: Partial<Game>): Game {
  return {
    id: "game-1",
    title: "Dark Orchard",
    description: "A moody action RPG.",
    platform: "PC",
    genre: "RPG",
    tags: ["RPG", "Open World"],
    rating: 9.1,
    releaseYear: 2024,
    featured: true,
    coverImage: "/covers/dark-orchard.jpg",
    ...overrides,
  };
}

function deepFreezeGame(game: Game): Game {
  Object.freeze(game.tags);
  return Object.freeze(game) as Game;
}

describe("VirtualGameList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without mutating the supplied games array or game records", () => {
    const games = Object.freeze([
      deepFreezeGame(createGame({ id: "game-1", title: "Dark Orchard" })),
      deepFreezeGame(createGame({ id: "game-2", title: "Neon Rally" })),
      deepFreezeGame(createGame({ id: "game-3", title: "Sky Colony" })),
    ]);
    const beforeRender = JSON.stringify(games);

    render(<VirtualGameList games={games} />);

    expect(screen.getByText("3 games found")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Dark Orchard/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Neon Rally/i })).toBeTruthy();
    expect(JSON.stringify(games)).toBe(beforeRender);
  });
});
