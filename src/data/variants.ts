export type VariantTag =
  | 'physical'
  | 'mobile'
  | 'age'
  | 'welfare'
  | 'product'
  | 'regional';

export type CardVariant = {
  id: string;
  cardId: string;
  name: string;
  tag: VariantTag;
  /** 旧移植後の利用側との互換用 */
  tags: VariantTag[];
  summary: string;
  limits: string[];
  features: {
    mutual: boolean;
    emoney: boolean;
    points: boolean;
    pass: boolean;
    booking: boolean;
    mobile?: boolean;
    child?: boolean;
    regionalService?: boolean;
  };
};

export const VARIANT_TAGS: Record<VariantTag, string> = {
  physical: 'カード媒体',
  mobile: 'モバイル',
  age: '年齢区分',
  welfare: '福祉・特別',
  product: '一体型・提携',
  regional: '地域連携',
};

type VariantSource = Omit<CardVariant, 'tags'>;
const variant = (source: VariantSource): CardVariant => ({
  ...source,
  tags: [source.tag],
  features: {
    ...source.features,
    ...(source.tag === 'mobile' ? { mobile: true } : {}),
    ...(source.tag === 'age' ? { child: true } : {}),
    ...(source.tag === 'regional' ? { regionalService: true } : {}),
  },
});

