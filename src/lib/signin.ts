import { Browser, Page } from 'puppeteer';

export default async (
  browser: Browser,
  username: string,
  password: string,
): Promise<Page> => {
  const page = await browser.newPage();
  await page.goto('https://www.goodreads.com/user/sign_in');
  await page.type('#user_email', username);
  await page.type('#user_password', password);

  await Promise.all([
    await page.click('[name="next"]'),
    await page.waitForSelector('nav.siteHeader__primaryNavInline'),
  ]);

  return page;
};
