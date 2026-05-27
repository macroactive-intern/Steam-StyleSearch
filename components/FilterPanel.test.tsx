// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UrlGameFilters } from "@/hooks/useGameFilters";

const gameFiltersMock = vi.hoisted(() => ({
  filters: { tag: [] as string[] },
  setters: {
    setPlatform: vi.fn(),
    setGenre: vi.fn(),
    setSort: vi.fn(),
    setFeatured: vi.fn(),
    setMinRating: vi.fn(),
    setMaxRating: vi.fn(),
    setYearFrom: vi.fn(),
    setYearTo: vi.fn(),
    setTag: vi.fn(),
  },
  clearAll: vi.fn(),
}));

vi.mock("@/hooks/useGameFilters", () => ({
  useGameFilters: () => ({
    filters: gameFiltersMock.filters,
    setters: gameFiltersMock.setters,
    clearAll: gameFiltersMock.clearAll,
  }),
}));

import { FilterPanel } from "./FilterPanel";

function renderFilterPanel() {
  return render(
    <FilterPanel
      platforms={["PC"]}
      genres={["RPG"]}
      tags={["RPG", "Open World"]}
      releaseYearRange={{ min: 1995, max: 2026 }}
    />,
  );
}

describe("FilterPanel", () => {
  beforeEach(() => {
    gameFiltersMock.filters = {
      tag: ["RPG"],
      minRating: 9,
      maxRating: 5,
      yearFrom: 2023,
      yearTo: 2019,
    } as UrlGameFilters;
    Object.values(gameFiltersMock.setters).forEach((setter) =>
      setter.mockClear(),
    );
    gameFiltersMock.clearAll.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows validation state for inverted rating and year ranges", () => {
    renderFilterPanel();

    expect(
      screen.getByText("Min rating must be less than or equal to max rating."),
    ).toBeTruthy();
    expect(
      screen.getByText("From year must be less than or equal to end year."),
    ).toBeTruthy();
    const minRating = screen.getByLabelText("Min") as HTMLInputElement;
    const maxRating = screen.getByLabelText("Max") as HTMLInputElement;
    const yearFrom = screen.getByLabelText("From") as HTMLInputElement;
    const yearTo = screen.getByLabelText("To") as HTMLInputElement;

    expect(minRating.getAttribute("aria-invalid")).toBe("true");
    expect(maxRating.getAttribute("aria-invalid")).toBe("true");
    expect(yearFrom.getAttribute("aria-invalid")).toBe("true");
    expect(yearTo.getAttribute("aria-invalid")).toBe("true");
    expect(minRating.value).toBe("9");
    expect(maxRating.value).toBe("5");
    expect(yearFrom.value).toBe("2023");
    expect(yearTo.value).toBe("2019");
  });
});
