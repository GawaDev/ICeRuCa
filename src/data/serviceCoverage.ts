export type ServiceCoverage = {
  id: string;
  name: string;
  kind: 'points' | 'pass' | 'booking' | 'charge' | 'other';
  cardIds: string[];
  icAreaIds: string[];
  companyIds: string[];
  summary: string;
  notes?: string[];
};

export const SERVICE_COVERAGES: ServiceCoverage[] = [
  {
    id: 'jre-point', name: 'JRE POINT', kind: 'points', cardIds: ['suica'],
    icAreaIds: ['suica-shutoken', 'suica-sendai', 'suica-niigata', 'suica-morioka', 'suica-akita', 'suica-aomori'],
    companyIds: ['jr-east'], summary: 'JR東日本系Suica利用・加盟店など（登録・条件あり）',
    notes: ['エリアまたぎ自体はSuica規則に従う'],
  },
  {
    id: 'wester-point', name: 'WESTERポイント', kind: 'points', cardIds: ['icoca'],
    icAreaIds: ['icoca-jr-west', 'icoca-ir', 'icoca-ainokaze', 'icoca-hapi', 'icoca-shikoku'],
    companyIds: ['jr-west', 'jr-shikoku', 'hapi-line', 'ainokaze', 'ir-ishikawa'],
    summary: 'ICOCA電子マネー利用などで付与（利用登録が必要な場合あり）',
  },
  {
    id: 'sugoca-point', name: 'JRキューポ', kind: 'points', cardIds: ['sugoca'],
    icAreaIds: ['sugoca-north', 'sugoca-kagoshima', 'sugoca-miyazaki'],
    companyIds: ['jr-kyushu'], summary: 'SUGOCA関連のポイント（対象駅・チャージ条件あり）',
  },
  {
    id: 'toica-point', name: 'TOICAポイント', kind: 'points', cardIds: ['toica'],
    icAreaIds: ['toica-tokai'], companyIds: ['jr-central'],
    summary: 'TOICAエリアでの利用に連動（条件は公式）',
  },
  {
    id: 'pasmo-point', name: 'PASMOポイント系', kind: 'points', cardIds: ['pasmo'],
    icAreaIds: ['pasmo-shutoken'], companyIds: ['pasmo-operators'],
    summary: '事業者・カード種別により異なる',
  },
  {
    id: 'ex-ic', name: 'EX-IC・スマートEX', kind: 'booking',
    cardIds: ['suica', 'pasmo', 'toica', 'manaca', 'icoca', 'sugoca', 'kitaca', 'nimoca', 'hayakaken', 'pitapa'],
    icAreaIds: [], companyIds: ['jr-east', 'jr-central', 'jr-west', 'jr-kyushu'],
    summary: '新幹線ネット予約と交通系ICの連携（在来線エリアまたぎとは別制度）',
  },
  {
    id: 'icoca-pass', name: 'ICOCA定期券', kind: 'pass', cardIds: ['icoca'],
    icAreaIds: ['icoca-jr-west', 'icoca-ir', 'icoca-ainokaze', 'icoca-shikoku'],
    companyIds: ['jr-west', 'jr-shikoku', 'ainokaze', 'ir-ishikawa'],
    summary: '二重線区間や一部エリアでは定期サービスがない場合あり',
    notes: ['200km制限はSF利用の話。定期は別条件'],
  },
  {
    id: 'suica-pass', name: 'Suica定期券', kind: 'pass', cardIds: ['suica'],
    icAreaIds: ['suica-shutoken', 'suica-sendai', 'suica-niigata', 'suica-morioka', 'suica-akita', 'suica-aomori'],
    companyIds: ['jr-east'],
    summary: 'Suica一部対応駅を含む区間の定期は発売しない場合あり',
  },
];

export const coveragesForCard = (id: string) =>
  SERVICE_COVERAGES.filter((coverage) => coverage.cardIds.includes(id));
export const coveragesForIcArea = (id: string) =>
  SERVICE_COVERAGES.filter((coverage) => coverage.icAreaIds.length === 0 || coverage.icAreaIds.includes(id));
export const coveragesForCompany = (id: string) =>
  SERVICE_COVERAGES.filter((coverage) => coverage.companyIds.includes(id));
