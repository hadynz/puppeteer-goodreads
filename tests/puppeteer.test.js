const fs = require("fs");

const scraper = require("../src/scrapers/highlights")(page);

const loadHtmlFromFile = async fileName => {
  const html = fs.readFileSync(fileName, "utf8");
  await page.setContent(html, {
    waitUntil: "networkidle0"
  });
};

describe("Google", () => {
  it('should be titled "Google"', async () => {
    await loadHtmlFromFile("./tests/assets/fragment.highlight.html");

    const highlights = await scraper.scrapeHighlightsFromPageUrl();
    console.log(highlights);
  }, 999999);
});

// await page.screenshot({ path: "screenshot.png" });
// await jestPuppeteer.debug();
