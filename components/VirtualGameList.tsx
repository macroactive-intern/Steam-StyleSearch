"use client";

import { useRef } from "react";
import { Star } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Game } from "@/types/game";

export interface VirtualGameListProps {
  games: readonly Game[];
  className?: string;
}

function GameCard({ game }: { game: Game }) {
  return (
    <article className="grid min-h-44 gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-xs sm:grid-cols-[160px_1fr]">
      <div className="flex aspect-[4/3] items-center justify-center rounded-md border bg-muted text-center text-xs font-medium text-muted-foreground sm:aspect-auto sm:h-full">
        {game.title}
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{game.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {game.platform} · {game.genre} · {game.releaseYear}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-sm font-medium">
            <Star aria-hidden="true" className="size-4 fill-current" />
            {game.rating.toFixed(1)}
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {game.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {game.featured ? <Badge>Featured</Badge> : null}
          {game.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}

export function VirtualGameList({ games, className }: VirtualGameListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const count = games.length;
  // React Compiler flags TanStack Virtual because it exposes live measurement methods.
  // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer is required for windowed rendering.
  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 4,
  });

  if (count === 0) {
    return (
      <section
        className={cn(
          "flex min-h-64 items-center justify-center rounded-lg border bg-muted/30 p-8 text-center",
          className,
        )}
      >
        <div>
          <p className="text-base font-semibold">No games found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
        {count} games found
      </p>

      <div
        ref={parentRef}
        role="region"
        aria-label="Game results"
        tabIndex={0}
        className="h-[min(72vh,760px)] overflow-auto rounded-lg border bg-background p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const game = games[virtualRow.index];

            return (
              <div
                key={game.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute left-0 top-0 w-full pb-3"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <GameCard game={game} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
