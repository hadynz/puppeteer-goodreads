import { launch, Browser, Page } from 'puppeteer';

import { ApiOptions } from './interfaces/ApiOptions';
import { User } from './interfaces/User';
import { Book } from './interfaces/Book';
import { Highlight } from './interfaces/Highlight';
import getHighlightsForBook from './lib/highlights';
import listbooks from './lib/listbooks';
import signin from './lib/signin';

class PuppeteerGoodreads {
  private _opts: ApiOptions;
  private _browser: Browser;
  private _user: User;
  private _landingPage: Page;

  constructor(opts = {}) {
    this._opts = opts;
  }

  private get isAuthenticated(): boolean {
    return !!this._user;
  }

  public get user(): User {
    return this._user;
  }

  private async browser(): Promise<Browser> {
    if (!this._browser) {
      this._browser = await launch(this._opts.puppeteer);
    }

    return this._browser;
  }

  public async signin(username: string, password: string): Promise<boolean> {
    if (this.isAuthenticated) {
      throw new Error('"signin" requires no authentication');
    }

    const browser = await this.browser();

    const { page, success } = await signin(browser, username, password);

    if (success) {
      this._landingPage = page;

      this._user = {
        username: username,
        password: password,
      };
    }

    return success;
  }

  public async getMyBooks(): Promise<Array<Book>> {
    if (!this.isAuthenticated) {
      throw new Error(
        'User must first be logged-in. Use the "signin" function first.',
      );
    }

    return await listbooks(this._landingPage);
  }

  public async getBookHighlights(book: Book): Promise<Array<Highlight>> {
    if (!this.isAuthenticated) {
      throw new Error(
        'User must first be logged-in. Use the "signin" function first.',
      );
    }

    const browser = await this.browser();

    return await getHighlightsForBook(browser, book);
  }

  public async close(): Promise<void> {
    const browser = await this.browser();
    await browser.close();

    this._browser = null;
    this._user = null;
  }
}

export { PuppeteerGoodreads, ApiOptions, Book, Highlight };
