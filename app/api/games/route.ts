import { NextResponse } from "next/server";
import { getGames } from "@/lib/games";

const gamesResponse = NextResponse.json(
  { games: getGames() },
  {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  },
);

export function GET() {
  return gamesResponse;
}
