export type ResultStatus = 'available' | 'unavailable' | 'conditional' | 'unknown';
export type Purpose = 'fare' | 'pass' | 'emoney' | 'shinkansen' | 'points';
export type Medium = 'physical' | 'mobile' | 'child';

export type Source = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  checkedAt: string;
  validFrom?: string;
};

export type Card = {
  id: string;
  name: string;
  issuer: string;
  category: 'national' | 'regional' | 'linked';
  media: Medium[];
  homeAreaIds: string[];
  color: string;
  sourceId: string;
};

export type Area = {
  id: string;
  name: string;
  operatorId: string;
  region: string;
  acceptedCardIds: string[];
  sfZoneId?: string;
  note: string;
  sourceId: string;
};

export type Operator = {
  id: string;
  name: string;
  areaIds: string[];
  modes: Array<'rail' | 'subway' | 'tram' | 'bus' | 'monorail'>;
};

export type Station = {
  id: string;
  name: string;
  operatorId: string;
  line: string;
  areaId: string | null;
  position: [number, number];
  note?: string;
};

export type Service = {
  id: string;
  name: string;
  purpose: Purpose;
  summary: string;
  conditions: string[];
  cardIds: string[];
  sourceId: string;
};

export type TransferGate = {
  id: string;
  station: string;
  title: string;
  steps: string[];
  note: string;
  sourceId: string;
};

export type CompatibilityResult = {
  status: ResultStatus;
  title: string;
  detail: string;
  source: Source;
};

export const sources: Source[] = [
  {
    id: 'mlit-mutual',
    title: '交通系ICカードの全国相互利用サービス',
    publisher: '国土交通省',
    url: 'https://www.mlit.go.jp/sogoseisaku/transport/content/001482607.pdf',
    checkedAt: '2026-09-14',
  },
  {
    id: 'pasmo-area',
    title: 'PASMOが使えるエリア',
    publisher: 'PASMO協議会',
    url: 'https://www.pasmo.co.jp/area/',
    checkedAt: '2026-09-14',
  },
  {
    id: 'toica-sharing',
    title: '全国相互利用サービス',
    publisher: 'JR東海',
    url: 'https://toica.jr-central.co.jp/howto/sharing/index.html',
    checkedAt: '2026-09-14',
  },
  {
    id: 'suica-regional',
    title: '地域連携ICカード',
    publisher: 'JR東日本',
    url: 'https://www.jreast.co.jp/suica/corporate/regional.html/',
    checkedAt: '2026-09-14',
  },
  {
    id: 'sapica',
    title: 'SAPICA利用時の注意',
    publisher: '札幌ICカード協議会',
    url: 'https://www.sapica.jp/about/attention.html',
    checkedAt: '2026-09-14',
  },
  {
    id: 'icsca',
    title: 'icscaとSuicaの相互利用',
    publisher: '仙台市交通局',
    url: 'https://www.kotsu.city.sendai.jp/icsca/icsca_sougo/',
    checkedAt: '2026-09-14',
  },
  {
    id: 'iruca',
    title: '全国交通系ICカード',
    publisher: '高松琴平電気鉄道',
    url: 'https://www.kotoden.co.jp/publichtm/iruca/10cards/index.html',
    checkedAt: '2026-09-14',
  },
  {
    id: 'okica',
    title: 'Suica等の利用案内',
    publisher: '沖縄都市モノレール',
    url: 'https://www.yui-rail.co.jp/ticketinfo-ticket/ticketinfo/suica/',
    checkedAt: '2026-09-14',
  },
  {
    id: 'smart-ex',
    title: '交通系ICカードでの乗車',
    publisher: 'スマートEX',
    url: 'https://smart-ex.jp/entraining/iccard/',
    checkedAt: '2026-09-14',
  },
  {
    id: 'e-ticket',
    title: '新幹線eチケットサービス',
    publisher: 'JR東日本',
    url: 'https://www.jreast.co.jp/e-ticket/',
    checkedAt: '2026-09-14',
  },
  {
    id: 'touch-go',
    title: 'タッチでGo!新幹線',
    publisher: 'JR東日本',
    url: 'https://www.jreast.co.jp/touchdego/',
    checkedAt: '2026-09-14',
  },
  {
    id: 'n02',
    title: '国土数値情報 鉄道データ N02-2025',
    publisher: '国土交通省',
    url: 'https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-2025.html',
    checkedAt: '2026-09-14',
    validFrom: '2025-12-31',
  },
];

