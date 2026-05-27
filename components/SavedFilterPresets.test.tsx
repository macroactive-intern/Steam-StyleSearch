// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UrlGameFilters } from "@/hooks/useGameFilters";
import { STORAGE_EVENT, STORAGE_KEY } from "@/lib/filterPresets";

const gameFiltersMock = vi.hoisted(() => ({
  filters: { tag: [] as string[] } as UrlGameFilters,
  setters: { setFilters: vi.fn() },
}));

vi.mock("@/hooks/useGameFilters", () => ({
  useGameFilters: () => ({
    filters: gameFiltersMock.filters,
    setters: gameFiltersMock.setters,
  }),
}));

import { SavedFilterPresets } from "./SavedFilterPresets";

const storedPreset = {
  id: "preset-1",
  name: "RPG Search",
  createdAt: "2026-05-28T00:00:00.000Z",
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

function seedStorage(presets = [storedPreset]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

describe("SavedFilterPresets", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-0000-0000-000000000001" as `${string}-${string}-${string}-${string}-${string}`,
    );
    gameFiltersMock.filters = { tag: [] } as UrlGameFilters;
    gameFiltersMock.setters.setFilters.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows empty state when no presets are saved", () => {
    render(<SavedFilterPresets />);
    expect(screen.getByText("No saved presets yet.")).toBeTruthy();
  });

  it("renders presets loaded from localStorage on mount", () => {
    seedStorage();
    render(<SavedFilterPresets />);
    expect(screen.getByRole("button", { name: "RPG Search" })).toBeTruthy();
  });

  it("saves a new preset with the current filters", () => {
    gameFiltersMock.filters = {
      tag: ["rpg"],
      q: "dark souls",
      platform: "PC",
    } as UrlGameFilters;

    render(<SavedFilterPresets />);

    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: "My RPG preset" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      id: "00000000-0000-0000-0000-000000000001",
      name: "My RPG preset",
      filters: { q: "dark souls", platform: "PC", tag: ["rpg"] },
    });
  });

  it("clears the name input after a successful save", () => {
    render(<SavedFilterPresets />);

    const input = screen.getByLabelText("Preset name");
    fireEvent.change(input, { target: { value: "Quick save" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(input).toHaveProperty("value", "");
  });

  it("trims the preset name before comparing for duplicates", () => {
    seedStorage();
    render(<SavedFilterPresets />);

    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: "  rpg search  " },
    });

    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(
      screen.getByText("A preset with this name already exists."),
    ).toBeTruthy();
  });

  it("disables Save when the name is blank or whitespace-only", () => {
    render(<SavedFilterPresets />);
    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty(
      "disabled",
      true,
    );

    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: "   " },
    });
    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("applies a preset's filters when its button is clicked", () => {
    seedStorage();
    render(<SavedFilterPresets />);

    fireEvent.click(screen.getByRole("button", { name: "RPG Search" }));

    expect(gameFiltersMock.setters.setFilters).toHaveBeenCalledTimes(1);
    const applied = gameFiltersMock.setters.setFilters.mock.calls[0][0];
    expect(applied.q).toBe("souls");
    expect(applied.tag).toEqual(["rpg", "open-world"]);
    // cloneFilters must return an independent copy
    expect(applied.tag).not.toBe(storedPreset.filters.tag);
  });

  it("deletes a preset when the delete button is clicked", () => {
    seedStorage([storedPreset, { ...storedPreset, id: "preset-2", name: "FPS Search" }]);
    render(<SavedFilterPresets />);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete RPG Search preset" }),
    );

    const remaining = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe("FPS Search");
  });

  it("shows a storage error and does not clear the input when saving fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    render(<SavedFilterPresets />);

    const input = screen.getByLabelText("Preset name");
    fireEvent.change(input, { target: { value: "My preset" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert").textContent).toBe(
      "Unable to save preset. Browser storage may be full.",
    );
    expect(input).toHaveProperty("value", "My preset");
  });

  it("shows a storage error when deleting fails", () => {
    seedStorage();

    render(<SavedFilterPresets />);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Delete RPG Search preset" }),
    );

    expect(screen.getByRole("alert").textContent).toBe(
      "Unable to delete preset. Browser storage may be full.",
    );
  });

  it("reflects preset changes dispatched from other tabs via the storage event", () => {
    render(<SavedFilterPresets />);
    expect(screen.getByText("No saved presets yet.")).toBeTruthy();

    act(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([storedPreset]));
      window.dispatchEvent(new Event("storage"));
    });

    expect(screen.getByRole("button", { name: "RPG Search" })).toBeTruthy();
  });
});
