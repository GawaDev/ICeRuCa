export const BOUNDARY_STATIONS = [
  { name: '熱海', operators: ['東日本旅客鉄道', '東海旅客鉄道'], icAreaIds: ['suica-shutoken', 'toica-tokai'], note: 'Suica・TOICA境界。primaryエリアは会社ごとに保持' },
  { name: '米原', operators: ['西日本旅客鉄道', '東海旅客鉄道'], icAreaIds: ['icoca-jr-west', 'toica-tokai'], note: 'ICOCA・TOICA境界。primaryエリアは会社ごとに保持' },
  { name: '下関', operators: ['西日本旅客鉄道', '九州旅客鉄道'], icAreaIds: ['icoca-jr-west', 'sugoca-north'], note: 'ICOCA・SUGOCA境界' },
  { name: '亀山', operators: ['西日本旅客鉄道', '東海旅客鉄道'], icAreaIds: ['icoca-jr-west', 'toica-tokai'], note: 'ICOCA・TOICA境界' },
  { name: '児島', operators: ['西日本旅客鉄道', '四国旅客鉄道'], icAreaIds: ['icoca-jr-west', 'icoca-shikoku'], note: 'JR西日本・JR四国接続' },
];

export const matchBoundaryStation = (name, operator) =>
  BOUNDARY_STATIONS.find((station) => station.name === name && station.operators.includes(operator)) ?? null;
