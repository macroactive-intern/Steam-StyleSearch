import type { UrlGameFilters } from "@/hooks/useGameFilters";
import type { FilterSort } from "@/types/game";

export const STORAGE_KEY = "steam-style-search:filter-presets";
export const STORAGE_EVENT = "game-filter-presets-change";
export const MAX_PRESET_NAME_LENGTH = 50;
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

export function cloneFilters(filters: UrlGameFilters): UrlGameFilters {
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

export function hasPresetName(
  presets: readonly FilterPreset[],
  name: string,
): boolean {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return false;
  }

  return presets.some(
    (preset) => preset.name.trim().toLowerCase() === normalizedName,
  );
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

export function sanitizePresets(value: unknown): FilterPreset[] {
  if (!Array.isArray(value)) {
    return EMPTY_PRESETS;
  }

  return value
    .map(sanitizePreset)
    .filter((preset): preset is FilterPreset => Boolean(preset))
    .slice(0, MAX_PRESET_COUNT);
}

export function parseStoredPresets(presetsJson: string | null): FilterPreset[] {
  try {
    return sanitizePresets(JSON.parse(presetsJson ?? "[]"));
  } catch {
    return EMPTY_PRESETS;
  }
}

export function serializePresets(presets: FilterPreset[]) {
  return JSON.stringify(sanitizePresets(presets));
}
