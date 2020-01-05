import { Browser, Page } from 'puppeteer';

import { Book } from '../interfaces/Book';
import { Highlight } from '../interfaces/Highlight';

export async function scrapePaginationUrls(
  page: Page,
  baseUrl: string,
): Promise<Array<string>> {
  const paginationIndices = await page.$$eval(
    '.readingNotesPagination a:not([class])',
    anchors => anchors.map((anchor: HTMLElement) => anchor.innerText),
  );

  if (paginationIndices.length === 0) {
    return [];
  }

  const lastPageIndex: number = parseInt(paginationIndices.slice(-1)[0], 10) || 1;

  return Array.from(
    { length: lastPageIndex - 1 },
    (_x, i) => `${baseUrl}&page=${i + 2}`,
  );
}

export async function scrapeHighlightsFromPageUrl(
  page: Page,
): Promise<Array<Highlight>> {
  const highlights = await page.$$eval('.js-readingNote', highlightsEl =>
    highlightsEl.map(highlightEl => {
      try {
        return {
          annotationId: highlightEl.getAttribute('data-annotation-pair-id'),
          bookId: highlightEl.getAttribute('data-book-id'),
          hasNote: String(highlightEl.getAttribute('data-has-note')) == 'true',
          locationPercentage: (highlightEl.querySelector(
            '.noteHighlightContainer__location',
          ) as HTMLElement).innerText,
          text: (highlightEl.querySelector(
            '.noteHighlightTextContainer__highlightText span:last-of-type',
          ) as HTMLElement).innerText,
        };
      } catch (ex) {
        // TODO: Could not parse a note. Need to communicate this fact somehow in logging or metrics
        return null;
      }
    }),
  );
  return highlights.filter(n => n);
}

export default async function getHighlightsForBook(
  browser: Browser,
  book: Book,
): Promise<Array<Highlight>> {
  const page = await browser.newPage();
  await page.goto(book.bookUrl);

  const nextPages = await scrapePaginationUrls(page, book.bookUrl);
  let highlights = await scrapeHighlightsFromPageUrl(page);

  for (const pageUrl of nextPages) {
    await page.goto(pageUrl);
    await page.waitForSelector('#allHighlightsAndNotes');

    const nextHighlights = await scrapeHighlightsFromPageUrl(page);
    highlights = highlights.concat(nextHighlights);
  }

  return highlights;
}
