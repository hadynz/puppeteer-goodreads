const fs = require("fs");

const scraper = require("../src/scrapers/highlights")(page);

const loadHtmlFromFile = async fileName => {
  const html = fs.readFileSync(fileName, "utf8");
  await page.setContent(html, {
    waitUntil: "networkidle0"
  });
};

describe("Scrape kindle highlights for a given book", () => {
  it("standard kindle highlight is scraped accurately", async () => {
    await loadHtmlFromFile("./tests/assets/fragment.highlight.html");

    const highlights = await scraper.scrapeHighlightsFromPageUrl();
    expect(highlights).toHaveLength(1);
    expect(highlights[0]).toEqual({
      annotationId: "aJ2HUN17A79BA%7C-0-%7C",
      bookId: "6587033",
      hastNote: false,
      locationPercentage: "8%",
      text:
        "What is this force that is controlling you even now and will continue to do so for the rest of your life? PAIN and PLEASURE! Everything you and I do, we do either out of our need to avoid pain or our desire to gain pleasure."
    });
  });
});

// await page.screenshot({ path: "screenshot.png" });
// await jestPuppeteer.debug();
