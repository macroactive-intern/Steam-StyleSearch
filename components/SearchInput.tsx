"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchSync } from "@/hooks/useSearchSync";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  id?: string;
  className?: string;
  delay?: number;
  placeholder?: string;
}

export function SearchInput({
  id = "game-search",
  className,
  delay = 300,
  placeholder = 'Search games or use platform:PC genre:rpg year:2018-2022 rating:>8 tag:rpg "dark souls"',
}: SearchInputProps) {
  const {
    value,
    handleBlur,
    handleChange,
    handleClear,
    handleFocus,
    handleKeyDown,
  } = useSearchSync(delay);

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">
        Search games
      </label>
      <Search
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="pr-10 pl-9"
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
