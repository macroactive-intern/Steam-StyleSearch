import { Suspense } from "react";
import { GameBrowser } from "@/components/GameBrowser";
import { PaginatedGameFallback } from "@/components/PaginatedGameFallback";
import { getGames } from "@/lib/games";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getPageNumber(searchParams: Awaited<PageSearchParams>) {
  const page = searchParams.page;
  const pageValue = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number(pageValue);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const games = getGames();
  const resolvedSearchParams = await searchParams;
  const page = getPageNumber(resolvedSearchParams);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.classList.add('js-enabled');document.documentElement.classList.remove('no-js');",
        }}
      />
      <PaginatedGameFallback
        games={games}
        page={page}
        searchParams={resolvedSearchParams}
      />
      <Suspense fallback={null}>
        <GameBrowser games={games} />
      </Suspense>
    </>
  );
}