const nationalCardNames = [
  ['kitaca', 'Kitaca', 'JR北海道', '#5eaa46'],
  ['suica', 'Suica', 'JR東日本', '#68bd45'],
  ['pasmo', 'PASMO', 'PASMO協議会', '#e5457d'],
  ['toica', 'TOICA', 'JR東海', '#55a7db'],
  ['manaca', 'manaca', '名古屋交通開発機構ほか', '#f3b23c'],
  ['icoca', 'ICOCA', 'JR西日本', '#4d8ac8'],
  ['pitapa', 'PiTaPa', 'スルッとKANSAI', '#8f6cac'],
  ['sugoca', 'SUGOCA', 'JR九州', '#ef5348'],
  ['nimoca', 'nimoca', 'ニモカ', '#ee7444'],
  ['hayakaken', 'はやかけん', '福岡市交通局', '#143f80'],
] as const;

export const cards: Card[] = [
  ...nationalCardNames.map(([id, name, issuer, color]) => ({
    id,
    name,
    issuer,
    color,
    category: 'national' as const,
    media: id === 'suica' || id === 'pasmo' || id === 'icoca'
      ? ['physical', 'mobile', 'child'] as Medium[]
      : ['physical', 'child'] as Medium[],
    homeAreaIds: [id],
    sourceId: 'mlit-mutual',
  })),
  { id: 'sapica', name: 'SAPICA', issuer: '札幌ICカード協議会', category: 'regional', media: ['physical'], homeAreaIds: ['sapica'], color: '#6b3c8f', sourceId: 'sapica' },
  { id: 'icsca', name: 'icsca', issuer: '仙台市交通局', category: 'regional', media: ['physical'], homeAreaIds: ['icsca'], color: '#76a142', sourceId: 'icsca' },
  { id: 'iruca', name: 'IruCa', issuer: '高松琴平電気鉄道', category: 'regional', media: ['physical'], homeAreaIds: ['iruca'], color: '#ed7871', sourceId: 'iruca' },
  { id: 'ryuto', name: 'りゅーと', issuer: '新潟交通', category: 'regional', media: ['physical'], homeAreaIds: ['ryuto'], color: '#2b89a8', sourceId: 'pasmo-area' },
  { id: 'okica', name: 'OKICA', issuer: '沖縄ICカード', category: 'regional', media: ['physical'], homeAreaIds: ['okica-bus'], color: '#dc5145', sourceId: 'okica' },
  { id: 'totra', name: 'totra', issuer: '関東自動車ほか', category: 'linked', media: ['physical'], homeAreaIds: ['suica-shutoken'], color: '#287d55', sourceId: 'suica-regional' },
];

const nationalIds = nationalCardNames.map(([id]) => id);
const acceptsNational = [...nationalIds];

