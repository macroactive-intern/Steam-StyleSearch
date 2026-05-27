import type { FilterSort, Game, GameFilters } from "@/types/game";

export type FilterGamesFilters = GameFilters;

type GameSorter = (first: Game, second: Game) => number;

const sorters: Record<FilterSort, GameSorter> = {
  rating_desc: (first, second) =>
    compareNumbers(second.rating, first.rating) || compareTitles(first, second),
  rating_asc: (first, second) =>
    compareNumbers(first.rating, second.rating) || compareTitles(first, second),
  title_asc: compareTitles,
  year_desc: (first, second) =>
    compareNumbers(second.releaseYear, first.releaseYear) ||
    compareTitles(first, second),
};

export function normalizeFilterValue(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeFilterValues(values: readonly string[] = []): string[] {
  return values.map(normalizeFilterValue).filter(Boolean);
}

export function gameMatchesQuery(game: Game, query: string): boolean {
  const normalizedQuery = normalizeFilterValue(query);

  if (!normalizedQuery) {
    return true;
  }

  return (
    game.title.toLowerCase().includes(normalizedQuery) ||
    game.description.toLowerCase().includes(normalizedQuery)
  );
}

export function gameHasAllTags(
  gameTags: readonly string[],
  requiredTags: readonly string[],
): boolean {
  if (requiredTags.length === 0) {
    return true;
  }

  const normalizedGameTags = new Set(gameTags.map(normalizeFilterValue));

  return requiredTags.every((requiredTag) =>
    normalizedGameTags.has(requiredTag),
  );
}

export function compareTitles(first: Game, second: Game): number {
  return (
    first.title.localeCompare(second.title) || first.id.localeCompare(second.id)
  );
}

export function compareNumbers(first: number, second: number): number {
  return first - second;
}

function hasInvertedRange(from?: number, to?: number): boolean {
  return typeof from === "number" && typeof to === "number" && from > to;
}

export function normalizeFilters(
  filters: FilterGamesFilters,
): Required<Pick<FilterGamesFilters, "tag">> & FilterGamesFilters {
  return {
    ...filters,
    q: filters.q?.trim(),
    platform: filters.platform
      ? normalizeFilterValue(filters.platform)
      : undefined,
    genre: filters.genre ? normalizeFilterValue(filters.genre) : undefined,
    tag: normalizeFilterValues(filters.tag),
  };
}

export function gameMatchesFilters(
  game: Game,
  filters: ReturnType<typeof normalizeFilters>,
): boolean {
  if (filters.q && !gameMatchesQuery(game, filters.q)) {
    return false;
  }

  if (
    filters.platform &&
    normalizeFilterValue(game.platform) !== filters.platform
  ) {
    return false;
  }

  if (filters.genre && normalizeFilterValue(game.genre) !== filters.genre) {
    return false;
  }

  if (!gameHasAllTags(game.tags, filters.tag)) {
    return false;
  }

  if (
    typeof filters.minRating === "number" &&
    game.rating < filters.minRating
  ) {
    return false;
  }

  if (
    typeof filters.maxRating === "number" &&
    game.rating > filters.maxRating
  ) {
    return false;
  }

  if (
    typeof filters.yearFrom === "number" &&
    game.releaseYear < filters.yearFrom
  ) {
    return false;
  }

  if (typeof filters.yearTo === "number" && game.releaseYear > filters.yearTo) {
    return false;
  }

  if (
    typeof filters.featured === "boolean" &&
    game.featured !== filters.featured
  ) {
    return false;
  }

  return true;
}

export function sortGames(games: readonly Game[], sort?: FilterSort): Game[] {
  const sortableGames = [...games];

  if (!sort) {
    return sortableGames;
  }

  return sortableGames.sort(sorters[sort]);
}

export function filterGames(
  games: readonly Game[],
  filters: FilterGamesFilters = {},
): Game[] {
  if (
    hasInvertedRange(filters.minRating, filters.maxRating) ||
    hasInvertedRange(filters.yearFrom, filters.yearTo)
  ) {
    return [];
  }

  const normalizedFilters = normalizeFilters(filters);
  const filteredGames = games.filter((game) =>
    gameMatchesFilters(game, normalizedFilters),
  );

  return normalizedFilters.sort
    ? filteredGames.sort(sorters[normalizedFilters.sort])
    : filteredGames;
}
