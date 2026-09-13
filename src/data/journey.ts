import { canBridge, displayIcAreas, getIcArea, sameSfZone, sfZoneLabel } from './icAreas';
import { evaluateIcocaKmException, shouldApplyIcocaKmExceptions } from './icocaKmExceptions';
import { canThroughLatch } from './latchNetwork';

export type StationHit = {
  id: string;
  name: string;
  line: string;
  operator: string;
  brandId: string;
  icAreaId: string;
  icAreaIds?: string[];
  icRide: 'full' | 'none' | 'partial' | 'limited';
  lon: number;
  lat: number;
  boundaryNote?: string;
};

export type JourneyVerdict =
  | 'ok' | 'cross_area' | 'bridge' | 'station_blocked' | 'over_km'
  | 'same_station' | 'no_through_latch' | 'unknown_area';
export type JourneyCheckId = 'from_ic' | 'to_ic' | 'area' | 'fare_km' | 'latch';
export type JourneyCheck = { id: JourneyCheckId; label: string; ok: boolean | null; detail: string };
export type JourneyResult = {
  verdict: JourneyVerdict;
  usable: boolean | null;
  segmentIcOk: boolean;
  includesOutsideTransfer?: boolean;
  checks: JourneyCheck[];
  from: StationHit;
  to: StationHit;
  fromAreaLabel: string;
  toAreaLabel: string;
  approxFareKm: number;
  maxFareKm: number | null;
  reasons: string[];
  notes: string[];
};

export const stationAreaIds = (station: StationHit) =>
  station.icAreaIds?.length ? station.icAreaIds : station.icAreaId ? [station.icAreaId] : [];

export function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number) {
  const radius = 6371;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const value = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.asin(Math.sqrt(value));
}

export const approxOperatingKm = (from: StationHit, to: StationHit) =>
  haversineKm(from.lon, from.lat, to.lon, to.lat) * 1.35;

type AreaLink =
  | { kind: 'same'; fromAreaId: string; toAreaId: string }
  | { kind: 'zone'; fromAreaId: string; toAreaId: string; zoneId: string }
  | { kind: 'bridge'; fromAreaId: string; toAreaId: string; note: string };

/**
 * 境界駅の副次的 icAreaIds ではなく primary icAreaId だけで判定する。
 * 熱海・米原の両社データを持たせても、異なる側同士を同一エリアにしない。
 */
function findAreaLink(from: StationHit, to: StationHit): AreaLink | null {
  const left = from.icAreaId;
  const right = to.icAreaId;
  if (!left || !right || ['none', 'shinkansen'].includes(left) || ['none', 'shinkansen'].includes(right)) return null;
  if (left === right) return { kind: 'same', fromAreaId: left, toAreaId: right };
  if (sameSfZone(left, right)) {
    const zoneId = getIcArea(left)?.sfZoneId;
    if (zoneId) return { kind: 'zone', fromAreaId: left, toAreaId: right, zoneId };
  }
  const bridge = canBridge(left, right);
  return bridge ? { kind: 'bridge', fromAreaId: left, toAreaId: right, note: bridge.note } : null;
}

function maxFareKm(link: AreaLink | null, fallback: string) {
  const ids = link ? [link.fromAreaId, link.toAreaId] : [fallback];
  const caps = ids.map((id) => getIcArea(id)?.rules.maxFareKm).filter((value): value is number => value != null);
  return caps.length ? Math.min(...caps) : null;
}

const rideDetail = (station: StationHit) => {
  if (station.icRide === 'none') return `${station.name}はIC乗車不可`;
  if (station.icRide === 'partial') return `${station.name}は一部対応`;
  if (station.icRide === 'limited') return `${station.name}は条件付き対応`;
  return `${station.name}はIC乗車可`;
};

