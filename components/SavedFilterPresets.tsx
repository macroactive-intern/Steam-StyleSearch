"use client";

import { FormEvent, useSyncExternalStore, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameFilters, type UrlGameFilters } from "@/hooks/useGameFilters";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "steam-style-search:filter-presets";
const STORAGE_EVENT = "game-filter-presets-change";
const EMPTY_PRESETS: FilterPreset[] = [];

export interface FilterPreset {
  id: string;
  name: string;
  filters: UrlGameFilters;
  createdAt: string;
}

export interface SavedFilterPresetsProps {
  className?: string;
}

let cachedPresetsJson = "";
let cachedPresets: FilterPreset[] = EMPTY_PRESETS;

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

function getStoredPresets(): FilterPreset[] {
  if (typeof window === "undefined") {
    return EMPTY_PRESETS;
  }

  const presetsJson = window.localStorage.getItem(STORAGE_KEY) ?? "[]";

  if (presetsJson === cachedPresetsJson) {
    return cachedPresets;
  }

  try {
    const parsedPresets = JSON.parse(presetsJson) as FilterPreset[];
    cachedPresets = Array.isArray(parsedPresets) ? parsedPresets : EMPTY_PRESETS;
    cachedPresetsJson = presetsJson;
  } catch {
    cachedPresets = EMPTY_PRESETS;
    cachedPresetsJson = presetsJson;
  }

  return cachedPresets;
}

function saveStoredPresets(presets: FilterPreset[]) {
  cachedPresets = presets;
  cachedPresetsJson = JSON.stringify(presets);
  window.localStorage.setItem(STORAGE_KEY, cachedPresetsJson);
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

    const name = presetName.trim();

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
