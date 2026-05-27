import type { Game } from "@/types/game";

export interface GamesResponse {
  games: Game[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((tag) => readString(tag))
    .filter((tag): tag is string => Boolean(tag))
    .map((tag) => tag.trim());
}

export function sanitizeGame(value: unknown): Game | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = readString(value.id);
  const title = readString(value.title);
  const description = readString(value.description);
  const platform = readString(value.platform);
  const genre = readString(value.genre);
  const tags = readTags(value.tags);
  const rating = readNumber(value.rating);
  const releaseYear = readNumber(value.releaseYear);
  const featured = readBoolean(value.featured);
  const coverImage = readString(value.coverImage);

  if (
    !id ||
    !title ||
    !description ||
    !platform ||
    !genre ||
    !tags ||
    rating === undefined ||
    releaseYear === undefined ||
    featured === undefined ||
    !coverImage
  ) {
    return undefined;
  }

  return {
    id,
    title,
    description,
    platform,
    genre,
    tags,
    rating,
    releaseYear,
    featured,
    coverImage,
  };
}

export function sanitizeGamesResponse(value: unknown): GamesResponse {
  if (!isRecord(value) || !Array.isArray(value.games)) {
    return { games: [] };
  }

  return {
    games: value.games
      .map(sanitizeGame)
      .filter((game): game is Game => Boolean(game)),
  };
}
