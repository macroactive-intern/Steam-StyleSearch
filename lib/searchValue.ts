import type { UrlGameFilters } from "@/hooks/useGameFilters";

function formatTerm(value: string): string {
  const term = value.trim().replaceAll('"', "");

  return /\s/.test(term) ? `"${term}"` : term;
}

export function filtersToSearchValue(filters: UrlGameFilters): string {
  const yearToken =
    typeof filters.yearFrom === "number" && typeof filters.yearTo === "number"
      ? filters.yearFrom === filters.yearTo
        ? `year:${filters.yearFrom}`
        : `year:${filters.yearFrom}-${filters.yearTo}`
      : typeof filters.yearFrom === "number"
        ? `year:>=${filters.yearFrom}`
        : typeof filters.yearTo === "number"
          ? `year:<=${filters.yearTo}`
          : undefined;
  const tokens = [
    filters.platform ? `platform:${formatTerm(filters.platform)}` : undefined,
    filters.genre ? `genre:${formatTerm(filters.genre)}` : undefined,
    typeof filters.minRating === "number" ? `rating:>${filters.minRating}` : undefined,
    typeof filters.maxRating === "number" ? `rating:<${filters.maxRating}` : undefined,
    yearToken,
    ...filters.tag.map((tag) => `tag:${formatTerm(tag)}`),
    filters.q ? formatTerm(filters.q) : undefined,
  ];

  return tokens.filter(Boolean).join(" ");
}
