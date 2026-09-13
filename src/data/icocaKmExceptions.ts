export type KmStation = {
  name: string;
  line: string;
  operator: string;
  lon: number;
  lat: number;
  icAreaId: string;
  icAreaIds?: string[];
};

export type IcocaKmExceptionKind =
  | 'osaka_suburban_mutual'
  | 'yakumo_mutual'
  | 'suburban_ltd_exp'
  | 'hapi_jr_west';

export type IcocaKmException = {
  ok: true;
  kind: IcocaKmExceptionKind;
  label: string;
};

export const YAKUMO_STOPS = new Set([
  '岡山', '倉敷', '総社', '備中高梁', '新見', '生山', '根雨',
  '伯耆大山', '米子', '安来', '松江', '玉造温泉', '宍道', '出雲市',
]);

export const SUBURBAN_LTD_EXP_STOPS = new Set([
  '海南', '箕島', '藤並', '湯浅', '御坊', '南部', '紀伊田辺', '白浜',
  '周参見', '串本', '古座', '太地', '紀伊勝浦', '新宮', '敦賀',
  '柏原', '黒井', '福知山', '和田山', '八鹿', '江原', '豊岡',
  '城崎温泉', '香住', '浜坂', '日吉', '胡麻', '綾部', '西舞鶴',
  '東舞鶴', '福崎', '寺前', '生野', '竹田',
]);

const fullSuburbanLines = [
  '湖西', 'おおさか東', '大阪環状', '桜島', 'JR東西', '加古川',
  '草津', '奈良', '桜井', '片町', '和歌山', '阪和', '関西空港',
];

export function isOsakaSuburbanStation(station: KmStation): boolean {
  if (!['西日本旅客鉄道', '東海旅客鉄道'].includes(station.operator)) return false;
  if (station.line.includes('新幹線')) return false;
  if (fullSuburbanLines.some((line) => station.line.includes(line))) return true;
  if (station.name === '米原') return true;
  if (station.line.includes('東海道') && station.operator === '西日本旅客鉄道')
    return station.lon >= 135.17 && station.lon <= 136.32 && station.lat >= 34.62 && station.lat <= 35.36;
  if (station.line.includes('山陽') && station.operator === '西日本旅客鉄道')
    return station.lon >= 134.45 && station.lon <= 135.22 && station.lat >= 34.65 && station.lat <= 34.92;
  if (station.line.includes('福知山') && station.operator === '西日本旅客鉄道')
    return station.lon >= 135.04 && station.lon <= 135.45 && station.lat >= 34.72 && station.lat <= 35.13;
  if (station.line.includes('北陸') && station.operator === '西日本旅客鉄道')
    return station.lon >= 136.12 && station.lon <= 136.32 && station.lat >= 35.3 && station.lat <= 35.56;
  if (station.line.includes('赤穂') && station.operator === '西日本旅客鉄道')
    return station.lon >= 134.37 && station.lon <= 134.5 && station.lat >= 34.73 && station.lat <= 34.8;
  if (station.line.includes('山陰') && station.operator === '西日本旅客鉄道')
    return station.lon >= 135.45 && station.lon <= 135.78 && station.lat >= 34.98 && station.lat <= 35.12;
  if (station.line.includes('関西') && station.operator === '西日本旅客鉄道')
    return station.lon >= 135.48 && station.lon <= 136.3 && station.lat >= 34.55 && station.lat <= 34.9;
  return false;
}

const areaIds = (station: KmStation) =>
  station.icAreaIds?.length ? station.icAreaIds : [station.icAreaId];
const isHapi = (station: KmStation) =>
  station.operator === 'ハピラインふくい' || areaIds(station).includes('icoca-hapi');
const isJrWest = (station: KmStation) =>
  station.operator === '西日本旅客鉄道' && areaIds(station).some((id) => id.startsWith('icoca'));

const labels: Record<IcocaKmExceptionKind, string> = {
  osaka_suburban_mutual: '大阪近郊区間内相互発着の200km例外',
  yakumo_mutual: '特急やくも停車駅相互の200km例外',
  suburban_ltd_exp: '大阪近郊区間と指定特急停車駅相互の200km例外',
  hapi_jr_west: 'ハピラインふくいとJR西日本区間をまたぐ200km例外',
};

export function evaluateIcocaKmException(from: KmStation, to: KmStation): IcocaKmException | null {
  const fromSuburban = isOsakaSuburbanStation(from);
  const toSuburban = isOsakaSuburbanStation(to);
  let kind: IcocaKmExceptionKind | null = null;
  if (fromSuburban && toSuburban) kind = 'osaka_suburban_mutual';
  else if (YAKUMO_STOPS.has(from.name) && YAKUMO_STOPS.has(to.name)) kind = 'yakumo_mutual';
  else if ((fromSuburban && SUBURBAN_LTD_EXP_STOPS.has(to.name)) ||
           (toSuburban && SUBURBAN_LTD_EXP_STOPS.has(from.name))) kind = 'suburban_ltd_exp';
  else if ((isHapi(from) && isJrWest(to)) || (isHapi(to) && isJrWest(from))) kind = 'hapi_jr_west';
  return kind ? { ok: true, kind, label: labels[kind] } : null;
}

export function shouldApplyIcocaKmExceptions(ids: string[]) {
  return ids.some((id) => ['icoca-jr-west', 'icoca-hapi', 'icoca-ir', 'icoca-ainokaze', 'icoca-shikoku'].includes(id));
}
