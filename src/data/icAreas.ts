export type IcArea = {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  brandId: string;
  sfZoneId?: string;
  region: string;
  rules: {
    noCrossArea: boolean;
    noViaOutside: boolean;
    maxFareKm?: number;
    maxFareKmNote?: string;
  };
  bridges?: { toAreaId: string; note: string }[];
  notes?: string[];
};

const deny = { noCrossArea: true, noViaOutside: true };
const area = (
  id: string,
  companyId: string,
  companyName: string,
  name: string,
  brandId: string,
  region: string,
  extra: Partial<IcArea> = {},
): IcArea => ({ id, companyId, companyName, name, brandId, region, rules: deny, ...extra });

export const IC_AREAS: IcArea[] = [
  area('kitaca-sapporo', 'jr-hokkaido', 'JR北海道', 'Kitaca 札幌・旭川エリア', 'kitaca', '北海道'),
  area('kitaca-hakodate', 'jr-hokkaido', 'JR北海道', 'Kitaca 函館エリア', 'kitaca', '北海道'),
  area('suica-shutoken', 'jr-east', 'JR東日本', 'Suica 首都圏エリア', 'suica', '首都圏', { sfZoneId: 'shutoken' }),
  area('suica-sendai', 'jr-east', 'JR東日本', 'Suica 仙台エリア', 'suica', '東北'),
  area('suica-niigata', 'jr-east', 'JR東日本', 'Suica 新潟エリア', 'suica', '新潟'),
  area('suica-morioka', 'jr-east', 'JR東日本', 'Suica 盛岡エリア', 'suica', '東北'),
  area('suica-akita', 'jr-east', 'JR東日本', 'Suica 秋田エリア', 'suica', '東北'),
  area('suica-aomori', 'jr-east', 'JR東日本', 'Suica 青森エリア', 'suica', '東北'),
  area('suica-okinawa', 'yui-rail', '沖縄都市モノレール', 'Suica 沖縄エリア', 'suica', '沖縄'),
  area('pasmo-shutoken', 'pasmo-operators', 'PASMO事業者', 'PASMOエリア', 'pasmo', '首都圏', { sfZoneId: 'shutoken' }),
  area('kanto-railway', 'kanto-railway', '関東鉄道', '常総線・竜ヶ崎線', 'kanto-railway', '茨城', { sfZoneId: 'shutoken' }),
  area('toica-tokai', 'jr-central', 'JR東海', 'TOICAエリア', 'toica', '東海', { sfZoneId: 'tokai' }),
  area('manaca-chukyo', 'manaca-operators', 'manaca事業者', 'manacaエリア', 'manaca', '中京', { sfZoneId: 'tokai' }),
  area('icoca-jr-west', 'jr-west', 'JR西日本', 'ICOCAエリア', 'icoca', '近畿・中国・北陸', {
    rules: { noCrossArea: false, noViaOutside: true, maxFareKm: 200, maxFareKmNote: '営業キロ200km超は原則不可。4類型の例外があります' },
    bridges: [
      { toAreaId: 'icoca-shikoku', note: '児島接続などJR四国規則の範囲で利用できます' },
      { toAreaId: 'icoca-ir', note: 'IRいしかわ鉄道との公式利用範囲内で利用できます' },
      { toAreaId: 'icoca-ainokaze', note: 'あいの風とやま鉄道との公式利用範囲内で利用できます' },
      { toAreaId: 'icoca-hapi', note: 'ハピライン・JR西日本エリア図の範囲で利用できます' },
      { toAreaId: 'pitapa-kinki', note: '近畿のPiTaPaエリアとの相互利用範囲です' },
    ],
    notes: ['2018年9月15日からJR西日本管内のICOCAエリアは一体化'],
  }),
  area('icoca-ir', 'ir-ishikawa', 'IRいしかわ鉄道', 'IRいしかわ鉄道ICOCAエリア', 'icoca', '石川', {
    sfZoneId: 'hokuriku-3sec',
    rules: { ...deny, maxFareKm: 200 },
    bridges: [
      { toAreaId: 'icoca-jr-west', note: 'JR西日本との公式利用範囲内で利用できます' },
      { toAreaId: 'icoca-hapi', note: 'ハピライン・IRエリア図の範囲で利用できます' },
    ],
  }),
  area('icoca-ainokaze', 'ainokaze', 'あいの風とやま鉄道', 'あいの風とやま鉄道ICOCAエリア', 'icoca', '富山・石川', {
    sfZoneId: 'hokuriku-3sec',
    rules: { ...deny, maxFareKm: 200 },
    bridges: [{ toAreaId: 'icoca-jr-west', note: 'JR西日本との公式利用範囲内で利用できます' }],
    notes: ['ハピラインふくいとの直接のエリアまたぎはできません'],
  }),
  area('icoca-hapi', 'hapi-line', 'ハピラインふくい', 'ハピラインふくいICOCAエリア', 'icoca', '福井', {
    bridges: [
      { toAreaId: 'icoca-jr-west', note: 'ハピライン・JR西日本エリア図の範囲で利用できます' },
      { toAreaId: 'icoca-ir', note: 'ハピライン・IRエリア図の範囲で利用できます' },
    ],
  }),
  area('icoca-shikoku', 'jr-shikoku', 'JR四国', 'ICOCA 四国エリア', 'icoca', '四国', {
    rules: { ...deny, maxFareKm: 200 },
    bridges: [{ toAreaId: 'icoca-jr-west', note: '児島接続など別表の範囲で利用できます' }],
  }),
  area('pitapa-kinki', 'pitapa-operators', 'PiTaPa事業者', '近畿PiTaPaエリア', 'pitapa', '近畿・近鉄名古屋線', {
    bridges: [{ toAreaId: 'icoca-jr-west', note: '近畿のICOCA相互利用範囲です' }],
  }),
  area('pitapa-okayama', 'okayama-electric', '岡山電気軌道', '岡山電軌PiTaPaエリア', 'pitapa', '岡山'),
  area('pitapa-shizuoka', 'shizutetsu', '静岡鉄道', '静岡鉄道PiTaPaエリア', 'pitapa', '静岡'),
  area('sugoca-north', 'jr-kyushu', 'JR九州', 'SUGOCA 北部九州エリア', 'sugoca', '九州', { sfZoneId: 'kyushu-north' }),
  area('sugoca-kagoshima', 'jr-kyushu', 'JR九州', 'SUGOCA 鹿児島エリア', 'sugoca', '九州'),
  area('sugoca-miyazaki', 'jr-kyushu', 'JR九州', 'SUGOCA 宮崎エリア', 'sugoca', '九州'),
  area('nimoca-fukuoka', 'nishitetsu', '西日本鉄道ほか', 'nimocaエリア', 'nimoca', '九州ほか', { sfZoneId: 'kyushu-north' }),
  area('hayakaken-fukuoka', 'fukuoka-subway', '福岡市交通局', 'はやかけんエリア', 'hayakaken', '福岡', { sfZoneId: 'kyushu-north' }),
  area('sapica-sapporo', 'sapporo-city', '札幌市交通局', 'SAPICAエリア', 'sapica', '札幌'),
  area('icsca-sendai', 'sendai-city', '仙台市交通局', 'icscaエリア', 'icsca', '仙台'),
  area('iruca-kotoden', 'kotoden', '高松琴平電気鉄道', 'IruCaエリア', 'iruca', '香川'),
  area('ryuto-niigata', 'niigata-kotsu', '新潟交通', 'りゅーとエリア', 'ryuto', '新潟'),
  area('nitas-nagasaki', 'nagasaki-bus', '長崎自動車グループ', 'エヌタスエリア', 'nitas', '長崎'),
];

