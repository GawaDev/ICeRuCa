export const IC_AREA_MASKS = {
  'kitaca-sapporo': [{ name: '札幌・旭川', bbox: [140.95, 42.78, 142.45, 43.85] }],
  'kitaca-hakodate': [{ name: '函館', bbox: [140.55, 41.7, 140.95, 42.05] }],
  'suica-shutoken': [
    { name: '首都圏・伊豆東岸', bbox: [138.45, 34.6, 140.95, 36.95] },
    { name: '長野寄り', bbox: [137.9, 35.85, 138.55, 36.85] },
  ],
  'suica-sendai': [{ name: '仙台・一ノ関・会津周辺', bbox: [139.85, 37.45, 141.52, 39.0] }],
  'suica-niigata': [{ name: '新潟・柏崎・直江津周辺', bbox: [138.2, 37.1, 139.55, 38.3] }],
  'suica-morioka': [{ name: '盛岡', bbox: [140.9, 39.55, 141.35, 39.9] }],
  'suica-akita': [{ name: '秋田', bbox: [139.95, 39.55, 140.35, 39.85] }],
  'suica-aomori': [{ name: '青森', bbox: [140.55, 40.7, 141.35, 41.0] }],
  'suica-okinawa': [{ name: '沖縄', bbox: [127.64, 26.17, 127.72, 26.24] }],
  'pasmo-shutoken': [{ name: '首都圏民鉄', bbox: [138.9, 35.05, 140.55, 36.35] }],
  'kanto-railway': [{ name: '常総・竜ヶ崎', bbox: [139.9, 35.85, 140.2, 36.25] }],
  'toica-tokai': [
    { name: '名古屋・静岡・米原', bbox: [136.27, 34.55, 139.15, 35.55] },
    { name: '高山線寄り', bbox: [136.85, 35.45, 137.35, 36.35] },
  ],
  'manaca-chukyo': [{ name: '中京圏', bbox: [136.55, 34.7, 137.55, 35.45] }],
  'icoca-jr-west': [
    { name: '近畿・中国', bbox: [130.85, 33.45, 136.55, 35.75] },
    { name: '北陸JR西', bbox: [135.95, 35.85, 137.55, 37.15] },
  ],
  'icoca-ir': [{ name: '石川・富山三セク圏', bbox: [136.55, 36.45, 137.85, 37.15] }],
  'icoca-ainokaze': [{ name: '石川・富山三セク圏', bbox: [136.55, 36.45, 137.85, 37.15] }],
  'icoca-hapi': [{ name: 'ハピライン', bbox: [135.95, 35.9, 136.55, 36.35] }],
  'icoca-shikoku': [{ name: '四国', bbox: [132.4, 33.7, 134.45, 34.5] }],
  'pitapa-kinki': [{ name: '近畿圏民鉄・近鉄名古屋線', bbox: [134.35, 34.15, 136.92, 35.25] }],
  'pitapa-okayama': [{ name: '岡山電軌', bbox: [133.85, 34.6, 134.0, 34.72] }],
  'pitapa-shizuoka': [{ name: '静岡鉄道', bbox: [138.35, 34.9, 138.45, 35.05] }],
  'sugoca-north': [{ name: '北部九州', bbox: [129.65, 32.45, 131.95, 33.95] }],
  'sugoca-kagoshima': [{ name: '鹿児島', bbox: [130.4, 31.35, 130.85, 31.85] }],
  'sugoca-miyazaki': [{ name: '宮崎', bbox: [131.3, 31.75, 131.7, 32.1] }],
  'nimoca-fukuoka': [
    { name: '九州各地', bbox: [129.65, 32.55, 131.05, 33.95] },
    { name: '函館', bbox: [140.68, 41.72, 140.82, 41.82] },
  ],
  'hayakaken-fukuoka': [{ name: '福岡市地下鉄', bbox: [130.32, 33.52, 130.48, 33.66] }],
  'sapica-sapporo': [{ name: '札幌市交', bbox: [141.2, 42.95, 141.5, 43.2] }],
  'icsca-sendai': [{ name: '仙台市交', bbox: [140.75, 38.15, 141.05, 38.35] }],
  'iruca-kotoden': [{ name: 'ことでん', bbox: [133.9, 34.22, 134.15, 34.4] }],
  'ryuto-niigata': [{ name: '新潟交通', bbox: [138.95, 37.82, 139.2, 38.0] }],
  'nitas-nagasaki': [{ name: '長崎バス圏', bbox: [129.75, 32.65, 130.05, 32.9] }],
};

