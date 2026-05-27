import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UrlGameFilters } from "@/hooks/useGameFilters";

let filters: UrlGameFilters = {
  tag: ["RPG"],
  featured: true,
};

const setters = {
  setPlatform: vi.fn(),
  setGenre: vi.fn(),
  setSort: vi.fn(),
  setFeatured: vi.fn(),
  setMinRating: vi.fn(),
  setMaxRating: vi.fn(),
  setYearFrom: vi.fn(),
  setYearTo: vi.fn(),
  setTag: vi.fn(),
};

vi.mock("@/hooks/useGameFilters", () => ({
  useGameFilters: () => ({
    filters,
    setters,
    clearAll: vi.fn(),
  }),
}));

import { FilterPanel } from "@/components/FilterPanel";

function renderFilterPanel() {
  return renderToStaticMarkup(
    <FilterPanel
      platforms={["PC"]}
      genres={["RPG"]}
      tags={["RPG", "Open World"]}
      releaseYearRange={{ min: 1995, max: 2026 }}
    />,
  );
}

function expectLabelFor(html: string, id: string) {
  expect(html).toContain(`id="${id}"`);
  expect(html).toMatch(new RegExp(`<label[^>]+for="${id}"`));
}

describe("filter panel accessibility", () => {
  beforeEach(() => {
    filters = {
      tag: ["RPG"],
      featured: true,
    };
  });

  it("renders explicit label associations for checkbox buttons", () => {
    const html = renderFilterPanel();

    expectLabelFor(html, "filter-featured");
    expectLabelFor(html, "filter-tag-0");
    expectLabelFor(html, "filter-tag-1");
  });

  it("renders the scrollable tag picker as a named keyboard-focusable group", () => {
    const html = renderFilterPanel();

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Tags, scroll to see more"');
    expect(html).toContain('tabindex="0"');
  });

  it("announces invalid range relationships without changing entered values", () => {
    filters = {
      ...filters,
      minRating: 9,
      maxRating: 5,
      yearFrom: 2023,
      yearTo: 2019,
    };

    const html = renderFilterPanel();

    expect(html).toContain('value="9"');
    expect(html).toContain('value="5"');
    expect(html).toContain('value="2023"');
    expect(html).toContain('value="2019"');
    expect(html).toContain("Min rating must be less than or equal to max rating.");
    expect(html).toContain("From year must be less than or equal to end year.");
    expect(html).toContain('aria-describedby="filter-rating-range-error"');
    expect(html).toContain('aria-describedby="filter-year-range-error"');
  });
});
