const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("dotenv").config();

const Scraper = require("./scrapers/highlights");

const loginToGoodreads = async (browser, email, password) => {
  const page = await browser.newPage();
  await page.goto("https://www.goodreads.com/user/sign_in");
  await page.type("#user_email", email);
  await page.type("#user_password", password);
  await page.click('[name="next"]');
  await page.waitForSelector("nav.siteHeader__primaryNavInline");

  return page;
};

const scrapeListOfBooks = async page => {
  const userId = await Scraper(page).scrapeUserId();
  const url = `https://www.goodreads.com/notes/${userId}/load_more`;

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

const scrapeAllHighlightsForBook = async (page, book) => {
  await page.goto(book.bookUrl);

  const nextPages = await Scraper(page).scrapePaginationUrls(book.bookUrl);
  let highlights = await Scraper(page).scrapeHighlightsFromPageUrl();

  for (const pageUrl of nextPages) {
    await page.goto(pageUrl);
    await page.waitForSelector("#allHighlightsAndNotes");

    const nextHighlights = await Scraper(page).scrapeHighlightsFromPageUrl();
    highlights = highlights.concat(nextHighlights);
  }

  return highlights;
};

(async () => {
  const {
    GOODREADS_LOGIN: username,
    GOODREADS_PASSWORD: password
  } = process.env;

  console.log(`Scraping Kindle highlights for Goodreads user "${username}"`);

  const csvWriter = createCsvWriter({
    path: "highlights.csv",
    header: [
      { id: "asin", title: "Amazon ID" },
      { id: "title", title: "Book" },
      { id: "author", title: "Author" },
      { id: "annotationId", title: "Annotation ID" },
      { id: "highlight", title: "Highlight" }
    ]
  });

  const browser = await puppeteer.launch({
    // headless: false
    // slowMo: 250
  });

  const page = await loginToGoodreads(browser, username, password);
  const books = await scrapeListOfBooks(page);

  for (const book of books) {
    const newPage = await browser.newPage();

    console.log(`Scraping "${book.title}" by "${book.author}"`);

    const highlights = await scrapeAllHighlightsForBook(newPage, book);

    await csvWriter.writeRecords(
      highlights.map(highlight => ({
        asin: book.asin,
        title: book.title,
        author: book.author,
        annotationId: highlight.annotationId,
        highlight: highlight.text
      }))
    );
  }

  await browser.close();

  console.log("Completed scraping all Kindle highlights");
})();