export const operators: Operator[] = [
  { id: 'jr-hokkaido', name: 'JR北海道', areaIds: ['kitaca'], modes: ['rail'] },
  { id: 'sapporo', name: '札幌市交通局', areaIds: ['sapica'], modes: ['subway', 'tram'] },
  { id: 'jr-east', name: 'JR東日本', areaIds: ['suica-shutoken', 'suica-sendai'], modes: ['rail'] },
  { id: 'pasmo', name: 'PASMO加盟事業者', areaIds: ['pasmo'], modes: ['rail', 'subway', 'bus'] },
  { id: 'sendai', name: '仙台市交通局', areaIds: ['icsca'], modes: ['subway', 'bus'] },
  { id: 'jr-central', name: 'JR東海', areaIds: ['toica'], modes: ['rail'] },
  { id: 'nagoya', name: 'manaca加盟事業者', areaIds: ['manaca'], modes: ['rail', 'subway', 'bus'] },
  { id: 'jr-west', name: 'JR西日本', areaIds: ['icoca'], modes: ['rail'] },
  { id: 'pitapa', name: 'PiTaPa加盟事業者', areaIds: ['pitapa'], modes: ['rail', 'subway', 'bus'] },
  { id: 'jr-kyushu', name: 'JR九州', areaIds: ['sugoca'], modes: ['rail'] },
  { id: 'nishitetsu', name: '西日本鉄道', areaIds: ['nimoca'], modes: ['rail', 'bus'] },
  { id: 'fukuoka', name: '福岡市交通局', areaIds: ['hayakaken'], modes: ['subway'] },
  { id: 'kotoden', name: 'ことでん', areaIds: ['iruca'], modes: ['rail', 'bus'] },
  { id: 'yuirail', name: 'ゆいレール', areaIds: ['okica-yuirail'], modes: ['monorail'] },
  { id: 'niigata', name: '新潟交通', areaIds: ['ryuto'], modes: ['bus'] },
];

export const areas: Area[] = [
  { id: 'kitaca', name: 'Kitacaエリア', operatorId: 'jr-hokkaido', region: '北海道', acceptedCardIds: acceptsNational, note: '他のIC利用エリアとの間をまたぐSF乗車はできません。', sourceId: 'mlit-mutual' },
  { id: 'sapica', name: 'SAPICAエリア', operatorId: 'sapporo', region: '北海道', acceptedCardIds: [...acceptsNational, 'sapica'], note: '全国相互利用カードは利用できますが、SAPICAは他地域へ持ち出して利用できません。', sourceId: 'sapica' },
  { id: 'suica-shutoken', name: 'Suica首都圏エリア', operatorId: 'jr-east', region: '関東', acceptedCardIds: acceptsNational, sfZoneId: 'shutoken', note: 'PASMOエリアとの相互利用に対応します。', sourceId: 'pasmo-area' },
  { id: 'pasmo', name: 'PASMOエリア', operatorId: 'pasmo', region: '関東', acceptedCardIds: acceptsNational, sfZoneId: 'shutoken', note: '事業者や路線により利用範囲が異なります。', sourceId: 'pasmo-area' },
  { id: 'suica-sendai', name: 'Suica仙台エリア', operatorId: 'jr-east', region: '東北', acceptedCardIds: [...acceptsNational, 'icsca'], sfZoneId: 'sendai', note: 'icscaとの利用には対象範囲の条件があります。', sourceId: 'icsca' },
  { id: 'icsca', name: 'icscaエリア', operatorId: 'sendai', region: '東北', acceptedCardIds: [...acceptsNational, 'icsca'], sfZoneId: 'sendai', note: 'icscaは仙台Suicaエリアに限って相互利用できます。', sourceId: 'icsca' },
  { id: 'toica', name: 'TOICAエリア', operatorId: 'jr-central', region: '東海', acceptedCardIds: acceptsNational, note: '隣接するSuica・ICOCAエリアとの通常のSFまたぎ利用はできません。', sourceId: 'toica-sharing' },
  { id: 'manaca', name: 'manacaエリア', operatorId: 'nagoya', region: '東海', acceptedCardIds: acceptsNational, note: '利用範囲は各加盟事業者の案内を確認してください。', sourceId: 'mlit-mutual' },
  { id: 'icoca', name: 'ICOCAエリア', operatorId: 'jr-west', region: '西日本', acceptedCardIds: acceptsNational, note: '一部区間では営業キロや利用経路の条件があります。', sourceId: 'mlit-mutual' },
  { id: 'pitapa', name: 'PiTaPaエリア', operatorId: 'pitapa', region: '近畿ほか', acceptedCardIds: acceptsNational, note: '交通利用と電子マネー利用では対応が異なります。', sourceId: 'mlit-mutual' },
  { id: 'sugoca', name: 'SUGOCAエリア', operatorId: 'jr-kyushu', region: '九州', acceptedCardIds: acceptsNational, note: '新幹線は通常のSF乗車の対象外です。', sourceId: 'mlit-mutual' },
  { id: 'nimoca', name: 'nimocaエリア', operatorId: 'nishitetsu', region: '九州', acceptedCardIds: acceptsNational, note: '事業者ごとの対象路線を確認してください。', sourceId: 'mlit-mutual' },
  { id: 'hayakaken', name: 'はやかけんエリア', operatorId: 'fukuoka', region: '福岡', acceptedCardIds: acceptsNational, note: 'SUGOCAエリアとの連絡利用には経路条件があります。', sourceId: 'mlit-mutual' },
  { id: 'iruca', name: 'IruCaエリア', operatorId: 'kotoden', region: '香川', acceptedCardIds: [...acceptsNational, 'iruca'], note: '全国相互利用カードは受け入れますが、IruCaは他地域で利用できません。', sourceId: 'iruca' },
  { id: 'okica-yuirail', name: 'ゆいレール', operatorId: 'yuirail', region: '沖縄', acceptedCardIds: [...acceptsNational, 'okica'], note: '全国相互利用カードの受入れは、OKICA対象交通全体ではなくゆいレールです。', sourceId: 'okica' },
  { id: 'okica-bus', name: 'OKICAバスエリア', operatorId: 'yuirail', region: '沖縄', acceptedCardIds: ['okica'], note: '全国相互利用カードは一律には利用できません。', sourceId: 'okica' },
  { id: 'ryuto', name: 'りゅーとエリア', operatorId: 'niigata', region: '新潟', acceptedCardIds: [...acceptsNational, 'ryuto'], note: 'りゅーとのポイント・定期券・車内チャージは全国相互利用カードの対象外です。', sourceId: 'pasmo-area' },
];

