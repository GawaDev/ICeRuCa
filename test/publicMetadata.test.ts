import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import packageJson from '../package.json';
import { helpDocs, getHelpMarkdown } from '../src/helpDocs';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('公開構成', () => {
  it('製品メタデータを一致させる', () => {
    expect(packageJson.name).toBe('iceruca');
    expect(packageJson.license).toBe('MIT');
    expect(packageJson.repository.url).toContain('GawaDev/ICeRuCa');
    expect(read('index.html')).toContain('https://iceruca.onrender.com/');
  });

  it('PWAとファビコンを構成する', () => {
    expect(read('index.html')).toContain('/favicon.ico?v=1');
    expect(read('vite.config.ts')).toContain('pwa-maskable-512.png');
    expect(readFileSync(resolve(root, 'public/favicon.ico')).byteLength).toBeGreaterThan(0);
  });

  it('Render Web Serviceとヘルスチェックを構成する', () => {
    expect(read('render.yaml')).toContain('runtime: node');
    expect(read('render.yaml')).toContain('healthCheckPath: /health');
    expect(read('server.mjs')).toContain("url.pathname === '/health'");
  });

  it('すべてのヘルプ文書を同梱する', () => {
    expect(helpDocs.length).toBeGreaterThanOrEqual(10);
    expect(helpDocs.every((doc) => getHelpMarkdown(doc.id).startsWith('#'))).toBe(true);
  });
});
