<p>
  <a href="https://twitter.com/intent/follow?screen_name=hadynz"><img align="right" src="https://img.shields.io/twitter/follow/hadynz.svg?style=social&label=Follow%20@hadynz" alt="Follow on Twitter"></a>
</p>

# puppeteer-goodreads

Scrapes private Kindle highlights for a Goodreads user using automation by headless chrome.

This module was built using the excellent [node-typescript-boilerplate](node-typescript-boilerplate).

## Install

```bash
npm install --save puppeteer-goodreads
```

## Usage

This example signs into a [Goodreads](https://goodreads.com) account.

```js
const PuppeteerGoodreads = require('puppeteer-goodreads')

const defaultOptions = { headless: false, /* ... */ };

const goodreads = new PuppeteerGoodreads({ puppeteer: defaultOptions });

/* Logs in to Goodreads with credentials using a headless chrome brwoser session */
await goodreads.signin('xxx', 'xxx');

/* Returns list of books with Kindle highlights for currently logged in Goodreads user */
const books = await goodreads.getMyBooks();

/* Returns all Kindle highlights for a given book for logged in Goodreads user */
const highlights = await goodreads.getBookHighlights(book);

await goodreads.close();
```

## License

MIT © [Hady Osman](https://github.com/hadynz)
