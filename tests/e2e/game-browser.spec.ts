import { expect, test, type Page } from "@playwright/test";

const focusedSearch = 'platform:PC rating:>9 tag:"Open World"';
const expectedGame = "Chrome Revenant: Breakpoint";

function gameBrowser(page: Page) {
  return page.locator("[data-js-enhanced]").filter({
    has: page.getByRole("searchbox", { name: "Search games" }),
  });
}

test("advanced search filters results and preserves filters through detail navigation", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: "Search games" }).fill(focusedSearch);

  await expect(page).toHaveURL(/platform=PC/);
  await expect(page).toHaveURL(/minRating=9/);
  await expect(page).toHaveURL(/tag=Open\+World|tag=Open%20World/);
  await expect(page.getByRole("link", { name: new RegExp(expectedGame) })).toBeVisible();
  await expect(gameBrowser(page).getByText("1 games found")).toBeVisible();

  await page.getByRole("link", { name: new RegExp(expectedGame) }).click();
  await expect(page.getByRole("heading", { name: expectedGame })).toBeVisible();

  await page.getByRole("link", { name: "Back to games" }).click();
  await expect(page).toHaveURL(/platform=PC/);
  await expect(page.getByRole("link", { name: new RegExp(expectedGame) })).toBeVisible();
});

test("virtualized results keep the rendered card count bounded", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-game-results-scroll]")).toBeVisible();
  await expect(page.locator("[data-game-results-scroll] article").first()).toBeVisible();

  const renderedCards = await page.locator("[data-game-results-scroll] article").count();

  expect(renderedCards).toBeGreaterThan(0);
  expect(renderedCards).toBeLessThanOrEqual(30);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("renders a filtered paginated fallback from URL params", async ({ page }) => {
    await page.goto("/?platform=PC&tag=Open+World&minRating=9");

    const fallback = page.locator("[data-no-js-fallback]");

    await expect(page.getByRole("heading", { name: "Game Browser" })).toBeVisible();
    await expect(page.getByRole("link", { name: new RegExp(expectedGame) })).toBeVisible();
    await expect(fallback.getByText("1 games found")).toBeVisible();
  });
});
