import { expect, test } from '@playwright/test';

test('モバイルで5つの確認方法と結果へ到達できる', async ({ page }) => {
  await page.goto('/');
  const views = page.getByRole('radiogroup', { name: '条件と確認結果の切替' });
  await expect(views).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  for (const label of ['カード', '会社', '駅間検索', '乗換改札', 'サービス']) {
    await page.getByText(label, { exact: true }).first().click();
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  await page.getByText('カード', { exact: true }).first().click();
  await page.getByRole('button', { name: '確認結果を見る' }).click();
  const mapBox = await page.getByRole('application', { name: 'IC利用エリアの地図' }).boundingBox();
  expect(mapBox?.width).toBeGreaterThanOrEqual(380);
  await expect(page.getByText('Suica・PASMOエリア')).toBeVisible();
  await expect(page.locator('.mantine-Badge-label').filter({ hasText: '利用できます' })).toBeVisible();

  await page.getByRole('button', { name: 'ヘルプ' }).click();
  await expect(page.getByRole('complementary', { name: 'ヘルプ目次' })).toBeVisible();
  await page.getByRole('button', { name: '閉じる' }).click();
});

test('PWAをオフラインで再起動できる', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle(/ICeRuCa/);
  await expect(page.getByText('確認方法')).toBeVisible();
});
