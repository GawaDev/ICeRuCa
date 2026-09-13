export type ServiceCategory = 'fare' | 'emoney' | 'pass' | 'points' | 'booking' | 'charge';

export type CardService = {
  id: string;
  name: string;
  category: ServiceCategory;
  cardIds: string[];
  summary: string;
  scope?: string;
  withOtherCards?: string;
  notes?: string[];
};

export const SERVICE_CATEGORIES = {
  fare: '交通利用',
  emoney: '電子マネー',
  pass: '定期券',
  points: 'ポイント',
  booking: '予約サービス',
  charge: 'チャージ・決済',
} as const;

type ServiceDetail = Omit<CardService, 'id' | 'category' | 'cardIds'>;

const BRAND_SERVICE_DETAILS: Record<string, Record<'points' | 'pass' | 'booking' | 'charge', ServiceDetail>> = {
  suica: {
    points: { name: 'JRE POINT', summary: '鉄道利用・加盟店・モバイルSuica決済などで付与。', scope: '原則Suicaエリア・JR東日本関連。他社エリア利用では付与されないことが多い。', withOtherCards: '他社発行カードではJRE POINTは付かない。' },
    pass: { name: 'Suica定期券', summary: '記名Suica・モバイルSuicaで発売。', scope: 'Suicaエリア内。PASMOエリアとの連絡定期は条件付き。', withOtherCards: '他ブランド定期は連絡・提携区間に限る。' },
    booking: { name: '新幹線eチケット・タッチでGo!新幹線・EX予約連携', summary: '登録したSuica等を乗車用媒体・決済に利用。', scope: 'サービスにより対象新幹線・区間が異なる。', withOtherCards: '他の交通系ICも登録可能なサービスあり。' },
    charge: { name: '現金・クレジット・オートチャージ', summary: '駅・コンビニ・モバイルアプリでチャージ。', scope: '相互利用エリアでも機器により異なる。', withOtherCards: '他エリア機器では対応機種のみ。' },
  },
  pasmo: {
    points: { name: 'PASMOポイント', summary: '加盟店・一部交通事業者の施策。', scope: 'PASMOエリア中心。', withOtherCards: 'PASMO・Suicaだけが対象となる施策がある。' },
    pass: { name: 'PASMO定期券（鉄道・バス）', summary: '民鉄・バスの通勤・通学定期。', scope: 'PASMO導入事業者。', withOtherCards: 'Suicaとの連絡定期は区間による。' },
    booking: { name: '各社の特急・座席予約', summary: '各私鉄のアプリ・サイトが中心。', scope: '小田急・東武など各社サービス。', withOtherCards: 'ICは乗車時のタッチに併用される場合がある。' },
    charge: { name: '現金・モバイル・オートチャージ', summary: '駅・バス営業所・コンビニ等。', scope: 'PASMO・相互利用対応機器。', withOtherCards: '対応機器による。' },
  },
  icoca: {
    points: { name: 'WESTERポイント・ICOCAポイント', summary: 'JR西日本の乗車・加盟店利用で付与。', scope: 'ICOCAエリア・WESTER連携。', withOtherCards: '他カードでは対象外。' },
    pass: { name: 'ICOCA定期券', summary: '近畿・岡山・広島などで発売。', scope: 'ICOCAエリア。PiTaPa連絡定期あり。', withOtherCards: 'PiTaPaとの連絡は協定区間。' },
    booking: { name: 'e5489・スマートEX・新幹線定期', summary: 'ICOCAを登録して特急・新幹線に利用する場合がある。', scope: 'サービス範囲による。', withOtherCards: 'スマートEXは複数ブランドを登録可。' },
    charge: { name: '現金・SMART ICOCA・モバイル', summary: '駅・コンビニ・アプリ。', scope: 'ICOCA・相互対応機器。', withOtherCards: '対応機器による。' },
  },
  pitapa: {
    points: { name: 'PiTaPaポイント・ショップdeポイント', summary: '利用額に応じた還元。ポストペイ前提。', scope: 'PiTaPa加盟交通・ショップ。', withOtherCards: '交通系電子マネー相互利用とは別ネットワーク。' },
    pass: { name: 'PiTaPa定期・フリープラン等', summary: '近畿圏民鉄・バスの企画・定期。', scope: 'PiTaPaエリア。', withOtherCards: 'ICOCAとの相互・連絡は協定による。' },
    booking: { name: '各社ネット予約', summary: '特急予約は各社サイトが中心。', scope: '近鉄・阪急など。', withOtherCards: 'ICは乗車用に併用。' },
    charge: { name: 'ポストペイと必要時のチャージ', summary: '全国相互エリアの多くは事前チャージ必須。', scope: '近畿のICOCAエリアのみポストペイ可など条件あり。', withOtherCards: '電子マネー相互利用加盟店では原則利用不可。' },
  },
  toica: {
    points: { name: 'JR東海関連の特典', summary: 'TOICA独自ポイントよりEX・クレジット連携が中心。', scope: 'JR東海関連。', withOtherCards: 'サービスごとに異なる。' },
    pass: { name: 'TOICA定期券', summary: '名古屋近郊などで発売。', scope: 'TOICAエリア。', withOtherCards: 'エリアまたぎ定期は制限が大きい。' },
    booking: { name: 'EX予約・スマートEX', summary: 'ICカードを改札の認証媒体として登録。', scope: '東海道・山陽・九州新幹線。', withOtherCards: 'Suica・ICOCA等も登録可。' },
    charge: { name: '駅・コンビニ等', summary: '相互利用対応機器でチャージ。', scope: 'TOICAエリアほか。', withOtherCards: '対応機器による。' },
  },
  manaca: {
    points: { name: 'manacaポイント', summary: '名鉄系・市交系で付与ルールが異なる。', scope: 'manacaエリア。', withOtherCards: '他カード利用は原則対象外。' },
    pass: { name: 'manaca定期券', summary: '名鉄・市交・バスなど。', scope: 'manacaエリア。', withOtherCards: 'TOICA連絡は条件付き。' },
    booking: { name: '各社予約サービス', summary: '交通ICは乗車用。', scope: '中京圏。', withOtherCards: 'サービスごとに異なる。' },
    charge: { name: '現金・クレジット一体型など', summary: 'manaca・TOICAエリアには残額0円入場の取扱いあり。', scope: 'manacaエリア。', withOtherCards: 'エリア・機器による。' },
  },
  kitaca: {
    points: { name: 'Kitacaポイント施策', summary: '発行・キャンペーン状況を確認。', scope: 'Kitacaエリア。', withOtherCards: '他カードは対象外。' },
    pass: { name: 'Kitaca定期券', summary: '札幌近郊。', scope: 'Kitacaエリア。', withOtherCards: '対象外。' },
    booking: { name: 'JR北海道の予約サービス', summary: 'ICは在来線SFが中心。', scope: '北海道。', withOtherCards: 'サービスごとに異なる。' },
    charge: { name: '駅・コンビニ等', summary: '相互利用対応機器でチャージ。', scope: 'Kitacaエリアほか。', withOtherCards: '対応機器による。' },
  },
  sugoca: {
    points: { name: 'SUGOCAポイント・JRキューポ', summary: 'JR九州利用などで付与。', scope: 'SUGOCAエリア。', withOtherCards: '他カードは原則対象外。' },
    pass: { name: 'SUGOCA定期券', summary: 'JR九州エリア。', scope: 'SUGOCAエリア。', withOtherCards: '対象外。' },
    booking: { name: 'JR九州ネット予約・EX連携', summary: '新幹線はEX系サービスと組み合わせ。', scope: '九州。', withOtherCards: 'サービスごとに異なる。' },
    charge: { name: '駅・コンビニ等', summary: '相互利用対応機器でチャージ。', scope: 'SUGOCAエリアほか。', withOtherCards: '対応機器による。' },
  },
  nimoca: {
    points: { name: 'nimocaポイント', summary: '西鉄・加盟店。種類により還元率が異なる。', scope: 'nimocaエリア。', withOtherCards: '他カードは原則対象外。' },
    pass: { name: 'nimoca定期券', summary: '西鉄電車・バスなど。', scope: 'nimocaエリア。', withOtherCards: '対象外。' },
    booking: { name: '西鉄など各社予約', summary: 'ICは乗車用。', scope: '九州・函館など。', withOtherCards: 'サービスごとに異なる。' },
    charge: { name: '駅・バス・コンビニ等', summary: '相互利用対応機器でチャージ。', scope: 'nimocaエリアほか。', withOtherCards: '対応機器による。' },
  },
  hayakaken: {
    points: { name: 'はやかけんポイント', summary: '福岡市地下鉄。SUGOCAとの乗継特例あり。', scope: 'はやかけんエリア。', withOtherCards: '他カードは原則対象外。' },
    pass: { name: 'はやかけん定期券', summary: '福岡市地下鉄。', scope: 'はやかけんエリア。', withOtherCards: '対象外。' },
    booking: { name: '地下鉄利用', summary: 'SF・定期が中心。', scope: '福岡市。', withOtherCards: '対象外。' },
    charge: { name: '駅等', summary: '相互利用対応機器でチャージ。', scope: 'はやかけんエリアほか。', withOtherCards: '対応機器による。' },
  },
  sapica: {
    points: { name: 'SAPICAポイント', summary: '札幌地区の自カード向け。', scope: 'SAPICAエリア。', withOtherCards: '10カード片利用時は原則対象外。' },
    pass: { name: 'SAPICA定期', summary: '札幌市交通局など。', scope: 'SAPICAエリア。', withOtherCards: '全国へ持ち出して利用不可。' },
    booking: { name: '地域内利用', summary: '地域内利用が中心。', scope: '札幌。', withOtherCards: '対象外。' },
    charge: { name: '専用機器', summary: '片利用の10カード側は制限がある場合あり。', scope: 'SAPICAエリア。', withOtherCards: '対応機器による。' },
  },
  icsca: {
    points: { name: 'icscaポイント', summary: '仙台地区。', scope: 'icscaエリア。', withOtherCards: '10カード片利用時は原則対象外。' },
    pass: { name: 'icsca定期', summary: '市交通局・宮城交通など。', scope: 'icscaエリア。', withOtherCards: 'Suica仙台との限定相互に注意。' },
    booking: { name: '地域内利用', summary: '地域内利用が中心。', scope: '仙台。', withOtherCards: '対象外。' },
    charge: { name: '専用機器', summary: '残額0円入場の取扱いあり。', scope: 'icscaエリア。', withOtherCards: '対応機器による。' },
  },
  ryuto: {
    points: { name: 'りゅーとポイント', summary: '新潟交通。', scope: 'りゅーとエリア。', withOtherCards: '10カード片利用時はチャージ・乗継割引なし。' },
    pass: { name: 'りゅーと定期', summary: '新潟交通バス。', scope: 'りゅーとエリア。', withOtherCards: '全国へ持ち出して利用不可。' },
    booking: { name: '地域内利用', summary: '地域内利用が中心。', scope: '新潟。', withOtherCards: '対象外。' },
    charge: { name: '専用機器', summary: '片利用カード側のチャージ制限に注意。', scope: 'りゅーとエリア。', withOtherCards: '対応機器による。' },
  },
  iruca: {
    points: { name: 'IruCaポイント', summary: 'ことでんグループ。', scope: 'IruCaエリア。', withOtherCards: '10カード片利用時は原則対象外。' },
    pass: { name: 'IruCa定期', summary: 'ことでん・バス。', scope: 'IruCaエリア。', withOtherCards: '全国へ持ち出して利用不可。' },
    booking: { name: '地域内利用', summary: '地域内利用が中心。', scope: '香川。', withOtherCards: '対象外。' },
    charge: { name: '専用機器', summary: '地域内の対応機器でチャージ。', scope: 'IruCaエリア。', withOtherCards: '対応機器による。' },
  },
  nitas: {
    points: { name: 'エヌタスポイント', summary: '長崎自動車グループ。', scope: 'エヌタスエリア。', withOtherCards: '10カード片利用時はチャージ等に制限。' },
    pass: { name: 'エヌタス定期', summary: 'バス定期。', scope: 'エヌタスエリア。', withOtherCards: '全国へ持ち出して利用不可。' },
    booking: { name: '地域内利用', summary: '地域内利用が中心。', scope: '長崎。', withOtherCards: '対象外。' },
    charge: { name: '専用機器', summary: '地域内の対応機器でチャージ。', scope: 'エヌタスエリア。', withOtherCards: '対応機器による。' },
  },
};

