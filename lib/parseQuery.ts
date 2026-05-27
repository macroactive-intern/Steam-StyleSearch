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
      quoted = true;
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

function parseRating(value: string, filters: ParsedQueryFilters) {
  const match = value.match(RATING_PATTERN);

  if (!match) {
    return false;
  }

  const [, operator, ratingValue] = match;
  const rating = Number(ratingValue);

  if (operator === ">") {
    filters.minRating = rating;
    return true;
  }

  filters.maxRating = rating;
  return true;
}

function parseYear(value: string, filters: ParsedQueryFilters) {
  if (YEAR_PATTERN.test(value)) {
    const year = Number(value);
    filters.yearFrom = year;
    filters.yearTo = year;

    return true;
  }

  const rangeMatch = value.match(YEAR_RANGE_PATTERN);

  if (rangeMatch) {
    const [, fromYear, toYear] = rangeMatch;
    filters.yearFrom = Number(fromYear);
    filters.yearTo = Number(toYear);

    return true;
  }

  const boundMatch = value.match(YEAR_BOUND_PATTERN);

  if (!boundMatch) {
    return false;
  }

  const [, operator, yearValue] = boundMatch;
  const year = Number(yearValue);

  if (operator.startsWith(">")) {
    filters.yearFrom = year;
    return true;
  }

  filters.yearTo = year;
  return true;
}

function applyFieldToken(token: QueryToken, filters: ParsedQueryFilters) {
  if (token.quoted) {
    return false;
  }

  const match = token.value.match(FIELD_PATTERN);

  if (!match) {
    return false;
  }

  const [, field, value] = match;
  const normalizedField = field.toLowerCase();

  if (normalizedField === "platform") {
    filters.platform = value;
    return true;
  }

  if (normalizedField === "genre") {
    filters.genre = value;
    return true;
  }

  if (normalizedField === "tag") {
    filters.tags.push(value);
    return true;
  }

  if (normalizedField === "rating") {
    return parseRating(value, filters);
  }

  if (normalizedField === "year") {
    return parseYear(value, filters);
  }

  return false;
}

export function parseQuery(query: string): ParsedQuery {
  const filters = createEmptyFilters();
  const terms: string[] = [];

  for (const token of tokenizeQuery(query)) {
    if (!applyFieldToken(token, filters)) {
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
