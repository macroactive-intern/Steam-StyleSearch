import gamesData from "@/data/games.json";
import type { FilterSort, Game, GameFilters } from "@/types/game";

export interface GetGamesOptions extends GameFilters {
  search?: string;
}

const games: readonly Game[] = gamesData;

const sorters: Record<FilterSort, (first: Game, second: Game) => number> = {
  rating_desc: (first, second) => second.rating - first.rating,
  rating_asc: (first, second) => first.rating - second.rating,
  title_asc: (first, second) => first.title.localeCompare(second.title),
  year_desc: (first, second) => second.releaseYear - first.releaseYear,
};

function copyGame(game: Game): Game {
  return {
    ...game,
    tags: [...game.tags],
  };
}

function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((first, second) =>
    first.localeCompare(second),
  );
}

function matchesSearch(game: Game, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    game.title,
    game.description,
    game.platform,
    game.genre,
    ...game.tags,
  ].some((value) => value.toLowerCase().includes(query));
}

function matchesFilters(game: Game, filters: GetGamesOptions) {
  if (filters.platform && game.platform !== filters.platform) {
    return false;
  }

  if (filters.genre && game.genre !== filters.genre) {
    return false;
  }

  if (typeof filters.featured === "boolean" && game.featured !== filters.featured) {
    return false;
  }

  if (filters.tags?.length) {
    const gameTags = new Set(game.tags);

    if (!filters.tags.every((tag) => gameTags.has(tag))) {
      return false;
    }
  }

  if (filters.search && !matchesSearch(game, filters.search)) {
    return false;
  }

  return true;
}

export function getGames(filters: GetGamesOptions = {}): Game[] {
  const filteredGames = games.filter((game) => matchesFilters(game, filters));
  const sortedGames = filters.sort
    ? [...filteredGames].sort(sorters[filters.sort])
    : filteredGames;

  return sortedGames.map(copyGame);
}

export function getPlatforms(): string[] {
  return uniqueSorted(games.map((game) => game.platform));
}

export function getGenres(): string[] {
  return uniqueSorted(games.map((game) => game.genre));
}

export function getTags(): string[] {
  return uniqueSorted(games.flatMap((game) => game.tags));
}