export function getIcArea(id: string) {
  return IC_AREAS.find((candidate) => candidate.id === id);
}

export function displayIcArea(value: IcArea | string) {
  if (value === 'none' || value === '') return 'ICエリア外・未対応';
  if (value === 'shinkansen') return '新幹線（在来線ICのエリア判定外）';
  const found = typeof value === 'string' ? getIcArea(value) : value;
  return found ? `${found.companyName} ${found.name}` : String(value);
}

export function displayIcAreas(ids: string[]) {
  return [...new Set(ids.filter(Boolean))].map(displayIcArea).join('、');
}

export function icAreasForCompany(companyId: string) {
  return IC_AREAS.filter((candidate) => candidate.companyId === companyId);
}

export function icAreasForBrand(brandId: string) {
  return IC_AREAS.filter((candidate) => candidate.brandId === brandId);
}

export function sameIcArea(a: string, b: string) {
  return a === b;
}

export function sameSfZone(a: string, b: string) {
  const left = getIcArea(a)?.sfZoneId;
  return Boolean(left && left === getIcArea(b)?.sfZoneId);
}

export function canBridge(a: string, b: string) {
  const direct = getIcArea(a)?.bridges?.find((bridge) => bridge.toAreaId === b);
  return direct ?? getIcArea(b)?.bridges?.find((bridge) => bridge.toAreaId === a) ?? null;
}

const labels: Record<string, string> = {
  shutoken: '首都圏（Suica首都圏エリアとPASMOエリア）',
  tokai: '中京圏（TOICAエリアとmanacaエリア）',
  'kyushu-north': '北部九州（SUGOCA・nimoca・はやかけん）',
  'hokuriku-3sec': 'あいの風とやま鉄道・IRいしかわ鉄道',
};

export function sfZoneLabel(id: string) {
  return labels[id] ?? id;
}
