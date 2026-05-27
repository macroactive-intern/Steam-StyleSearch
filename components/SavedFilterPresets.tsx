"use client";

import { FormEvent, useSyncExternalStore, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameFilters, type UrlGameFilters } from "@/hooks/useGameFilters";
import { cn } from "@/lib/utils";
import type { FilterSort } from "@/types/game";

const STORAGE_KEY = "steam-style-search:filter-presets";
const STORAGE_EVENT = "game-filter-presets-change";
const MAX_PRESET_NAME_LENGTH = 50;
const MAX_PRESET_COUNT = 20;
const MAX_FILTER_TEXT_LENGTH = 120;
const MAX_TAG_COUNT = 20;
const EMPTY_PRESETS: FilterPreset[] = [];
const SORT_VALUES = new Set<FilterSort>([
  "rating_desc",
  "rating_asc",
  "title_asc",
  "year_desc",
]);

export interface FilterPreset {
  id: string;
  name: string;
  filters: UrlGameFilters;
  createdAt: string;
}

export interface SavedFilterPresetsProps {
  className?: string;
}

function createPresetId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function cloneFilters(filters: UrlGameFilters): UrlGameFilters {
  return {
    q: filters.q,
    platform: filters.platform,
    genre: filters.genre,
    tag: [...filters.tag],
    minRating: filters.minRating,
    maxRating: filters.maxRating,
    yearFrom: filters.yearFrom,
    yearTo: filters.yearTo,
    sort: filters.sort,
    featured: filters.featured,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, maxLength = MAX_FILTER_TEXT_LENGTH) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength) || undefined
    : undefined;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function readTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((tag) => readString(tag))
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, MAX_TAG_COUNT);
}

function readSort(value: unknown) {
  const sort = readString(value);

  return sort && SORT_VALUES.has(sort as FilterSort)
    ? (sort as FilterSort)
    : undefined;
}

function sanitizeFilters(value: unknown): UrlGameFilters | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    q: readString(value.q),
    platform: readString(value.platform),
    genre: readString(value.genre),
    tag: readTags(value.tag),
    minRating: readNumber(value.minRating),
    maxRating: readNumber(value.maxRating),
    yearFrom: readNumber(value.yearFrom),
    yearTo: readNumber(value.yearTo),
    sort: readSort(value.sort),
    featured: readBoolean(value.featured),
  };
}

function sanitizePreset(value: unknown): FilterPreset | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = readString(value.id, 100);
  const name = readString(value.name, MAX_PRESET_NAME_LENGTH);
  const createdAt = readString(value.createdAt, 40);
  const filters = sanitizeFilters(value.filters);

  if (!id || !name || !createdAt || !filters) {
    return undefined;
  }

  return {
    id,
    name,
    createdAt,
    filters,
  };
}

function sanitizePresets(value: unknown): FilterPreset[] {
  if (!Array.isArray(value)) {
    return EMPTY_PRESETS;
  }

  return value
    .map(sanitizePreset)
    .filter((preset): preset is FilterPreset => Boolean(preset))
    .slice(0, MAX_PRESET_COUNT);
}

function getStoredPresets(): FilterPreset[] {
  if (typeof window === "undefined") {
    return EMPTY_PRESETS;
  }

  const presetsJson = window.localStorage.getItem(STORAGE_KEY) ?? "[]";

  try {
    return sanitizePresets(JSON.parse(presetsJson));
  } catch {
    return EMPTY_PRESETS;
  }
}

function saveStoredPresets(presets: FilterPreset[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(sanitizePresets(presets)),
  );
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function subscribeToPresets(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getServerPresetsSnapshot() {
  return EMPTY_PRESETS;
}

export function SavedFilterPresets({ className }: SavedFilterPresetsProps) {
  const presets = useSyncExternalStore(
    subscribeToPresets,
    getStoredPresets,
    getServerPresetsSnapshot,
  );
  const { filters, setters } = useGameFilters();
  const [presetName, setPresetName] = useState("");

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = presetName.trim().slice(0, MAX_PRESET_NAME_LENGTH);

    if (!name) {
      return;
    }

    saveStoredPresets([
      {
        id: createPresetId(),
        name,
        filters: cloneFilters(filters),
        createdAt: new Date().toISOString(),
      },
      ...presets,
    ]);
    setPresetName("");
  }

  function applyPreset(preset: FilterPreset) {
    setters.setFilters(cloneFilters(preset.filters));
  }

  function deletePreset(presetId: string) {
    saveStoredPresets(presets.filter((preset) => preset.id !== presetId));
  }

  return (
    <section
      aria-labelledby="saved-presets-heading"
      className={cn("rounded-lg border bg-background p-4", className)}
    >
      <div className="mb-3 flex items-center gap-2">
        <Bookmark aria-hidden="true" className="size-4" />
        <h2 id="saved-presets-heading" className="text-sm font-semibold">
          Saved presets
        </h2>
      </div>

      <form onSubmit={handleSave} className="space-y-2">
        <Label htmlFor="preset-name">Preset name</Label>
        <div className="flex gap-2">
          <Input
            id="preset-name"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder="My RPG search"
            autoComplete="off"
            maxLength={MAX_PRESET_NAME_LENGTH}
          />
          <Button type="submit" disabled={!presetName.trim()}>
            Save
          </Button>
        </div>
      </form>

      {presets.length > 0 ? (
        <div className="mt-4 space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-2"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="min-w-0 flex-1 justify-start"
              >
                <span className="truncate">{preset.name}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${preset.name} preset`}
                onClick={() => deletePreset(preset.id)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No saved presets yet.
        </p>
      )}
    </section>
  );
}
