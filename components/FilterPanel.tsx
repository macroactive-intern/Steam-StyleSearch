"use client";

import { useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGameFilters } from "@/hooks/useGameFilters";
import { cn } from "@/lib/utils";
import type { FilterSort } from "@/types/game";

const SORT_OPTIONS: Array<{ label: string; value: FilterSort }> = [
  { label: "Rating high to low", value: "rating_desc" },
  { label: "Rating low to high", value: "rating_asc" },
  { label: "Title A to Z", value: "title_asc" },
  { label: "Newest first", value: "year_desc" },
];

export interface FilterPanelProps {
  className?: string;
  platforms: string[];
  genres: string[];
  tags: string[];
  releaseYearRange: { min: number; max: number };
}

function parseNumberValue(value: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function FilterPanel({
  className,
  platforms,
  genres,
  tags,
  releaseYearRange,
}: FilterPanelProps) {
  const { filters, setters, clearAll } = useGameFilters();
  const selectedTags = useMemo(() => new Set(filters.tag), [filters.tag]);

  function toggleTag(tag: string, checked: boolean) {
    const nextTags = checked
      ? [...filters.tag, tag]
      : filters.tag.filter((selectedTag) => selectedTag !== tag);

    setters.setTag(nextTags);
  }

  return (
    <section
      aria-labelledby="filters-heading"
      className={cn("w-full rounded-lg border bg-background p-4", className)}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <h2 id="filters-heading" className="text-sm font-semibold">
            Filters
          </h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
          Clear all
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="filter-platform">Platform</Label>
          <Select
            value={filters.platform ?? "all"}
            onValueChange={(value) =>
              setters.setPlatform(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger id="filter-platform">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-genre">Genre</Label>
          <Select
            value={filters.genre ?? "all"}
            onValueChange={(value) =>
              setters.setGenre(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger id="filter-genre">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-sort">Sort</Label>
          <Select
            value={filters.sort ?? "none"}
            onValueChange={(value) =>
              setters.setSort(value === "none" ? undefined : (value as FilterSort))
            }
          >
            <SelectTrigger id="filter-sort">
              <SelectValue placeholder="Default order" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">Default order</SelectItem>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="flex h-9 items-center gap-2 rounded-lg border px-3">
            <Checkbox
              id="filter-featured"
              checked={filters.featured === true}
              onCheckedChange={(checked) =>
                setters.setFeatured(checked === true ? true : undefined)
              }
            />
            <Label htmlFor="filter-featured">Featured</Label>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="col-span-2 mb-2 text-sm font-medium">
            Rating range
          </legend>
          <div className="space-y-2">
            <Label htmlFor="filter-min-rating">Min</Label>
            <Input
              id="filter-min-rating"
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={filters.minRating ?? ""}
              onChange={(event) =>
                setters.setMinRating(parseNumberValue(event.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-max-rating">Max</Label>
            <Input
              id="filter-max-rating"
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={filters.maxRating ?? ""}
              onChange={(event) =>
                setters.setMaxRating(parseNumberValue(event.target.value))
              }
            />
          </div>
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="col-span-2 mb-2 text-sm font-medium">
            Year range
          </legend>
          <div className="space-y-2">
            <Label htmlFor="filter-year-from">From</Label>
            <Input
              id="filter-year-from"
              type="number"
              min={releaseYearRange.min}
              max={releaseYearRange.max}
              value={filters.yearFrom ?? ""}
              onChange={(event) =>
                setters.setYearFrom(parseNumberValue(event.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-year-to">To</Label>
            <Input
              id="filter-year-to"
              type="number"
              min={releaseYearRange.min}
              max={releaseYearRange.max}
              value={filters.yearTo ?? ""}
              onChange={(event) =>
                setters.setYearTo(parseNumberValue(event.target.value))
              }
            />
          </div>
        </fieldset>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium">Tags</legend>
        <div className="grid max-h-56 gap-2 overflow-auto rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tags.map((tag, index) => (
            <div
              key={tag}
              className="flex items-center gap-2 rounded-md px-1 py-1"
            >
              <Checkbox
                id={`filter-tag-${index}`}
                checked={selectedTags.has(tag)}
                onCheckedChange={(checked) => toggleTag(tag, checked === true)}
              />
              <Label
                htmlFor={`filter-tag-${index}`}
                className="text-sm font-normal"
              >
                {tag}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
