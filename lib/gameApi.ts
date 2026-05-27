import { z } from "zod";
import type { Game } from "@/types/game";

export interface GamesResponse {
  games: Game[];
}

const requiredStringSchema = z.string().trim().min(1);
const finiteNumberSchema = z.number().refine(Number.isFinite);
const coverImageSchema = requiredStringSchema.refine(
  (coverImage) =>
    coverImage.startsWith("/") || coverImage.startsWith("https://"),
);
const tagsSchema = z.array(z.unknown()).transform((tags) =>
  tags
    .map((tag) => requiredStringSchema.safeParse(tag))
    .filter((result): result is z.ZodSafeParseSuccess<string> => result.success)
    .map((result) => result.data),
);

export const gameSchema: z.ZodType<Game> = z.object({
  id: requiredStringSchema,
  title: requiredStringSchema,
  description: requiredStringSchema,
  platform: requiredStringSchema,
  genre: requiredStringSchema,
  tags: tagsSchema,
  rating: finiteNumberSchema,
  releaseYear: finiteNumberSchema,
  featured: z.boolean(),
  coverImage: coverImageSchema,
});

export const gamesResponseSchema = z.object({
  games: z.array(z.unknown()).default([]),
});

export function sanitizeGame(value: unknown): Game | undefined {
  const result = gameSchema.safeParse(value);

  return result.success ? result.data : undefined;
}

export function sanitizeGamesResponse(value: unknown): GamesResponse {
  const result = gamesResponseSchema.safeParse(value);

  if (!result.success) {
    return { games: [] };
  }

  return {
    games: result.data.games
      .map(sanitizeGame)
      .filter((game): game is Game => Boolean(game)),
  };
}
