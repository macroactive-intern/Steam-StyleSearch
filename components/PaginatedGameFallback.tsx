import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@/types/game";

const PAGE_SIZE = 24;

export interface PaginatedGameFallbackProps {
  games: readonly Game[];
  page: number;
  searchParams?: Record<string, string | string[] | undefined>;
}

function buildPageHref(
  page: number,
  searchParams: PaginatedGameFallbackProps["searchParams"],
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "page" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/?${query}` : "/";
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

function FallbackGameCard({ game }: { game: Game }) {
  return (
    <article className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted">
        <Image
          src={game.coverImage}
          alt={`${game.title} cover`}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{game.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {game.platform} | {game.genre} | {game.releaseYear}
          </p>
        </div>
        <span className="rounded-md border px-2 py-1 text-sm font-medium">
          {game.rating.toFixed(1)}
        </span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        {game.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {game.featured ? <Badge>Featured</Badge> : null}
        {game.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </article>
  );
}

function PaginationLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean;
  href: string;
  children: string;
}) {
  const className = "rounded-lg border px-3 py-2 text-sm font-medium";

  if (disabled) {
    return (
      <span aria-disabled="true" className={`${className} opacity-50`}>
        {children}
      </span>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function PaginatedGameFallback({
  games,
  page,
  searchParams,
}: PaginatedGameFallbackProps) {
  const totalPages = Math.max(Math.ceil(games.length / PAGE_SIZE), 1);
  const currentPage = clampPage(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleGames = games.slice(start, start + PAGE_SIZE);

  return (
    <section
      data-no-js-fallback
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Steam Style Search
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Game Browser</h1>
        <p className="text-sm text-muted-foreground">
          {games.length} games found
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleGames.map((game) => (
          <FallbackGameCard key={game.id} game={game} />
        ))}
      </div>

      <nav
        aria-label="Game pagination"
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
      >
        <PaginationLink
          href={buildPageHref(currentPage - 1, searchParams)}
          disabled={currentPage === 1}
        >
          Previous
        </PaginationLink>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <PaginationLink
          href={buildPageHref(currentPage + 1, searchParams)}
          disabled={currentPage === totalPages}
        >
          Next
        </PaginationLink>
      </nav>
    </section>
  );
}
