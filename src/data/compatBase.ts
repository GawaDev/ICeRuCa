import { getVariant, type CardVariant } from './variants';

export type CompatCode =
  | 'full'
  | 'ticket'
  | 'oneway'
  | 'oneway_ticket'
  | 'limited'
  | 'no'
  | 'unknown';

export type Card = {
  id: string;
  name: string;
  group: 'national' | 'regional' | 'linked';
  issuer: string;
  homeAreaIds: string[];
};

export type CompatArea = {
  id: string;
  name: string;
  region: string;
  kind: 'national' | 'oneway' | 'exception';
  cardId?: string;
  gateway?: string;
};

export type CompatResult = {
  code: CompatCode;
  fare: boolean | null;
  emoney: boolean | null;
  notes: string[];
};

export const NATIONAL10 = [
  'kitaca',
  'suica',
  'pasmo',
  'toica',
  'manaca',
  'icoca',
  'pitapa',
  'sugoca',
  'nimoca',
  'hayakaken',
] as const;

export const CARDS: Card[] = [
  ['kitaca', 'Kitaca', 'JR北海道'],
  ['suica', 'Suica', 'JR東日本'],
  ['pasmo', 'PASMO', 'PASMO協議会'],
  ['toica', 'TOICA', 'JR東海'],
  ['manaca', 'manaca', '名古屋交通開発機構ほか'],
  ['icoca', 'ICOCA', 'JR西日本'],
  ['pitapa', 'PiTaPa', 'スルッとKANSAI'],
  ['sugoca', 'SUGOCA', 'JR九州'],
  ['nimoca', 'nimoca', 'ニモカ'],
  ['hayakaken', 'はやかけん', '福岡市交通局'],
].map(([id, name, issuer]) => ({
  id,
  name,
  issuer,
  group: 'national',
  homeAreaIds: [id],
} as Card)).concat([
  { id: 'sapica', name: 'SAPICA', issuer: '札幌ICカード協議会', group: 'regional', homeAreaIds: ['sapica'] },
  { id: 'icsca', name: 'icsca', issuer: '仙台市交通局', group: 'regional', homeAreaIds: ['icsca'] },
  { id: 'iruca', name: 'IruCa', issuer: '高松琴平電気鉄道', group: 'regional', homeAreaIds: ['iruca'] },
  { id: 'ryuto', name: 'りゅーと', issuer: '新潟交通', group: 'regional', homeAreaIds: ['ryuto'] },
  { id: 'nitas', name: 'エヌタスTカード', issuer: '長崎自動車グループ', group: 'regional', homeAreaIds: ['nitas'] },
]);

export const AREAS: CompatArea[] = [
  ...NATIONAL10.map((id) => ({
    id,
    name: `${getCardName(id)}エリア`,
    region: '全国相互利用対象地域',
    kind: 'national' as const,
    cardId: id,
  })),
  { id: 'sapica', name: 'SAPICAエリア', region: '札幌', kind: 'oneway', cardId: 'sapica', gateway: 'suica' },
  { id: 'icsca', name: 'icscaエリア', region: '仙台', kind: 'oneway', cardId: 'icsca', gateway: 'suica' },
  { id: 'iruca', name: 'IruCaエリア', region: '香川', kind: 'oneway', cardId: 'iruca', gateway: 'icoca' },
  { id: 'ryuto', name: 'りゅーとエリア', region: '新潟', kind: 'oneway', cardId: 'ryuto', gateway: 'suica' },
  { id: 'nitas', name: 'エヌタスエリア', region: '長崎', kind: 'oneway', cardId: 'nitas', gateway: 'sugoca' },
];

export const LEGEND: Array<{ code: CompatCode; label: string }> = [
  { code: 'full', label: '交通・電子マネー利用可' },
  { code: 'ticket', label: '交通利用可' },
  { code: 'oneway', label: '片利用で交通・電子マネー利用可' },
  { code: 'oneway_ticket', label: '片利用で交通利用可' },
  { code: 'limited', label: '条件付き' },
  { code: 'no', label: '利用不可' },
  { code: 'unknown', label: '公式情報で確認できません' },
];

function getCardName(id: string) {
  const names: Record<string, string> = {
    kitaca: 'Kitaca', suica: 'Suica', pasmo: 'PASMO', toica: 'TOICA',
    manaca: 'manaca', icoca: 'ICOCA', pitapa: 'PiTaPa',
    sugoca: 'SUGOCA', nimoca: 'nimoca', hayakaken: 'はやかけん',
  };
  return names[id] ?? id;
}

