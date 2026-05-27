// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@/types/game";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={String(href)} className={className}>
      {children}
    </a>
  ),
}));

import { PaginatedGameFallback } from "./PaginatedGameFallback";

function makeGame(id: number): Game {
  return {
    id: String(id),
    title: `Game ${id}`,
    description: "Test description",
    platform: "PC",
    genre: "RPG",
    tags: [],
    rating: 8.0,
    releaseYear: 2020,
    featured: false,
    coverImage: `/covers/game-${id}.jpg`,
  };
}

const GAMES_25 = Array.from({ length: 25 }, (_, i) => makeGame(i + 1));
const GAMES_48 = Array.from({ length: 48 }, (_, i) => makeGame(i + 1));

afterEach(cleanup);

describe("PaginatedGameFallback", () => {
  it("shows all games on page 1 when there are fewer than 24", () => {
    const games = Array.from({ length: 10 }, (_, i) => makeGame(i + 1));
    render(<PaginatedGameFallback games={games} page={1} />);

    expect(screen.getByText("10 games found")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(10);
  });

  it("shows 24 games on page 1 and 1 on page 2 for a 25-game list", () => {
    render(<PaginatedGameFallback games={GAMES_25} page={1} />);
    expect(screen.getAllByRole("article")).toHaveLength(24);

    cleanup();

    render(<PaginatedGameFallback games={GAMES_25} page={2} />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("shows 'Page 1 of 1' for an empty games list", () => {
    render(<PaginatedGameFallback games={[]} page={1} />);
    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
    expect(screen.getByText("0 games found")).toBeTruthy();
  });

  it("clamps page 0 to page 1", () => {
    render(<PaginatedGameFallback games={GAMES_25} page={0} />);
    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(24);
  });

  it("clamps an out-of-range page to the last page", () => {
    render(<PaginatedGameFallback games={GAMES_25} page={999} />);
    expect(screen.getByText("Page 2 of 2")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("disables Previous on page 1 and enables Next", () => {
    render(<PaginatedGameFallback games={GAMES_25} page={1} />);

    expect(screen.getByText("Previous")).toHaveProperty("tagName", "SPAN");
    expect(screen.getByText("Next").tagName).toBe("A");
  });

  it("enables Previous on page 2 and disables Next on the last page", () => {
    render(<PaginatedGameFallback games={GAMES_25} page={2} />);

    expect(screen.getByText("Previous").tagName).toBe("A");
    expect(screen.getByText("Next")).toHaveProperty("tagName", "SPAN");
  });

  it("omits the page param from page 1 href", () => {
    render(<PaginatedGameFallback games={GAMES_25} page={1} />);

    const nextLink = screen.getByText("Next");
    expect(nextLink.getAttribute("href")).toBe("/?page=2");

    cleanup();

    render(<PaginatedGameFallback games={GAMES_25} page={2} />);
    const prevLink = screen.getByText("Previous");
    expect(prevLink.getAttribute("href")).toBe("/");
  });

  it("preserves filter search params in pagination hrefs", () => {
    render(
      <PaginatedGameFallback
        games={GAMES_48}
        page={1}
        searchParams={{ genre: "RPG", minRating: "8", sort: "rating_desc" }}
      />,
    );

    const nextLink = screen.getByText("Next");
    const href = nextLink.getAttribute("href")!;

    expect(href).toContain("genre=RPG");
    expect(href).toContain("minRating=8");
    expect(href).toContain("sort=rating_desc");
    expect(href).toContain("page=2");
  });

  it("excludes any existing page param from filter search params", () => {
    render(
      <PaginatedGameFallback
        games={GAMES_48}
        page={1}
        searchParams={{ genre: "RPG", page: "1" }}
      />,
    );

    const nextHref = screen.getByText("Next").getAttribute("href")!;
    const params = new URLSearchParams(nextHref.slice(2));

    expect(params.getAll("page")).toHaveLength(1);
    expect(params.get("page")).toBe("2");
  });
});
