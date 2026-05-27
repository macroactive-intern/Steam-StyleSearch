// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UrlGameFilters } from "@/hooks/useGameFilters";

const gameFiltersMock = vi.hoisted(() => ({
  filters: { tag: [] as string[] },
  setters: {
    setFilters: vi.fn(),
  },
}));

vi.mock("@/hooks/useGameFilters", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/hooks/useGameFilters")>();

  return {
    ...actual,
    useGameFilters: () => ({
      filters: gameFiltersMock.filters,
      setters: gameFiltersMock.setters,
      clearFilter: vi.fn(),
      clearAll: vi.fn(),
    }),
  };
});

import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    gameFiltersMock.filters = { tag: [] } as UrlGameFilters;
    gameFiltersMock.setters.setFilters.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("debounces advanced query parsing before writing URL filters", () => {
    render(<SearchInput delay={300} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search games" }), {
      target: { value: 'platform:PC rating:>8 tag:rpg "dark souls"' },
    });

    act(() => vi.advanceTimersByTime(299));
    expect(gameFiltersMock.setters.setFilters).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(gameFiltersMock.setters.setFilters).toHaveBeenCalledTimes(1);
    expect(gameFiltersMock.setters.setFilters).toHaveBeenCalledWith({
      q: "dark souls",
      platform: "PC",
      genre: undefined,
      tag: ["rpg"],
      minRating: 8,
      maxRating: undefined,
      yearFrom: undefined,
      yearTo: undefined,
    });
  });
});
