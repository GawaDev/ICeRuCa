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
  await wide.locator('.leaflet-tile-loaded').first().waitFor({ timeout: 15_000 });
  await wide.screenshot({ path: fileURLToPath(new URL('../public/screenshots/wide-map.png', import.meta.url)) });

  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await narrow.goto(origin);
  await narrow.locator('.leaflet-tile-loaded').first().waitFor({ timeout: 15_000 });
  await narrow.screenshot({ path: fileURLToPath(new URL('../public/screenshots/narrow-map.png', import.meta.url)) });
} finally {
  await browser.close();
  server.kill();
}
