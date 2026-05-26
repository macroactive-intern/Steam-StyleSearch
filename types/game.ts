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
  platform?: string;
  genre?: string;
  tags?: string[];
  featured?: boolean;
  sort?: FilterSort;
}
