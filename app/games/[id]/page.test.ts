import { describe, expect, it } from "vitest";
import { getGames } from "@/lib/games";
import GamePage, { generateMetadata } from "./page";

describe("/games/[id]", () => {
  it("renders the game detail route for card links", async () => {
    const [game] = getGames();

    const page = await GamePage({
      params: Promise.resolve({ id: game.id }),
    });
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: game.id }),
    });

    expect(page.type).toBe("main");
    expect(metadata.title).toBe(`${game.title} | Steam Style Search`);
    expect(metadata.description).toBe(game.description);
  });

  it("preserves the originating game browser URL for the back link", async () => {
    const [game] = getGames();
    const page = await GamePage({
      params: Promise.resolve({ id: game.id }),
      searchParams: Promise.resolve({
        returnTo: "/?genre=RPG&minRating=8&sort=rating_desc",
      }),
    });

    expect(page.props.children[0].props.href).toBe(
      "/?genre=RPG&minRating=8&sort=rating_desc",
    );
  });
});
