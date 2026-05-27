import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/games", () => {
  it("returns the game dataset for the client browser", async () => {
    const response = GET();
    const body = (await response.json()) as { games?: unknown[] };

    expect(response.status).toBe(200);
    expect(Array.isArray(body.games)).toBe(true);
    expect(body.games?.length).toBeGreaterThan(1000);
    expect(response.headers.get("Cache-Control")).toContain("max-age=300");
  });

  it("reuses the precomputed response between requests", () => {
    expect(GET()).toBe(GET());
  });
});
