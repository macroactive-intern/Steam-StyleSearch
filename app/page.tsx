import { Suspense } from "react";
import { GameBrowser } from "@/components/GameBrowser";
import { getGames } from "@/lib/games";

export default function Home() {
  const games = getGames();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading game browser...
        </div>
      }
    >
      <GameBrowser games={games} />
    </Suspense>
  );
}
