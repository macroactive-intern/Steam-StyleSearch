import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getBackHref, RETURN_TO_PARAM } from "@/lib/gameNavigation";
import { getGameById } from "@/lib/games";

type GamePageParams = Promise<{ id: string }>;
type GamePageSearchParams = Promise<{ [RETURN_TO_PARAM]?: string | string[] }>;

export async function generateMetadata({
  params,
}: {
  params: GamePageParams;
}): Promise<Metadata> {
  const { id } = await params;
  const game = getGameById(id);

  if (!game) {
    return {
      title: "Game not found",
    };
  }

  return {
    title: `${game.title} | Steam Style Search`,
    description: game.description,
  };
}

export default async function GamePage({
  params,
  searchParams,
}: {
  params: GamePageParams;
  searchParams?: GamePageSearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const game = getGameById(id);

  if (!game) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href={getBackHref(resolvedSearchParams[RETURN_TO_PARAM])}
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Back to games
      </Link>

      <article className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
          <Image
            src={game.coverImage}
            alt={`${game.title} cover`}
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            unoptimized
            className="object-cover"
            priority
          />
        </div>

        <div className="min-w-0 space-y-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {game.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {game.platform} | {game.genre} | {game.releaseYear}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {game.featured ? <Badge>Featured</Badge> : null}
            {game.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <p className="text-base leading-7 text-muted-foreground">
            {game.description}
          </p>

          <dl className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Rating</dt>
              <dd className="text-lg font-semibold">{game.rating.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Release year</dt>
              <dd className="text-lg font-semibold">{game.releaseYear}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Platform</dt>
              <dd className="text-lg font-semibold">{game.platform}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Genre</dt>
              <dd className="text-lg font-semibold">{game.genre}</dd>
            </div>
          </dl>
        </div>
      </article>
    </main>
  );
}