export function evaluateJourney(from: StationHit, to: StationHit): JourneyResult {
  const displayedFromAreas = stationAreaIds(from);
  const displayedToAreas = stationAreaIds(to);
  const fromAreaLabel = displayIcAreas(displayedFromAreas);
  const toAreaLabel = displayIcAreas(displayedToAreas);
  const approxFareKm = approxOperatingKm(from, to);
  const notes = ['距離は地図上の直線距離に経路係数を掛けた概算です'];
  if (from.boundaryNote) notes.push(from.boundaryNote);
  if (to.boundaryNote && to.boundaryNote !== from.boundaryNote) notes.push(to.boundaryNote);

  const sameStation = from.id === to.id ||
    (from.name === to.name && from.icAreaId === to.icAreaId && from.line === to.line);
  const fromIcOk = from.icRide !== 'none';
  const toIcOk = to.icRide !== 'none';
  const knownAreas = Boolean(getIcArea(from.icAreaId) && getIcArea(to.icAreaId));
  const link = sameStation ? null : findAreaLink(from, to);
  const cap = maxFareKm(link, from.icAreaId);

  let areaOk: boolean | null = null;
  let areaDetail = '発着が同一駅のため対象外';
  if (!sameStation && !knownAreas) areaDetail = 'IC利用可能エリアを公式情報で確認できません';
  else if (!sameStation && !link) {
    areaOk = false;
    areaDetail = `エリアまたぎ不可（発 ${fromAreaLabel || '不明'}、着 ${toAreaLabel || '不明'}）`;
  } else if (link?.kind === 'same') {
    areaOk = true;
    areaDetail = `同一エリア（${displayIcAreas([link.fromAreaId])}）`;
  } else if (link?.kind === 'zone') {
    areaOk = true;
    areaDetail = `${sfZoneLabel(link.zoneId)}内のSF対象`;
  } else if (link?.kind === 'bridge') {
    areaOk = true;
    areaDetail = '例外またぎの対象';
    notes.push(link.note);
  }

  let kmOk: boolean | null = null;
  let kmDetail = sameStation ? '対象外' : 'この区間に営業キロ上限の設定なし';
  if (!sameStation && cap != null) {
    if (approxFareKm <= cap) {
      kmOk = true;
      kmDetail = `概算 ${approxFareKm.toFixed(1)} km（上限目安 ${cap} km）`;
    } else {
      const ids = link ? [link.fromAreaId, link.toAreaId] : [from.icAreaId, to.icAreaId];
      const exception = shouldApplyIcocaKmExceptions(ids) ? evaluateIcocaKmException(from, to) : null;
      kmOk = Boolean(exception);
      kmDetail = exception
        ? `概算 ${approxFareKm.toFixed(1)} km。${exception.label}`
        : `概算 ${approxFareKm.toFixed(1)} km が上限目安 ${cap} kmを超過`;
      if (exception) notes.push(exception.label);
    }
  }

  const latch = sameStation ? null : canThroughLatch(from, to);
  let latchOk: boolean | null = sameStation ? null : latch?.ok ?? null;
  if (link?.kind === 'bridge' && latchOk === false) latchOk = true;
  const latchDetail = sameStation ? '対象外' : latchOk
    ? latch?.viaHubs?.length ? `接続 ${latch.viaHubs.join('、')}` : '連続利用の接続あり'
    : latch?.note ?? '未評価';

  const checks: JourneyCheck[] = [
    { id: 'from_ic', label: '発駅IC', ok: fromIcOk, detail: rideDetail(from) },
    { id: 'to_ic', label: '着駅IC', ok: toIcOk, detail: rideDetail(to) },
    { id: 'area', label: 'エリア', ok: areaOk, detail: areaDetail },
    { id: 'fare_km', label: '営業キロ', ok: kmOk, detail: kmDetail },
    { id: 'latch', label: 'ラッチ接続', ok: latchOk, detail: latchDetail },
  ];

  let verdict: JourneyVerdict = 'ok';
  let usable: boolean | null = true;
  if (sameStation) { verdict = 'same_station'; usable = false; }
  else if (!fromIcOk || !toIcOk) { verdict = 'station_blocked'; usable = false; }
  else if (!knownAreas) { verdict = 'unknown_area'; usable = null; }
  else if (areaOk === false) { verdict = 'cross_area'; usable = false; }
  else if (kmOk === false) { verdict = 'over_km'; usable = false; }
  else if (latchOk === false) { verdict = 'no_through_latch'; usable = false; }
  else if (link?.kind === 'bridge') verdict = 'bridge';

  return {
    verdict, usable, segmentIcOk: fromIcOk && toIcOk,
    includesOutsideTransfer: latch?.includesOutsideTransfer ?? false,
    checks, from, to, fromAreaLabel, toAreaLabel,
    approxFareKm: sameStation ? 0 : approxFareKm, maxFareKm: cap,
    reasons: [areaDetail], notes,
  };
}
