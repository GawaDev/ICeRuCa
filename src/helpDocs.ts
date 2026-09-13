export type HelpDocGroup = 'マニュアル' | '仕様書' | 'ライセンス';
export type HelpDoc = { id: string; title: string; group: HelpDocGroup };

const markdown = import.meta.glob('../docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const helpDocs: HelpDoc[] = [
  { id: 'manual/01-intro.md', title: 'はじめに', group: 'マニュアル' },
  { id: 'manual/02-card.md', title: 'カードから確認する', group: 'マニュアル' },
  { id: 'manual/03-journey.md', title: '駅間と乗換を確認する', group: 'マニュアル' },
  { id: 'manual/04-services.md', title: '定期券・新幹線・ポイント', group: 'マニュアル' },
  { id: 'manual/05-troubleshooting.md', title: '困ったときは', group: 'マニュアル' },
  { id: 'manual/06-about.md', title: 'ICeRuCaについて', group: 'マニュアル' },
  { id: 'spec/01-scope.md', title: '対応範囲と確認基準', group: '仕様書' },
  { id: 'spec/02-data.md', title: 'データと更新', group: '仕様書' },
  { id: 'spec/03-security.md', title: 'セキュリティとプライバシー', group: '仕様書' },
  { id: 'license/01-mit.md', title: 'MIT License', group: 'ライセンス' },
  { id: 'license/02-third-party.md', title: '第三者ライセンス', group: 'ライセンス' },
];

export function getHelpMarkdown(id: string) {
  const entry = Object.entries(markdown).find(([path]) => path.endsWith(`/docs/${id}`));
  return entry?.[1] ?? '# 文書を読み込めませんでした';
}
