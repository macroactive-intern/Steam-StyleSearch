export interface ParsedQueryFilters {
  platform?: string;
  genre?: string;
  tags: string[];
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
}

export interface ParsedQuery {
  raw: string;
  terms: string[];
  filters: ParsedQueryFilters;
}

export interface QueryToken {
  value: string;
  quoted: boolean;
}

export interface ParseQueryExample {
  input: string;
  output: ParsedQuery;
}

type ParsedFilterPatch = Omit<Partial<ParsedQueryFilters>, "tags"> & {
  tags?: string[];
};

const FIELD_PATTERN = /^([a-z]+):(.+)$/i;
const RATING_PATTERN = /^([<>])(\d+(?:\.\d+)?)$/;
const YEAR_PATTERN = /^\d{4}$/;
const YEAR_RANGE_PATTERN = /^(\d{4})-(\d{4})$/;
const YEAR_BOUND_PATTERN = /^([<>]=?)(\d{4})$/;

function createEmptyFilters(): ParsedQueryFilters {
  return {
    tags: [],
  };
}

function tokenizeQuery(query: string): QueryToken[] {
  const tokens: QueryToken[] = [];
  let current = "";
  let quoted = false;
  let inQuote = false;

  for (const character of query) {
    if (character === '"') {
      if (!current) {
        quoted = true;
      }

      inQuote = !inQuote;
      continue;
    }

    if (/\s/.test(character) && !inQuote) {
      if (current) {
        tokens.push({ value: current, quoted });
      }

      current = "";
      quoted = false;
      continue;
    }

    current += character;
  }

  if (current) {
    tokens.push({ value: current, quoted });
  }

  return tokens;
}

function parseRating(value: string): ParsedFilterPatch | undefined {
  const match = value.match(RATING_PATTERN);

  if (!match) {
    return undefined;
  }

  const [, operator, ratingValue] = match;
  const rating = Number(ratingValue);

  if (operator === ">") {
    return { minRating: rating };
  }

  return { maxRating: rating };
}

function parseYear(value: string): ParsedFilterPatch | undefined {
  if (YEAR_PATTERN.test(value)) {
    const year = Number(value);

    return { yearFrom: year, yearTo: year };
  }

  const rangeMatch = value.match(YEAR_RANGE_PATTERN);

  if (rangeMatch) {
    const [, fromYear, toYear] = rangeMatch;

    return { yearFrom: Number(fromYear), yearTo: Number(toYear) };
  }

  const boundMatch = value.match(YEAR_BOUND_PATTERN);

  if (!boundMatch) {
    return undefined;
  }

  const [, operator, yearValue] = boundMatch;
  const year = Number(yearValue);

  if (operator.startsWith(">")) {
    return { yearFrom: year };
  }

  return { yearTo: year };
}

function parseFieldToken(token: QueryToken): ParsedFilterPatch | undefined {
  if (token.quoted) {
    return undefined;
  }

  const match = token.value.match(FIELD_PATTERN);

  if (!match) {
    return undefined;
  }

  const [, field, value] = match;
  const normalizedField = field.toLowerCase();

  if (normalizedField === "platform") {
    return { platform: value };
  }

  if (normalizedField === "genre") {
    return { genre: value };
  }

  if (normalizedField === "tag") {
    return { tags: [value] };
  }

  if (normalizedField === "rating") {
    return parseRating(value);
  }

  if (normalizedField === "year") {
    return parseYear(value);
  }

  return undefined;
}

function mergeFilterPatch(
  filters: ParsedQueryFilters,
  patch: ParsedFilterPatch,
): ParsedQueryFilters {
  return {
    ...filters,
    ...patch,
    tags: [...filters.tags, ...(patch.tags ?? [])],
  };
}

export function parseQuery(query: string): ParsedQuery {
  let filters = createEmptyFilters();
  const terms: string[] = [];

  for (const token of tokenizeQuery(query)) {
    const patch = parseFieldToken(token);

    if (patch) {
      filters = mergeFilterPatch(filters, patch);
    } else {
      terms.push(token.value);
    }
  }

  return {
    raw: query,
    terms,
    filters,
  };
}

export const parseQueryExamples: readonly ParseQueryExample[] = [
  {
    input: 'platform:PC genre:rpg rating:>8 tag:rpg "dark souls"',
    output: {
      raw: 'platform:PC genre:rpg rating:>8 tag:rpg "dark souls"',
      terms: ["dark souls"],
      filters: {
        platform: "PC",
        genre: "rpg",
        tags: ["rpg"],
        minRating: 8,
      },
    },
  },
  {
    input: "rating:<6 year:2018-2022 tag:co-op indie gem",
    output: {
      raw: "rating:<6 year:2018-2022 tag:co-op indie gem",
      terms: ["indie", "gem"],
      filters: {
        tags: ["co-op"],
        maxRating: 6,
        yearFrom: 2018,
        yearTo: 2022,
      },
    },
  },
  {
    input: '"space strategy" genre:4x tag:tactical',
    output: {
      raw: '"space strategy" genre:4x tag:tactical',
      terms: ["space strategy"],
      filters: {
        genre: "4x",
        tags: ["tactical"],
      },
    },
  },
];