export const stations: Station[] = [
  { id: 'tokyo', name: '東京', operatorId: 'jr-east', line: '東海道本線', areaId: 'suica-shutoken', position: [35.6812, 139.7671] },
  { id: 'shinjuku', name: '新宿', operatorId: 'jr-east', line: '山手線', areaId: 'suica-shutoken', position: [35.6909, 139.7003] },
  { id: 'sendai-jr', name: '仙台', operatorId: 'jr-east', line: '東北本線', areaId: 'suica-sendai', position: [38.2601, 140.882] },
  { id: 'sendai-subway', name: '仙台', operatorId: 'sendai', line: '南北線', areaId: 'icsca', position: [38.2604, 140.8818] },
  { id: 'atami-east', name: '熱海', operatorId: 'jr-east', line: '東海道本線', areaId: 'suica-shutoken', position: [35.1034, 139.0779], note: 'Suica首都圏エリアの境界駅です。' },
  { id: 'atami-central', name: '熱海', operatorId: 'jr-central', line: '東海道本線', areaId: 'toica', position: [35.1035, 139.078], note: 'TOICAエリア側として扱う列車・経路があります。' },
  { id: 'nagoya', name: '名古屋', operatorId: 'jr-central', line: '東海道本線', areaId: 'toica', position: [35.1709, 136.8815] },
  { id: 'maibara-central', name: '米原', operatorId: 'jr-central', line: '東海道本線', areaId: 'toica', position: [35.3147, 136.2902], note: 'TOICAエリアの境界駅です。' },
  { id: 'maibara-west', name: '米原', operatorId: 'jr-west', line: '東海道本線', areaId: 'icoca', position: [35.3148, 136.2903], note: 'ICOCAエリアの境界駅です。' },
  { id: 'osaka', name: '大阪', operatorId: 'jr-west', line: '東海道本線', areaId: 'icoca', position: [34.7025, 135.4959] },
  { id: 'hakata', name: '博多', operatorId: 'jr-kyushu', line: '鹿児島本線', areaId: 'sugoca', position: [33.5898, 130.4207] },
  { id: 'takamatsu', name: '高松築港', operatorId: 'kotoden', line: '琴平線', areaId: 'iruca', position: [34.3506, 134.0528] },
  { id: 'naha-airport', name: '那覇空港', operatorId: 'yuirail', line: '沖縄都市モノレール線', areaId: 'okica-yuirail', position: [26.2064, 127.6522] },
];

