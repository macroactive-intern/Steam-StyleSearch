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

  it("discards a partial draft and resets to the URL value on blur", () => {
    render(<SearchInput delay={300} />);
    const input = screen.getByRole("searchbox", { name: "Search games" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "dark sol" } });

    // Blur before the debounce fires — draft should be discarded
    act(() => vi.advanceTimersByTime(100));
    fireEvent.blur(input);

    expect(input).toHaveProperty("value", "");
    expect(gameFiltersMock.setters.setFilters).not.toHaveBeenCalled();
  });

  it("resets to the URL value again on refocus after a discarded draft", () => {
    render(<SearchInput delay={300} />);
    const input = screen.getByRole("searchbox", { name: "Search games" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "dark sol" } });
    fireEvent.blur(input);
    fireEvent.focus(input);

    expect(input).toHaveProperty("value", "");
  });

  it("cancels a pending debounce when URL filters change externally", () => {
    const { rerender } = render(<SearchInput delay={300} />);
    const input = screen.getByRole("searchbox", { name: "Search games" });

    fireEvent.focus(input);
    fireEvent.change(input, {
      target: { value: "dark sol" },
    });

    gameFiltersMock.filters = { tag: ["RPG"] } as UrlGameFilters;
    rerender(<SearchInput delay={300} />);

    expect(input).toHaveProperty("value", "dark sol");

    act(() => vi.advanceTimersByTime(300));
    expect(gameFiltersMock.setters.setFilters).not.toHaveBeenCalled();
  });
});