export const VARIANTS: CardVariant[] = [
  variant({ id: 'suica-anon', cardId: 'suica', name: '無記名Suica', tag: 'physical', summary: '誰でも購入可。紛失時再発行なし。', limits: ['再発行不可', '定期券一体型にはできない'], features: { mutual: true, emoney: true, points: false, pass: false, booking: true } }),
  variant({ id: 'suica-named', cardId: 'suica', name: '記名Suica', tag: 'physical', summary: '本人専用。紛失時再発行可。JRE POINT登録可。', limits: [], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),
  variant({ id: 'suica-mobile', cardId: 'suica', name: 'モバイルSuica', tag: 'mobile', summary: 'スマホアプリ。オンラインチャージ中心。', limits: ['カード挿入式の券売機・精算機でのチャージ不可', '機種変更・対応端末の制約あり'], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),
  variant({ id: 'suica-child', cardId: 'suica', name: 'こども用Suica', tag: 'age', summary: '小児運賃適用。全国相互利用の乗車券としても利用可。', limits: ['有効期限・年齢確認あり', '大人用への切替手続きが必要'], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),
  variant({ id: 'suica-disability', cardId: 'suica', name: '障がい者用Suica', tag: 'welfare', summary: 'JR東日本エリア中心の割引。相互利用範囲が通常Suicaと異なる場合あり。', limits: ['全国相互利用サービス対象外となるケースあり（発行条件・利用範囲を要確認）', '他エリアでの割引適用は原則なし'], features: { mutual: false, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'suica-view', cardId: 'suica', name: 'ビュースイカ等クレジットカード一体型', tag: 'product', summary: 'オートチャージ対応。クレジット機能は別契約。', limits: ['カード会社の規約が優先', '海外磁気・IC部分は交通利用と無関係'], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),
  variant({ id: 'suica-regional', cardId: 'suica', name: '地域連携ICカード（Suica）', tag: 'regional', summary: 'AOPASS・nolbé・odecaなど。全国相互利用に対応しつつ地元サービスも利用。', limits: ['地元ポイント・乗継割引は原則その地域の自カードのみ', 'デザインは地域ごと、基盤はSuica'], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),

  variant({ id: 'pasmo-anon', cardId: 'pasmo', name: '無記名PASMO', tag: 'physical', summary: '再発行不可。首都圏民鉄・バス向け。', limits: ['再発行不可'], features: { mutual: true, emoney: true, points: false, pass: false, booking: false } }),
  variant({ id: 'pasmo-named', cardId: 'pasmo', name: '記名PASMO', tag: 'physical', summary: '定期券一体型・再発行可。', limits: [], features: { mutual: true, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'pasmo-mobile', cardId: 'pasmo', name: 'モバイルPASMO', tag: 'mobile', summary: '対応スマートフォンで利用。バス定期なども取扱い。', limits: ['挿入式券売機チャージ不可', '一部定期・企画は店舗限定'], features: { mutual: true, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'pasmo-child', cardId: 'pasmo', name: 'こども用PASMO', tag: 'age', summary: '小児運賃。相互利用可。', limits: ['有効期限管理あり'], features: { mutual: true, emoney: true, points: true, pass: true, booking: false } }),

  variant({ id: 'icoca-std', cardId: 'icoca', name: 'ICOCA（無記名・記名）', tag: 'physical', summary: 'JR西日本・四国ほか。SMART ICOCAは別種類。', limits: [], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),
  variant({ id: 'icoca-mobile', cardId: 'icoca', name: 'モバイルICOCA', tag: 'mobile', summary: 'スマートフォンで利用。WESTERポイント連携。', limits: ['挿入式機でのチャージ不可'], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),
  variant({ id: 'icoca-smart', cardId: 'icoca', name: 'SMART ICOCA', tag: 'product', summary: 'クイックチャージ対応の記名カード。', limits: ['クレジットカード登録が必要'], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),

  variant({ id: 'pitapa-postpay', cardId: 'pitapa', name: 'PiTaPa（ポストペイ）', tag: 'product', summary: '後払いが基本。全国相互では事前チャージが必要なエリアが多い。', limits: ['電子マネー相互利用の対象外', '他エリアでは事前チャージ必須（ICOCA近畿のみポストペイ可）', 'ポイント・割引はPiTaPaエリア中心'], features: { mutual: true, emoney: false, points: true, pass: true, booking: false } }),

  variant({ id: 'kitaca-std', cardId: 'kitaca', name: 'Kitaca（通常・小児）', tag: 'physical', summary: 'JR北海道エリア発行。障がい者用はKitacaエリア限定。', limits: [], features: { mutual: true, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'kitaca-disability', cardId: 'kitaca', name: '障がい者用Kitaca', tag: 'welfare', summary: 'Kitacaエリア内のみ。全国相互利用の対象外。', limits: ['Kitacaエリア外では利用不可'], features: { mutual: false, emoney: false, points: false, pass: true, booking: false } }),
  variant({ id: 'toica-std', cardId: 'toica', name: 'TOICA（通常・小児・定期一体）', tag: 'physical', summary: 'JR東海。EXサービスへの登録にも利用可。', limits: [], features: { mutual: true, emoney: true, points: false, pass: true, booking: true } }),
  variant({ id: 'manaca-std', cardId: 'manaca', name: 'manaca（名鉄・市交）', tag: 'physical', summary: '発行体が2系統だが相互・全国利用は同等。', limits: ['ポイント還元率・対象は発行体で差あり'], features: { mutual: true, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'sugoca-std', cardId: 'sugoca', name: 'SUGOCA（通常・定期一体）', tag: 'physical', summary: 'JR九州。JRキューポなどの条件あり。', limits: [], features: { mutual: true, emoney: true, points: true, pass: true, booking: true } }),
  variant({ id: 'nimoca-std', cardId: 'nimoca', name: 'nimoca・スターnimocaなど', tag: 'physical', summary: 'クレジット一体型やポイント特化型あり。交通利用は同等。', limits: ['ポイント・クレジット特典はモデル差あり'], features: { mutual: true, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'hayakaken-std', cardId: 'hayakaken', name: 'はやかけん（通常・定期）', tag: 'physical', summary: '福岡市地下鉄。はやかけんポイント。', limits: [], features: { mutual: true, emoney: true, points: true, pass: true, booking: false } }),

  variant({ id: 'sapica-std', cardId: 'sapica', name: 'SAPICA', tag: 'physical', summary: '札幌地区専用。全国相互エリアへの持ち出し不可。', limits: ['片利用側のため、10カードエリアでは原則利用不可'], features: { mutual: false, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'icsca-std', cardId: 'icsca', name: 'icsca', tag: 'physical', summary: '仙台地区。Suica仙台エリアとの限定相互あり。', limits: ['全国相互への完全参加ではない', '限定相互の対象外バスあり'], features: { mutual: false, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'ryuto-std', cardId: 'ryuto', name: 'りゅーと', tag: 'physical', summary: '新潟交通。10カードは片利用可。', limits: ['全国エリアでは利用不可', '10カード側はチャージ等制限あり'], features: { mutual: false, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'iruca-std', cardId: 'iruca', name: 'IruCa', tag: 'physical', summary: 'ことでん・ことでんバス。', limits: ['全国相互エリアでは原則不可'], features: { mutual: false, emoney: true, points: true, pass: true, booking: false } }),
  variant({ id: 'nitas-std', cardId: 'nitas', name: 'エヌタスカード', tag: 'physical', summary: '長崎自動車グループ。', limits: ['全国相互エリアでは原則不可'], features: { mutual: false, emoney: true, points: true, pass: true, booking: false } }),
];

export function variantsForCard(cardId: string) {
  return VARIANTS.filter((variant) => variant.cardId === cardId);
}

const VARIANT_ID_ALIASES: Record<string, string> = {
  'kitaca-standard': 'kitaca-std',
  'suica-standard': 'suica-named',
  'pasmo-standard': 'pasmo-named',
  'toica-standard': 'toica-std',
  'manaca-standard': 'manaca-std',
  'icoca-standard': 'icoca-std',
  'pitapa-standard': 'pitapa-postpay',
  'sugoca-standard': 'sugoca-std',
  'nimoca-standard': 'nimoca-std',
  'hayakaken-standard': 'hayakaken-std',
};

export function getVariant(id: string) {
  const resolvedId = VARIANT_ID_ALIASES[id] ?? id;
  return VARIANTS.find((variant) => variant.id === resolvedId);
}

export function defaultVariantId(cardId: string) {
  const list = variantsForCard(cardId);
  return (
    list.find((item) => item.id.includes('named') || item.id.includes('std') || item.id.includes('mobile')) ??
    list[0]
  )?.id;
}
