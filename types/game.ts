export interface Game {
  id: string;
  title: string;
  description: string;
  platform: string;
  genre: string;
  tags: string[];
  rating: number;
  releaseYear: number;
  featured: boolean;
  coverImage: string;
}

export const FILTER_SORT_VALUES = [
  "rating_desc",
  "rating_asc",
  "title_asc",
  "year_desc",
] as const;

export type FilterSort = (typeof FILTER_SORT_VALUES)[number];

export function isFilterSort(value: string | undefined): value is FilterSort {
  return FILTER_SORT_VALUES.some((sort) => sort === value);
}

export interface GameFilters {
  q?: string;
  platform?: string;
  genre?: string;
  tag?: string[];
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  featured?: boolean;
  sort?: FilterSort;
}
