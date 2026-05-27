import { NextResponse } from "next/server";
import { getGames } from "@/lib/games";

export function GET() {
  return NextResponse.json(
    { games: getGames() },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
