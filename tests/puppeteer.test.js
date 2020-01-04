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

  it("kindle highlight with more link is scraped accurately", async () => {
    await loadHtmlFromFile("./tests/assets/fragment.highlight-more.html");

    const highlights = await scraper.scrapeHighlightsFromPageUrl();
    expect(highlights).toHaveLength(1);
    expect(highlights[0]).toEqual({
      annotationId: "a1JIMM1S64WZYN%7C-0-%7C",
      bookId: "6587033",
      hastNote: false,
      locationPercentage: "7%",
      text:
        "2. Realize that the hardest step in achieving anything is making a true commitment—a true decision. Carrying out your commitment is often much easier than the decision itself, so make your decisions intelligently, but make them quickly. Don’t labor forever over the question of how or if you can do it. Studies have shown that the most successful people make decisions rapidly because they are clear on their values and what they really want for their lives. The same studies show that they are slow to change their decisions, if at all. On the other hand, people who fail usually make decisions slowly and change their minds quickly, always bouncing back and forth. Just decide!"
    });
  });

  it("ignore an empty kindle highlight from results", async () => {
    await loadHtmlFromFile("./tests/assets/fragment.highlight-empty.html");

    const highlights = await scraper.scrapeHighlightsFromPageUrl();
    expect(highlights).toHaveLength(0);
  });
});

describe("Scrape highlights pagination for a given book", () => {
  it("standard pagination bar", async () => {
    await loadHtmlFromFile("./tests/assets/fragment.pagination.html");

    const url = "https://www.googreads.com/book1?ref=abp";
    const paginationList = await scraper.scrapePaginationUrls(url);
    expect(paginationList).toHaveLength(3);
    expect(paginationList[0]).toBe(`${url}&page=2`);
    expect(paginationList[1]).toBe(`${url}&page=3`);
    expect(paginationList[2]).toBe(`${url}&page=4`);
  });

  it("pagination bar with ellipsis", async () => {
    await loadHtmlFromFile("./tests/assets/fragment.pagination-ellipsis.html");

    const url = "https://www.googreads.com/book1?ref=abp";
    const paginationList = await scraper.scrapePaginationUrls(url);
    expect(paginationList).toHaveLength(5);
    expect(paginationList[0]).toBe(`${url}&page=2`);
    expect(paginationList[1]).toBe(`${url}&page=3`);
    expect(paginationList[2]).toBe(`${url}&page=4`);
    expect(paginationList[3]).toBe(`${url}&page=5`);
    expect(paginationList[4]).toBe(`${url}&page=6`);
  });

  it("no pagination", async () => {
    await loadHtmlFromFile("./tests/assets/fragment.pagination-none.html");

    const url = "https://www.googreads.com/book1?ref=abp";
    const paginationList = await scraper.scrapePaginationUrls(url);
    expect(paginationList).toHaveLength(0);
  });
});

describe("Scrape logged in user id", () => {
  it("parse user id from navigation header links", async () => {
    await loadHtmlFromFile("./tests/assets/fragment.header.html");

    const id = await scraper.scrapeUserId();
    expect(id).toBe("70559316");
  });
});
