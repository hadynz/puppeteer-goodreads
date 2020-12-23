import { Browser, Page } from 'puppeteer';

type SignInReturn = {
  page: Page;
  success: boolean;
};

export default async function signin(
  browser: Browser,
  username: string,
  password: string,
): Promise<SignInReturn> {
  const page = await browser.newPage();
  await page.goto('https://www.goodreads.com/user/sign_in');
  await page.type('#user_email', username);
  await page.type('#user_password', password);

  await page.click('[name="next"]');

  const loggedInPromise = page
    .waitForSelector('nav.siteHeader__primaryNavInline')
    .catch()
    .then(() => true);

  const loginErrorPromise = page
    .waitForSelector('.gr-flashMessage--error')
    .catch()
    .then(() => false);

  const success = await Promise.race([loggedInPromise, loginErrorPromise]);

  return {
    page,
    success,
  };
}
