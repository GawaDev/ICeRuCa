import { expect, test } from '@playwright/test';

test('モバイルで5つの確認方法と結果へ到達できる', async ({ page }) => {
  await page.goto('/');
  const views = page.getByRole('radiogroup', { name: '確認する視点' });
  await expect(views).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  for (const label of ['カード', '会社', '駅間検索', '乗換改札', 'サービス']) {
    await views.getByText(label, { exact: true }).click();
    await expect(views.getByRole('radio', { name: label })).toBeChecked({ timeout: 15_000 });
  }

  await views.getByText('カード', { exact: true }).click();
  const mapBox = await page.getByRole('application', { name: 'IC利用エリアの地図' }).boundingBox();
  expect(mapBox?.width).toBeGreaterThanOrEqual(350);
  await expect(page.locator('.networkMapHost')).toHaveAttribute('data-state', 'ready', { timeout: 15_000 });

  await page.getByRole('button', { name: 'ヘルプ' }).click();
  await expect(page.getByRole('complementary', { name: 'ヘルプ目次' })).toBeVisible();
  await page.getByRole('button', { name: '閉じる' }).click();
});

test('全国駅から駅間条件と経由路線を確認できる', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radiogroup', { name: '確認する視点' }).getByText('駅間検索', { exact: true }).click();
  await page.getByRole('combobox', { name: '出発駅' }).fill('東京（東海道線 東日本旅客鉄道）');
  await page.getByRole('option', { name: '東京（東海道線 東日本旅客鉄道）' }).click();
  await page.getByRole('combobox', { name: '到着駅' }).fill('名古屋（東海道線 東海旅客鉄道）');
  await page.getByRole('option', { name: '名古屋（東海道線 東海旅客鉄道）' }).click();
  await page.getByRole('button', { name: '確認する' }).click();

  await expect(page.getByText('連続利用できない見込みです')).toBeVisible();
  for (const label of ['発駅IC', '着駅IC', 'エリア', '営業キロ', 'ラッチ接続', '経由路線']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  const stationCount = await page.evaluate(async () => {
    const data = await fetch('/data/station-index.json').then((response) => response.json());
    return data.stations.length;
  });
  expect(stationCount).toBeGreaterThan(10_000);
});

test('PWAをオフラインで再起動できる', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle(/ICeRuCa/);
  await expect(page.getByRole('radiogroup', { name: '確認する視点' })).toBeVisible();
});
