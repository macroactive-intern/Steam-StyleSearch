import { describe, expect, it } from "vitest";
import {
  cloneFilters,
  hasPresetName,
  parseStoredPresets,
  sanitizePresets,
  serializePresets,
  type FilterPreset,
} from "./filterPresets";

const preset: FilterPreset = {
  id: "preset-1",
  name: "RPG preset",
  createdAt: "2026-05-27T00:00:00.000Z",
  filters: {
    q: "souls",
    platform: "PC",
    genre: "RPG",
    tag: ["rpg", "open-world"],
    minRating: 8,
    maxRating: 10,
    yearFrom: 2018,
    yearTo: 2022,
    sort: "rating_desc",
    featured: true,
  },
};

describe("filter preset storage helpers", () => {
  it("serializes and parses saved presets", () => {
    expect(parseStoredPresets(serializePresets([preset]))).toEqual([preset]);
  });

  it("drops malformed presets and sanitizes invalid filter fields", () => {
    const stored = JSON.stringify([
      {
        id: "bad-tags",
        name: "Bad tags",
        createdAt: "2026-05-27T00:00:00.000Z",
        filters: {
          tag: "rpg",
          sort: "unknown",
          featured: "true",
        },
      },
      {
        id: "missing-filters",
        name: "Missing filters",
        createdAt: "2026-05-27T00:00:00.000Z",
      },
    ]);

    expect(parseStoredPresets(stored)).toEqual([
      {
        id: "bad-tags",
        name: "Bad tags",
        createdAt: "2026-05-27T00:00:00.000Z",
        filters: {
          tag: [],
        },
      },
    ]);
  });

  it("caps stored presets", () => {
    const presets = Array.from({ length: 25 }, (_, index) => ({
      ...preset,
      id: `preset-${index}`,
    }));

    expect(sanitizePresets(presets)).toHaveLength(20);
  });

  it("clones filters before applying or saving", () => {
    const cloned = cloneFilters(preset.filters);

    expect(cloned).toEqual(preset.filters);
    expect(cloned.tag).not.toBe(preset.filters.tag);
  });

  it("matches duplicate preset names case-insensitively", () => {
    expect(hasPresetName([preset], " rpg PRESET ")).toBe(true);
    expect(hasPresetName([preset], "Strategy preset")).toBe(false);
    expect(hasPresetName([preset], "   ")).toBe(false);
  });
});
