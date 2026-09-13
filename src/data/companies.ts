import { IC_AREAS, type IcArea } from './icAreas';

export type Company = {
  id: string;
  name: string;
  type: 'rail' | 'bus' | 'mixed';
  region: string;
  n02Names?: string[];
  notes?: string[];
};

export const COMPANIES: Company[] = [
  ['jr-hokkaido', 'JR北海道', '北海道', ['北海道旅客鉄道']],
  ['jr-east', 'JR東日本', '東日本', ['東日本旅客鉄道']],
  ['jr-central', 'JR東海', '東海', ['東海旅客鉄道']],
  ['jr-west', 'JR西日本', '西日本', ['西日本旅客鉄道']],
  ['jr-shikoku', 'JR四国', '四国', ['四国旅客鉄道']],
  ['jr-kyushu', 'JR九州', '九州', ['九州旅客鉄道']],
  ['hapi-line', 'ハピラインふくい', '福井', ['ハピラインふくい']],
  ['ir-ishikawa', 'IRいしかわ鉄道', '石川', ['IRいしかわ鉄道']],
  ['ainokaze', 'あいの風とやま鉄道', '富山・石川', ['あいの風とやま鉄道']],
  ['yui-rail', '沖縄都市モノレール', '沖縄', ['沖縄都市モノレール']],
  ['pasmo-operators', 'PASMO事業者', '首都圏', []],
  ['manaca-operators', 'manaca事業者', '中京', []],
  ['pitapa-operators', 'PiTaPa事業者', '近畿', []],
  ['kanto-railway', '関東鉄道', '茨城', ['関東鉄道']],
  ['okayama-electric', '岡山電気軌道', '岡山', ['岡山電気軌道']],
  ['shizutetsu', '静岡鉄道', '静岡', ['静岡鉄道']],
  ['nishitetsu', '西日本鉄道ほか', '九州', ['西日本鉄道']],
  ['fukuoka-subway', '福岡市交通局', '福岡', ['福岡市']],
  ['sapporo-city', '札幌市交通局', '札幌', ['札幌市']],
  ['sendai-city', '仙台市交通局', '仙台', ['仙台市']],
  ['kotoden', '高松琴平電気鉄道', '香川', ['高松琴平電気鉄道']],
  ['niigata-kotsu', '新潟交通', '新潟', []],
  ['nagasaki-bus', '長崎自動車グループ', '長崎', []],
] .map(([id, name, region, n02Names]) => ({
  id: id as string,
  name: name as string,
  region: region as string,
  n02Names: n02Names as string[],
  type: 'rail' as const,
}));

export function getCompany(id: string) {
  return COMPANIES.find((company) => company.id === id);
}

export function areasOfCompany(companyId: string): IcArea[] {
  return IC_AREAS.filter((icArea) => icArea.companyId === companyId);
}

export function companyByN02(name: string) {
  return COMPANIES.find((company) => company.n02Names?.includes(name));
}

export function searchCompanies(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return COMPANIES;
  return COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(normalized) ||
    company.region.toLowerCase().includes(normalized) ||
    areasOfCompany(company.id).some((icArea) => icArea.name.toLowerCase().includes(normalized)),
  );
}