export const services: Service[] = [
  { id: 'smart-ex', name: 'スマートEX', purpose: 'shinkansen', summary: '予約した東海道・山陽・九州新幹線へ登録済みICカードで入場します。', conditions: ['会員登録と列車予約が必要です。', 'IC残高ではなく予約時に決済します。', '乗車用ICカードの指定が必要です。'], cardIds: nationalIds, sourceId: 'smart-ex' },
  { id: 'e-ticket', name: '新幹線eチケット', purpose: 'shinkansen', summary: '予約した対象新幹線へ紐付けたICカードで乗車します。', conditions: ['えきねっと等での予約が必要です。', '座席とICカードを紐付けます。'], cardIds: nationalIds, sourceId: 'e-ticket' },
  { id: 'touch-go', name: 'タッチでGo!新幹線', purpose: 'shinkansen', summary: '対象区間の自由席をチャージ残高で利用します。', conditions: ['初回利用開始登録が必要です。', '対象駅・列車・座席に制限があります。'], cardIds: nationalIds, sourceId: 'touch-go' },
  { id: 'national-mutual', name: '全国相互利用', purpose: 'fare', summary: '10カードの対応エリア内で交通利用できます。', conditions: ['全国すべての交通機関を意味しません。', '異なるIC利用エリアをまたぐSF乗車は原則できません。'], cardIds: nationalIds, sourceId: 'mlit-mutual' },
  { id: 'regional-linked', name: '地域連携ICカード', purpose: 'fare', summary: '地域独自サービスとSuica機能を一枚で利用します。', conditions: ['地域独自の定期券・割引はSuica機能と別です。', '発行事業者ごとに対象路線が異なります。'], cardIds: ['totra'], sourceId: 'suica-regional' },
];

export const transferGates: TransferGate[] = [
  { id: 'kintetsu-nagoya', station: '近鉄名古屋', title: 'JR・近鉄の乗換改札', steps: ['乗換前の交通系ICカードを改札機へタッチします。', '磁気券を併用する場合は先にきっぷを投入します。', '画面表示と係員案内を確認して乗り換えます。'], note: '利用する券種や経路により操作が異なります。現地の改札表示を優先してください。', sourceId: 'toica-sharing' },
  { id: 'sendai-transfer', station: '仙台', title: 'JR・地下鉄の乗換', steps: ['JR改札を一度出場します。', '地下鉄改札で同じ対応カードをタッチします。'], note: 'icscaとSuicaの利用範囲は同一ではありません。', sourceId: 'icsca' },
];

export const sourceById = (id: string) => sources.find((source) => source.id === id)!;
export const cardById = (id: string) => cards.find((card) => card.id === id)!;
export const areaById = (id: string | null) => areas.find((area) => area.id === id);
export const operatorById = (id: string) => operators.find((operator) => operator.id === id)!;

const labels: Record<ResultStatus, string> = {
  available: '利用できます',
  unavailable: '利用できません',
  conditional: '条件があります',
  unknown: '公式情報で確認できません',
};

