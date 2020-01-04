const puppeteer = require("puppeteer");

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

  console.log(
    `Book: ${book.title}. Authored by ${book.author}. Highlights: ${highlights.length}\n`,
    highlights
  );
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false
    // slowMo: 250
  });

  const page = await loginToGoodreads(
    browser,
    "hadyos@gmail.com",
    "@0wt!*%1^uk2@IMu"
  );

  const books = await scrapeListOfBooks(page);

  for (let i = 4; i < 6; i++) {
    const book = books[i];

    let newPage = await browser.newPage();
    await scrapeAllHighlightsForBook(newPage, book);
  }

  await browser.close();
})();
