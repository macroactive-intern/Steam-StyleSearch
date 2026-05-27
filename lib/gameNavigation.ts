export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const RETURN_TO_PARAM = "returnTo";

function isSafeInternalPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

export function buildPathWithSearch(
  pathname: string,
  searchParams?: SearchParamsRecord | URLSearchParams,
): string {
  const params = new URLSearchParams();

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => params.append(key, value));
  } else if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else {
        params.set(key, value);
      }
    }
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function buildGameHref(gameId: string, returnTo: string): string {
  const params = new URLSearchParams();

  if (isSafeInternalPath(returnTo)) {
    params.set(RETURN_TO_PARAM, returnTo);
  }

  const query = params.toString();

  return query ? `/games/${gameId}?${query}` : `/games/${gameId}`;
}

export function getBackHref(returnTo?: string | string[]): string {
  const value = Array.isArray(returnTo) ? returnTo[0] : returnTo;

  return value && isSafeInternalPath(value) ? value : "/";
}