export function getCard(id: string) {
  return CARDS.find((card) => card.id === id);
}

export function legendFor(code: CompatCode) {
  return LEGEND.find((item) => item.code === code);
}

export type VariantLike =
  | string
  | Pick<CardVariant, 'id' | 'cardId' | 'name' | 'features' | 'limits'>
  | null
  | undefined;

function resolveVariant(cardId: string, value: VariantLike) {
  if (!value) return null;
  const found = typeof value === 'string' ? getVariant(value) : value;
  return found?.cardId === cardId ? found : undefined;
}

export function resolveCompatibility(
  cardId: string,
  areaValue: string | CompatArea,
  variantValue?: VariantLike,
): CompatResult {
  const card = getCard(cardId);
  const area = typeof areaValue === 'string'
    ? AREAS.find((candidate) => candidate.id === areaValue)
    : areaValue;
  if (!card || !area) {
    return { code: 'unknown', fare: null, emoney: null, notes: ['公式情報で確認できません'] };
  }

  const selectedVariant = resolveVariant(cardId, variantValue);
  if (variantValue && !selectedVariant) {
    return {
      code: 'unknown',
      fare: null,
      emoney: null,
      notes: ['選択したカード種類を確認できません'],
    };
  }
  const variantNotes = selectedVariant?.limits ?? [];
  const blocksMutual = selectedVariant?.features.mutual === false;

  // 障がい者用など全国相互利用対象外の種類。icscaの限定相互だけは後段で扱う。
  if (
    blocksMutual &&
    area.cardId !== cardId &&
    !(cardId === 'icsca' && area.id === 'suica')
  ) {
    return {
      code: 'no',
      fare: false,
      emoney: false,
      notes: [
        `${selectedVariant.name}は全国相互利用の対象外または範囲外です`,
        ...variantNotes,
      ],
    };
  }

  // 全国相互非参加の関東鉄道はSuica・PASMOだけ利用可能。
  if (area.id === 'kanto-railway') {
    if (blocksMutual || !['suica', 'pasmo'].includes(cardId)) {
      return { code: 'no', fare: false, emoney: false, notes: ['このカード種類では利用できません', ...variantNotes] };
    }
    return { code: 'full', fare: true, emoney: selectedVariant?.features.emoney ?? true, notes: ['全国相互非参加のためSuica・PASMOのみ利用できます', ...variantNotes] };
  }

  if (area.cardId === cardId) {
    const emoney = selectedVariant?.features.emoney ?? cardId !== 'pitapa';
    return {
      code: emoney ? 'full' : 'ticket',
      fare: true,
      emoney,
      notes: [
        ...(cardId === 'pitapa' ? ['ポストペイ・独自電子マネーです'] : []),
        ...(card.group === 'regional' ? ['地域カードの対応エリアです'] : []),
        ...variantNotes,
      ],
    };
  }

  if (card.group === 'national' && area.kind === 'national') {
    if (cardId === 'pitapa') {
      return {
        code: 'ticket',
        fare: true,
        emoney: false,
        notes: ['他エリアでは事前チャージが必要です', '電子マネー相互利用の対象外です', ...variantNotes],
      };
    }
    if (area.cardId === 'pitapa') {
      return {
        code: 'ticket',
        fare: true,
        emoney: false,
        notes: ['PiTaPaエリアでは他カードの電子マネー相互利用はできません', ...variantNotes],
      };
    }
    const emoney = selectedVariant?.features.emoney ?? true;
    return { code: emoney ? 'full' : 'ticket', fare: true, emoney, notes: [...variantNotes] };
  }

  if (card.group === 'national' && area.kind === 'oneway') {
    return {
      code: 'oneway_ticket',
      fare: true,
      emoney: false,
      notes: [
        '全国相互利用カードから地域エリアへの片利用です',
        ...(cardId === 'pitapa' ? ['事前チャージが必要です'] : []),
        ...variantNotes,
      ],
    };
  }

  if (card.group === 'regional') {
    if (cardId === 'icsca' && area.id === 'suica') {
      return {
        code: 'limited',
        fare: true,
        emoney: false,
        notes: ['Suica仙台エリアの対象範囲に限る限定相互利用です', ...variantNotes],
      };
    }
    return {
      code: 'no',
      fare: false,
      emoney: false,
      notes: [`${card.name}は原則として対応する地域外では利用できません`, ...variantNotes],
    };
  }

  return { code: 'unknown', fare: null, emoney: null, notes: ['公式情報で確認できません', ...variantNotes] };
}
