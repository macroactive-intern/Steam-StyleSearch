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

export type FilterSort =
  | "rating_desc"
  | "rating_asc"
  | "title_asc"
  | "year_desc";

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