const BRAND_SERVICES: CardService[] = Object.entries(BRAND_SERVICE_DETAILS).flatMap(
  ([cardId, categories]) =>
    Object.entries(categories).map(([category, detail]) => ({
      id: `${cardId}-${category}`,
      category: category as 'points' | 'pass' | 'booking' | 'charge',
      cardIds: [cardId],
      ...detail,
    })),
);

export const CROSS_SERVICES: CardService[] = [
  { id: 'national-mutual', name: '交通系ICカード全国相互利用', category: 'fare', summary: '10カードの乗車券相互利用。電子マネーはPiTaPaを除く9カード。', cardIds: ['kitaca', 'suica', 'pasmo', 'toica', 'manaca', 'icoca', 'pitapa', 'sugoca', 'nimoca', 'hayakaken'] },
  { id: 'smart-ex', name: 'EX予約・スマートEX', category: 'booking', summary: '登録したICを新幹線改札の認証に使用。残高引き去りとは別です。', cardIds: ['suica', 'pasmo', 'toica', 'manaca', 'icoca', 'sugoca', 'kitaca', 'nimoca', 'hayakaken'] },
  { id: 'shinkansen-e', name: '新幹線eチケット', category: 'booking', summary: '予約と紐づけたICで対象新幹線へ入場。', cardIds: ['suica', 'pasmo', 'kitaca', 'toica', 'manaca', 'icoca', 'sugoca', 'nimoca', 'hayakaken'] },
  { id: 'touch-go', name: 'タッチでGo!新幹線', category: 'booking', summary: '事前登録したSuica等の残高で対象自由席を利用。', cardIds: ['suica'], notes: ['対象区間・経路に制限あり'] },
  { id: 'green-car', name: 'グリーン車Suicaシステム', category: 'booking', summary: '首都圏の普通列車グリーン車。Suica系が前提。', cardIds: ['suica'], notes: ['PASMO等の他カードでは利用不可'] },
];

export const CARD_SERVICES: CardService[] = [...BRAND_SERVICES, ...CROSS_SERVICES];

export function servicesForCard(cardId: string) {
  return CARD_SERVICES.filter((service) => service.cardIds.includes(cardId));
}

export function crossServicesForCard(cardId: string) {
  return CROSS_SERVICES.filter((service) => service.cardIds.includes(cardId));
}
