"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGameFilters } from "@/hooks/useGameFilters";
import { cn } from "@/lib/utils";
import type { FilterSort } from "@/types/game";

const SORT_LABELS: Record<FilterSort, string> = {
  rating_desc: "rating high to low",
  rating_asc: "rating low to high",
  title_asc: "title A to Z",
  year_desc: "newest first",
};

export interface ActiveFilterChipsProps {
  className?: string;
}

interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

function isActiveFilterChip(
  chip: ActiveFilterChip | undefined,
): chip is ActiveFilterChip {
  return Boolean(chip);
}

export function ActiveFilterChips({ className }: ActiveFilterChipsProps) {
  const { filters, setters, clearFilter } = useGameFilters();
  const chips = [
    filters.q
      ? { key: "q", label: `search: ${filters.q}`, onRemove: () => clearFilter("q") }
      : undefined,
    filters.platform
      ? {
          key: "platform",
          label: `platform: ${filters.platform}`,
          onRemove: () => clearFilter("platform"),
        }
      : undefined,
    filters.genre
      ? {
          key: "genre",
          label: `genre: ${filters.genre}`,
          onRemove: () => clearFilter("genre"),
        }
      : undefined,
    ...filters.tag.map((tag) => ({
      key: `tag:${tag}`,
      label: `tag: ${tag}`,
      onRemove: () => setters.removeTag(tag),
    })),
    typeof filters.minRating === "number"
      ? {
          key: "minRating",
          label: `rating >= ${filters.minRating}`,
          onRemove: () => clearFilter("minRating"),
        }
      : undefined,
    typeof filters.maxRating === "number"
      ? {
          key: "maxRating",
          label: `rating <= ${filters.maxRating}`,
          onRemove: () => clearFilter("maxRating"),
        }
      : undefined,
    typeof filters.yearFrom === "number"
      ? {
          key: "yearFrom",
          label: `year >= ${filters.yearFrom}`,
          onRemove: () => clearFilter("yearFrom"),
        }
      : undefined,
    typeof filters.yearTo === "number"
      ? {
          key: "yearTo",
          label: `year <= ${filters.yearTo}`,
          onRemove: () => clearFilter("yearTo"),
        }
      : undefined,
    filters.featured
      ? {
          key: "featured",
          label: "featured",
          onRemove: () => clearFilter("featured"),
        }
      : undefined,
    filters.sort
      ? {
          key: "sort",
          label: `sort: ${SORT_LABELS[filters.sort]}`,
          onRemove: () => clearFilter("sort"),
        }
      : undefined,
  ].filter(isActiveFilterChip);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)} aria-label="Active filters">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="outline" className="pr-1">
          <span>{chip.label}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Remove ${chip.label} filter`}
            onClick={chip.onRemove}
            className="-mr-0.5 size-5 rounded-sm"
          >
            <X aria-hidden="true" className="size-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
}
