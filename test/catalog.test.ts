import { describe, expect, it } from 'vitest';
import { cards, checkCompatibility, evaluateJourney, sources } from '../src/data/catalog';

describe('IC利用条件', () => {
  it('全国相互利用10カードを収録する', () => {
    expect(cards.filter((card) => card.category === 'national')).toHaveLength(10);
  });

  it('SuicaをPASMOエリアの交通利用に使える', () => {
    expect(checkCompatibility('suica', 'pasmo').status).toBe('available');
  });

  it('SAPICAを首都圏へ持ち出せない', () => {
    expect(checkCompatibility('sapica', 'suica-shutoken').status).toBe('unavailable');
  });

  it('icscaは仙台Suicaエリアだけ条件付きで使える', () => {
    expect(checkCompatibility('icsca', 'suica-sendai').status).toBe('conditional');
    expect(checkCompatibility('icsca', 'suica-shutoken').status).toBe('unavailable');
  });

  it('PiTaPaの他エリア電子マネー利用を不可とする', () => {
    expect(checkCompatibility('pitapa', 'suica-shutoken', 'emoney').status).toBe('unavailable');
  });

  it('OKICAバスエリアへ全国カードを一般化しない', () => {
    expect(checkCompatibility('suica', 'okica-bus').status).toBe('unavailable');
  });

  it('熱海でSuicaとTOICAのエリアをまたげない', () => {
    expect(evaluateJourney('suica', 'atami-east', 'atami-central').status).toBe('unavailable');
  });

  it('米原でTOICAとICOCAのエリアをまたげない', () => {
    expect(evaluateJourney('icoca', 'maibara-central', 'maibara-west').status).toBe('unavailable');
  });

  it('同一エリアでも経路未確定なら条件付きにする', () => {
    expect(evaluateJourney('suica', 'tokyo', 'shinjuku').status).toBe('conditional');
  });

  it('すべての根拠に公式URLと確認日がある', () => {
    expect(sources.every((source) => source.url.startsWith('https://') && source.checkedAt)).toBe(true);
  });
});