export function checkCompatibility(
  cardId: string,
  areaId: string,
  purpose: Purpose = 'fare',
  medium: Medium = 'physical',
): CompatibilityResult {
  const card = cardById(cardId);
  const area = areaById(areaId);
  const source = sourceById(area?.sourceId ?? card.sourceId);
  if (!area || !card) return { status: 'unknown', title: labels.unknown, detail: '対象の組み合わせを確認できません。', source };
  if (!card.media.includes(medium)) {
    return { status: 'unavailable', title: labels.unavailable, detail: `${card.name}は選択した媒体を提供していません。`, source: sourceById(card.sourceId) };
  }
  if (purpose === 'emoney' && cardId === 'pitapa' && area.id !== 'pitapa') {
    return { status: 'unavailable', title: labels.unavailable, detail: 'PiTaPaの全国相互利用は交通利用が中心で、他エリアの電子マネー相互利用対象ではありません。', source: sourceById('mlit-mutual') };
  }
  if (purpose !== 'fare') {
    return { status: 'conditional', title: labels.conditional, detail: '交通利用以外は相互利用とは別制度です。対象サービスの条件を確認してください。', source };
  }
  if (!area.acceptedCardIds.includes(cardId)) {
    return { status: 'unavailable', title: labels.unavailable, detail: `${area.name}の公式な受付対象として確認できません。`, source };
  }
  if (card.category === 'regional' && !card.homeAreaIds.includes(area.id)) {
    if (card.id === 'icsca' && area.id === 'suica-sendai') {
      return { status: 'conditional', title: labels.conditional, detail: 'icscaは仙台Suicaエリアの対象範囲で利用できます。首都圏など他のSuicaエリアでは利用できません。', source: sourceById('icsca') };
    }
    return { status: 'unavailable', title: labels.unavailable, detail: `${card.name}は地域外へ持ち出して利用できません。`, source: sourceById(card.sourceId) };
  }
  const conditional = area.id === 'icsca' || area.id === 'ryuto' || area.id === 'okica-yuirail';
  return {
    status: conditional ? 'conditional' : 'available',
    title: labels[conditional ? 'conditional' : 'available'],
    detail: conditional ? area.note : `${area.name}の交通利用に対応します。エリアまたぎや個別路線の制限は別に確認してください。`,
    source,
  };
}

export type JourneyResult = {
  status: ResultStatus;
  title: string;
  checks: Array<{ label: string; status: ResultStatus; detail: string }>;
};

export function evaluateJourney(cardId: string, fromId: string, toId: string): JourneyResult {
  const from = stations.find((station) => station.id === fromId);
  const to = stations.find((station) => station.id === toId);
  if (!from || !to || !from.areaId || !to.areaId) {
    return { status: 'unknown', title: labels.unknown, checks: [{ label: '駅の対応', status: 'unknown', detail: '駅またはIC利用エリアを確認できません。' }] };
  }
  const fromResult = checkCompatibility(cardId, from.areaId);
  const toResult = checkCompatibility(cardId, to.areaId);
  const fromArea = areaById(from.areaId)!;
  const toArea = areaById(to.areaId)!;
  const sameArea = from.areaId === to.areaId;
  const sameZone = Boolean(fromArea.sfZoneId && fromArea.sfZoneId === toArea.sfZoneId);
  const areaStatus: ResultStatus = sameArea ? 'available' : sameZone ? 'conditional' : 'unavailable';
  const checks = [
    { label: '乗車駅', status: fromResult.status, detail: `${from.name}：${fromResult.detail}` },
    { label: '降車駅', status: toResult.status, detail: `${to.name}：${toResult.detail}` },
    {
      label: 'IC利用エリア',
      status: areaStatus,
      detail: sameArea
        ? `両駅は${fromArea.name}です。`
        : sameZone
          ? `${fromArea.name}と${toArea.name}は連絡利用の可能性があります。実際の経路を確認してください。`
          : `${fromArea.name}と${toArea.name}をまたぐ通常のSF乗車は確認できません。`,
    },
    { label: '利用経路', status: 'unknown' as const, detail: '列車・経由路線・営業キロは検索条件だけでは確定しません。' },
  ];
  if (checks.some((check) => check.status === 'unavailable')) {
    return { status: 'unavailable', title: labels.unavailable, checks };
  }
  return { status: 'conditional', title: labels.conditional, checks };
}
