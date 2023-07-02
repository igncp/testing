import { test, expect } from "@playwright/test";

test("has the expected content string", async ({ page }) => {
  await page.goto("/");
  const content = await page.textContent("h1");

  expect(content).toContain("Hello World!");
});

test("the random number doesn't change (due to using 'getStaticProps')", async ({
  page,
}) => {
  await page.goto("/static-random-number");
  const getNumber = async () => {
    return Number(await page.textContent("h1"));
  };

  const randomNumber = await getNumber();

  expect(typeof randomNumber === "number").toBe(true);
  expect(Number.isNaN(randomNumber)).toBe(false);

  await page.reload();
  const randomNumber2 = await getNumber();

  expect(randomNumber2).toBe(randomNumber);
});

test("renders the server-page correctly", async ({ page }) => {
  await page.goto("/server-page");
  const content = await page.textContent("div");

  expect(content).toContain("Server Component");
});
