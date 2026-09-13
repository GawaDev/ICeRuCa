import { describe, expect, it } from 'vitest';
import { areasOfCompany } from './companies';
import { CARDS, resolveCompatibility } from './compatBase';
import { evaluateJourney, type StationHit } from './journey';
import { findViaRoute, lineKeyOf } from './viaRoutes';
import { defaultVariantId, getVariant, variantsForCard, VARIANTS } from './variants';
import { CARD_SERVICES, CROSS_SERVICES, servicesForCard } from './services';
import { SERVICE_COVERAGES } from './serviceCoverage';
import { getTransferGate, searchTransferGates, TRANSFER_GATES } from './transferGates';

const station = (
  id: string,
  name: string,
  operator: string,
  line: string,
  icAreaId: string,
  lon: number,
  lat: number,
  icAreaIds?: string[],
): StationHit => ({
  id, name, operator, line, icAreaId, icAreaIds,
  brandId: icAreaId.split('-')[0],
  icRide: 'full', lon, lat,
});

describe('旧ICつかえる判定基盤', () => {
  it('旧乗換改札7件と詳細シナリオを保持する', () => {
    expect(TRANSFER_GATES.map((gate) => gate.id)).toEqual([
      'kintetsu-nagoya-jr',
      'kintetsu-nagoya-meitetsu',
      'toyohashi-jr-meitetsu',
      'yatomi-jr-meitetsu',
      'okazaki-jr-aikan',
      'maibara-icoca-toica',
      'tsuruga-hapi-transfer',
    ]);
    expect(getTransferGate('kintetsu-nagoya-jr')?.scenarios).toHaveLength(5);
    expect(getTransferGate('kintetsu-nagoya-jr')?.scenarios.find((scenario) => scenario.id === 'ic-mag'))
      .toMatchObject({ mediaA: 'ic', mediaB: 'magnetic' });
    expect(searchTransferGates('0番線').map((gate) => gate.id)).toEqual(['okazaki-jr-aikan']);
  });

  it('旧ブランド別サービスと横断サービスを現行配列APIで保持する', () => {
    expect(CARD_SERVICES).toHaveLength(65);
    expect(CROSS_SERVICES.map((service) => service.id)).toEqual([
      'national-mutual', 'smart-ex', 'shinkansen-e', 'touch-go', 'green-car',
    ]);
    expect(servicesForCard('suica').map((service) => service.id)).toEqual(
      expect.arrayContaining(['suica-points', 'suica-pass', 'suica-booking', 'suica-charge', 'green-car']),
    );
    expect(servicesForCard('sapica').map((service) => service.id)).toEqual([
      'sapica-points', 'sapica-pass', 'sapica-booking', 'sapica-charge',
    ]);
  });

  it('旧サービス対象範囲8件と北陸分割後IDを保持する', () => {
    expect(SERVICE_COVERAGES).toHaveLength(8);
    expect(SERVICE_COVERAGES.map((coverage) => coverage.id)).toEqual(
      expect.arrayContaining(['toica-point', 'pasmo-point', 'suica-pass', 'ex-ic']),
    );
    expect(SERVICE_COVERAGES.find((coverage) => coverage.id === 'wester-point')?.icAreaIds)
      .toEqual(expect.arrayContaining(['icoca-ir', 'icoca-ainokaze', 'icoca-hapi']));
  });

  it('全国10カードと地域カードを約27バリエーションで保持する', () => {
    expect(VARIANTS).toHaveLength(27);
    expect(new Set(VARIANTS.map((variant) => variant.cardId)).size).toBeGreaterThanOrEqual(10);
    expect(CARDS.every((card) => variantsForCard(card.id).length > 0)).toBe(true);
  });

  it('通常種類を小児用として扱わない', () => {
    const standard = getVariant(defaultVariantId('suica')!);
    expect(standard?.id).toBe('suica-named');
    expect(standard?.features.child).not.toBe(true);
    expect(getVariant('suica-standard')?.features.child).not.toBe(true);
    expect(getVariant('suica-child')?.features.child).toBe(true);
  });

  it('障がい者用は自エリア外の全国相互利用を遮断する', () => {
    const outside = resolveCompatibility('suica', 'toica', 'suica-disability');
    expect(outside).toMatchObject({ code: 'no', fare: false, emoney: false });
    expect(outside.notes.join('')).toContain('全国相互利用');

    const home = resolveCompatibility('suica', 'suica', 'suica-disability');
    expect(home).toMatchObject({ fare: true, emoney: true });
  });

  it('地域連携Suicaは全国相互と地域サービスの制約を保持する', () => {
    const regional = getVariant('suica-regional');
    expect(regional?.features).toMatchObject({ mutual: true, regionalService: true });
    const result = resolveCompatibility('suica', 'toica', 'suica-regional');
    expect(result).toMatchObject({ code: 'full', fare: true, emoney: true });
    expect(result.notes.join('')).toContain('地元ポイント');
  });

  it('モバイル種類の取扱制約を互換結果へ反映する', () => {
    const result = resolveCompatibility('suica', 'toica', 'suica-mobile');
    expect(result.code).toBe('full');
    expect(result.notes.join('')).toContain('挿入式');
  });

  it('PiTaPaは自エリア・他エリアとも電子マネー相互利用にしない', () => {
    expect(resolveCompatibility('pitapa', 'pitapa', 'pitapa-postpay'))
      .toMatchObject({ code: 'ticket', fare: true, emoney: false });
    expect(resolveCompatibility('pitapa', 'suica', 'pitapa-postpay'))
      .toMatchObject({ code: 'ticket', fare: true, emoney: false });
  });

  it('旧ラッパ互換としてエリア・種類オブジェクトも受け付ける', () => {
    const area = { id: 'toica', name: 'TOICAエリア', region: '東海', kind: 'national' as const, cardId: 'toica' };
    const result = resolveCompatibility('suica', area, getVariant('suica-disability'));
    expect(result.code).toBe('no');
  });

  it('会社から複数ICエリアを引ける', () => {
    expect(areasOfCompany('jr-east').length).toBeGreaterThanOrEqual(6);
    expect(areasOfCompany('jr-east')[0].companyName).toBe('JR東日本');
  });

  it('東京から名古屋はSuicaとTOICAのエリアまたぎになる', () => {
    const result = evaluateJourney(
      station('tokyo', '東京', '東日本旅客鉄道', '東海道線', 'suica-shutoken', 139.767, 35.681),
      station('nagoya', '名古屋', '東海旅客鉄道', '東海道線', 'toica-tokai', 136.881, 35.171),
    );
    expect(result.verdict).toBe('cross_area');
    expect(result.checks).toHaveLength(5);
  });

  it('福井から富山はハピラインとあいの風を直接またげない', () => {
    const result = evaluateJourney(
      station('fukui', '福井', 'ハピラインふくい', 'ハピラインふくい線', 'icoca-hapi', 136.223, 36.062),
      station('toyama', '富山', 'あいの風とやま鉄道', 'あいの風とやま鉄道線', 'icoca-ainokaze', 137.214, 36.701),
    );
    expect(result.verdict).toBe('cross_area');
  });

  it('福井から金沢はハピラインとIRの例外またぎになる', () => {
    const result = evaluateJourney(
      station('fukui', '福井', 'ハピラインふくい', 'ハピラインふくい線', 'icoca-hapi', 136.223, 36.062),
      station('kanazawa', '金沢', 'IRいしかわ鉄道', 'IRいしかわ鉄道線', 'icoca-ir', 136.648, 36.578),
    );
    expect(result.verdict).toBe('bridge');
    expect(result.usable).toBe(true);
  });

  it('多度津から東岡山は児島接続のJR四国・西日本またぎになる', () => {
    const result = evaluateJourney(
      station('tadotsu', '多度津', '四国旅客鉄道', '予讃線', 'icoca-shikoku', 133.757, 34.272),
      station('higashi-okayama', '東岡山', '西日本旅客鉄道', '山陽線', 'icoca-jr-west', 134.0, 34.685),
    );
    expect(result.verdict).toBe('bridge');
  });

  it('山陽姫路から柳川はPiTaPa飛び地をまたぐため不可', () => {
    const result = evaluateJourney(
      station('sanyo-himeji', '山陽姫路', '山陽電気鉄道', '本線', 'pitapa-kinki', 134.69, 34.827),
      station('yanagawa', '柳川', '岡山電気軌道', '東山本線', 'pitapa-okayama', 133.925, 34.665),
    );
    expect(result.verdict).toBe('cross_area');
  });

  it.each([
    [
      station('atami-east', '熱海', '東日本旅客鉄道', '東海道線', 'suica-shutoken', 139.078, 35.103, ['suica-shutoken', 'toica-tokai']),
      station('atami-central', '熱海', '東海旅客鉄道', '東海道線', 'toica-tokai', 139.078, 35.103, ['suica-shutoken', 'toica-tokai']),
    ],
    [
      station('maibara-west', '米原', '西日本旅客鉄道', '東海道線', 'icoca-jr-west', 136.29, 35.315, ['icoca-jr-west', 'toica-tokai']),
      station('maibara-central', '米原', '東海旅客鉄道', '東海道線', 'toica-tokai', 136.29, 35.315, ['icoca-jr-west', 'toica-tokai']),
    ],
  ])('境界駅の副次エリアIDで同一エリアの偽陽性にしない', (from, to) => {
    expect(evaluateJourney(from, to).verdict).toBe('cross_area');
  });

  it('ICOCA 200km超でもやくも停車駅相互の例外を適用する', () => {
    const result = evaluateJourney(
      station('okayama', '岡山', '西日本旅客鉄道', '伯備線', 'icoca-jr-west', 133.919, 34.666),
      station('izumoshi', '出雲市', '西日本旅客鉄道', '山陰線', 'icoca-jr-west', 130.5, 35.361),
    );
    expect(result.approxFareKm).toBeGreaterThan(200);
    expect(result.verdict).toBe('ok');
    expect(result.checks.find((check) => check.id === 'fare_km')?.ok).toBe(true);
  });

  it('不明エリアを利用不可へ変換しない', () => {
    const result = evaluateJourney(
      station('a', 'A', '不明会社', '不明線', 'none', 139, 35),
      station('b', 'B', '不明会社', '不明線', 'none', 139.1, 35.1),
    );
    expect(result.verdict).toBe('unknown_area');
    expect(result.usable).toBeNull();
  });

  it('経由路線探索から新幹線を除外する', () => {
    const from = station('a', 'A', '東日本旅客鉄道', '東海道線', 'suica-shutoken', 139, 35);
    const to = station('b', 'B', '東海旅客鉄道', '中央線', 'toica-tokai', 137, 35);
    const shinkansen = '東海旅客鉄道\t東海道新幹線';
    expect(findViaRoute(from, to, {
      lines: [lineKeyOf(from), shinkansen, lineKeyOf(to)],
      edges: [
        { a: lineKeyOf(from), b: shinkansen, station: '東京' },
        { a: shinkansen, b: lineKeyOf(to), station: '名古屋' },
      ],
    })).toBeNull();
  });
});
