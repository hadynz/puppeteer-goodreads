const puppeteer = require("puppeteer");

const Scraper = require("./scrapers/highlights");

const loginToGoodreads = async (browser, email, password) => {
  const page = await browser.newPage();
  await page.goto("https://www.goodreads.com/user/sign_in");
  await page.type("#user_email", email);
  await page.type("#user_password", password);
  await page.click('[name="next"]');
  await page.waitForSelector("nav.siteHeader__primaryNavInline");
};

const scrapeListOfBooks = async browser => {
  const browserPages = await browser.pages();
  const currentPage = browserPages.slice(-1)[0];

  const userId = await Scraper(currentPage).scrapeUserId();
  const url = `https://www.goodreads.com/notes/${userId}/load_more`;

  const page = await browser.newPage();

  const [response] = await Promise.all([
    page.waitForResponse(url),
    page.goto(url)
  ]);

  const rawJson = await response.json();

  return rawJson.annotated_books_collection.map(book => ({
    asin: book.asin,
    title: book.title,
    author: book.authorName,
    imageUrl: book.imageUrl,
    bookUrl: book.readingNotesUrl
  }));
};

const scrapeHighlightsFromPageUrl = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url);

  return Scraper(page).scrapeHighlightsFromPageUrl();
};

const scrapeHighlightsPaginationPageUrls = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url);

  return Scraper(page).scrapePaginationUrls(url);
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false
    // slowMo: 250,
    // devtools: true
  });

  await loginToGoodreads(browser, "hadyos@gmail.com", "@0wt!*%1^uk2@IMu");

  const books = await scrapeListOfBooks(browser);

  for (let i = 2; i < 5; i++) {
    const book = books[i];
    const pages = await scrapeHighlightsPaginationPageUrls(
      browser,
      book.bookUrl
    );

    let highlights = [];

    for (const page of pages) {
      highlights = highlights.concat(
        await scrapeHighlightsFromPageUrl(browser, page)
      );
    }

    console.log(
      `Book: ${book.title}. Authored by ${book.author}. Highlights: ${highlights.length}`
    );
    console.log(highlights);
  }

  await browser.close();
})();
