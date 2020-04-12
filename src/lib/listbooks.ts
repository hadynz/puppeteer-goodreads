import { Page } from 'puppeteer';

import { Book } from '../interfaces/Book';
import { GoodreadsBooksResponse } from '../interfaces/GoodreadsResponses';

export async function scrapeUserId(page: Page): Promise<string> {
  const topLevelMenuLinks = await page.$$eval(
    'nav.siteHeader__primaryNavInline a.siteHeader__topLevelLink',
    anchors => anchors.map(anchor => anchor.getAttribute('href')),
  );

  return topLevelMenuLinks[1].split('/').slice(-1)[0];
}

export default async function listbooks(page: Page): Promise<Array<Book>> {
  const userId = await scrapeUserId(page);
  const url = `https://www.goodreads.com/notes/${userId}/load_more`;

  const [response] = await Promise.all([
    page.waitForResponse(url),
    page.goto(url),
  ]);

  const rawJson = (await response.json()) as GoodreadsBooksResponse;

  return rawJson.annotated_books_collection.map(book => ({
    asin: book.asin,
    title: book.title,
    author: book.authorName,
    imageUrl: book.imageUrl,
    bookUrl: book.readingNotesUrl,
  }));
}
