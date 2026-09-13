import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const port = 8792;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
for (let attempt = 0; attempt < 60; attempt += 1) {
  try {
    if ((await fetch(`${origin}/health`)).ok) break;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

const browser = await chromium.launch();
try {
  const wide = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await wide.goto(origin);
  await wide.screenshot({ path: fileURLToPath(new URL('../public/screenshots/wide.png', import.meta.url)) });

  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await narrow.goto(origin);
  await narrow.getByRole('radiogroup', { name: '条件、地図、確認結果の切替' }).getByText('地図・一覧').click();
  await narrow.screenshot({ path: fileURLToPath(new URL('../public/screenshots/narrow.png', import.meta.url)) });
} finally {
  await browser.close();
  server.kill();
}
