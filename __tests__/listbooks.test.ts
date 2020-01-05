import setPageContentFromFile from './util/setPageContentFromFile';
import { scrapeUserId } from '../src/lib/listbooks';

describe('Scrape logged in user id', () => {
  it('parse user id from navigation header links', async () => {
    await setPageContentFromFile('./__tests__/assets/fragment.header.html');

    const id = await scrapeUserId(page);

    expect(id).toBe('70559316');
  });
});
