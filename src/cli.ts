import PuppeteerGoodreads from '.';

(async (): Promise<void> => {
  const defaultOptions = {
    headless: false,
  };

  const goodreads = new PuppeteerGoodreads({ puppeteer: defaultOptions });
  await goodreads.signin('hadyos@gmail.com', '@0wt!*%1^uk2@IMu');

  const books = await goodreads.getMyBooks();
  console.log(books);

  const highlights = await goodreads.getBookHighlights(books[5]);
  console.log(highlights);

  await goodreads.close();
})();
