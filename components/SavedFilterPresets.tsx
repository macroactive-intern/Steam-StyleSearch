"use client";

import { FormEvent, useSyncExternalStore, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameFilters } from "@/hooks/useGameFilters";
import {
  cloneFilters,
  hasPresetName,
  type FilterPreset,
  MAX_PRESET_NAME_LENGTH,
  parseStoredPresets,
  savePresetsToStorage,
  STORAGE_EVENT,
  STORAGE_KEY,
} from "@/lib/filterPresets";
import { cn } from "@/lib/utils";
const EMPTY_PRESETS: FilterPreset[] = [];

export interface SavedFilterPresetsProps {
  className?: string;
}

function createPresetId() {
  return crypto.randomUUID();
}

function getStoredPresets(): FilterPreset[] {
  if (typeof window === "undefined") {
    return EMPTY_PRESETS;
  }

  return parseStoredPresets(window.localStorage.getItem(STORAGE_KEY));
}

function saveStoredPresets(presets: FilterPreset[]) {
  const didSave = savePresetsToStorage(window.localStorage, presets);

  if (!didSave) {
    return false;
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
  return true;
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
  const [storageError, setStorageError] = useState<string | undefined>();
  const trimmedPresetName = presetName.trim().slice(0, MAX_PRESET_NAME_LENGTH);
  const hasDuplicateName = hasPresetName(presets, trimmedPresetName);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = trimmedPresetName;

    if (!name || hasPresetName(presets, name)) {
      return;
    }

    setStorageError(undefined);

    const didSave = saveStoredPresets([
      {
        id: createPresetId(),
        name,
        filters: cloneFilters(filters),
        createdAt: new Date().toISOString(),
      },
      ...presets,
    ]);

    if (!didSave) {
      setStorageError("Unable to save preset. Browser storage may be full.");
      return;
    }

    setPresetName("");
  }

  function applyPreset(preset: FilterPreset) {
    setters.setFilters(cloneFilters(preset.filters));
  }

  function deletePreset(presetId: string) {
    setStorageError(undefined);

    if (!saveStoredPresets(presets.filter((preset) => preset.id !== presetId))) {
      setStorageError("Unable to delete preset. Browser storage may be full.");
    }
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
            aria-invalid={hasDuplicateName}
            aria-describedby={hasDuplicateName ? "preset-name-error" : undefined}
          />
          <Button type="submit" disabled={!trimmedPresetName || hasDuplicateName}>
            Save
          </Button>
        </div>
        {hasDuplicateName ? (
          <p id="preset-name-error" className="text-sm text-destructive">
            A preset with this name already exists.
          </p>
        ) : null}
        {storageError ? (
          <p role="alert" className="text-sm text-destructive">
            {storageError}
          </p>
        ) : null}
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
