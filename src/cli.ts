import { PuppeteerGoodreads } from '.';

(async (): Promise<void> => {
  const defaultOptions = {
    headless: false,
  };

  const goodreads = new PuppeteerGoodreads({ puppeteer: defaultOptions });
  const success = await goodreads.signin('username', 'password');
  console.log('Goodreads login successful', success);

  const books = await goodreads.getMyBooks();
  console.log(books);

  const highlights = await goodreads.getBookHighlights(books[5]);
  console.log(highlights);

  await goodreads.close();
})();
