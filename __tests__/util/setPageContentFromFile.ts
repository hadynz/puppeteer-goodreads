import * as fs from 'fs';

export default async function setPageContentFromFile(
  fileName: string,
): Promise<void> {
  const html = fs.readFileSync(fileName, 'utf8');
  await page.setContent(html, {
    waitUntil: 'networkidle0',
  });
}