export const BRAND_TO_IC_AREAS = {
  kitaca: ['kitaca-sapporo', 'kitaca-hakodate'],
  suica: ['suica-shutoken', 'suica-sendai', 'suica-niigata', 'suica-morioka', 'suica-akita', 'suica-aomori', 'suica-okinawa'],
  pasmo: ['pasmo-shutoken'],
  'kanto-railway': ['kanto-railway'],
  toica: ['toica-tokai'],
  manaca: ['manaca-chukyo'],
  icoca: ['icoca-jr-west', 'icoca-ir', 'icoca-ainokaze', 'icoca-hapi', 'icoca-shikoku'],
  pitapa: ['pitapa-okayama', 'pitapa-shizuoka', 'pitapa-kinki'],
  sugoca: ['sugoca-north', 'sugoca-kagoshima', 'sugoca-miyazaki'],
  nimoca: ['nimoca-fukuoka'],
  hayakaken: ['hayakaken-fukuoka'],
  sapica: ['sapica-sapporo'],
  icsca: ['icsca-sendai'],
  iruca: ['iruca-kotoden'],
  ryuto: ['ryuto-niigata'],
  nitas: ['nitas-nagasaki'],
};

const OPERATOR_HINT = {
  西日本旅客鉄道: 'icoca-jr-west',
  四国旅客鉄道: 'icoca-shikoku',
  あいの風とやま鉄道: 'icoca-ainokaze',
  'IRいしかわ鉄道': 'icoca-ir',
  ハピラインふくい: 'icoca-hapi',
  岡山電気軌道: 'pitapa-okayama',
  静岡鉄道: 'pitapa-shizuoka',
  伊豆急行: 'suica-shutoken',
  北陸鉄道: 'icoca-jr-west',
  'WILLER　TRAINS': 'icoca-jr-west',
  和歌山電鐵: 'icoca-jr-west',
};

export const GEO_CLIP_OPERATORS = new Set([
  '北海道旅客鉄道', '東日本旅客鉄道', '東海旅客鉄道', '西日本旅客鉄道',
  '四国旅客鉄道', '九州旅客鉄道', '近畿日本鉄道', '名古屋鉄道',
  '東武鉄道', '西武鉄道', '小田急電鉄', '京成電鉄', '京阪電気鉄道',
  '南海電気鉄道', '阪急電鉄', '西日本鉄道', '広島電鉄',
  '富山地方鉄道', '伊予鉄道', '北陸鉄道',
]);

export const pointInBBox = (lon, lat, [minLon, minLat, maxLon, maxLat]) =>
  lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;

export function resolveIcAreaId(lon, lat, brandId, operatorName) {
  const hinted = OPERATOR_HINT[operatorName];
  if (hinted && IC_AREA_MASKS[hinted]?.some((mask) => pointInBBox(lon, lat, mask.bbox))) return hinted;
  for (const id of BRAND_TO_IC_AREAS[brandId] ?? [brandId]) {
    if (IC_AREA_MASKS[id]?.some((mask) => pointInBBox(lon, lat, mask.bbox))) return id;
  }
  return null;
}

export const inAreaMask = (lon, lat, brandId, operatorName) =>
  resolveIcAreaId(lon, lat, brandId, operatorName) != null;
