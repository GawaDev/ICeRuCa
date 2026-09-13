const expand = (areaId, line, icRide, reason, names) =>
  names.map((name) => ({ areaId, line, icRide, reason, name }));

export const STATION_EXCEPTIONS = [
  ...expand('icoca', '山陰', 'none', '二重線区間の非対応駅', [
    '下山', '和知', '安栖里', '立木', '山家', '高津', '石原',
    '上川口', '下夜久野', '上夜久野', '梁瀬', '養父', '国府', '玄武洞',
  ]),
  ...expand('icoca', '舞鶴', 'none', '二重線区間の非対応駅', ['淵垣', '梅迫', '真倉']),
  ...expand('icoca', '播但', 'none', '二重線区間の非対応駅', ['長谷', '新井', '青倉']),
  { areaId: 'sugoca', name: '竜ケ水', aliases: ['竜ヶ水'], line: '日豊', icRide: 'none', reason: 'SUGOCA鹿児島エリア内の公式非対応駅' },
  ...expand('suica', '東北', 'none', 'Suica仙台エリア内の非対応駅', ['田尻', '瀬峰', '梅ケ沢', '新田', '石越', '油島', '花泉', '清水原', '有壁']),
  ...expand('suica', undefined, 'partial', 'Suica一部対応駅', ['一ノ関', '作並', '山形', '古川', '会津若松', '喜多方', '小千谷', '柏崎', '直江津', '村上']),
  ...expand('toica', '高山', 'limited', '特急利用時などの条件付き対応', ['下呂', '高山', '飛驒古川']),
];

export const AREA_INTRA_RULES = [
  { areaId: 'icoca', title: 'JR西日本管内は一体化', detail: '2018年9月15日以降は営業キロ200kmと駅・経路条件を確認します' },
  { areaId: 'icoca', title: '二重線区間', detail: '指定駅以外ではIC乗降できません' },
  { areaId: 'suica', title: '一部対応駅', detail: 'SF乗車以外の取扱いに制限があります' },
];

const normalize = (value) => value.replace(/駅$/, '').replace(/[ヶケヵカ]/g, 'ケ').replace(/驒/g, '騨');

export function matchException(stationName, areaId, line) {
  const normalized = normalize(stationName);
  return STATION_EXCEPTIONS.find((exception) => {
    if (exception.areaId !== areaId) return false;
    if (![exception.name, ...(exception.aliases ?? [])].map(normalize).includes(normalized)) return false;
    if (!exception.line || !line) return true;
    return line.includes(exception.line) || exception.line.includes(line.replace(/本?線$/, ''));
  }) ?? null;
}
