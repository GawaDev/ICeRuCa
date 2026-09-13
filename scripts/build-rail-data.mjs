import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { OPERATOR_TO_AREA, SHINKANSEN_OPERATOR_TYPE } from './operator-area.mjs';
import { resolveIcAreaId } from './ic-area-masks.mjs';
import { matchException, STATION_EXCEPTIONS, AREA_INTRA_RULES } from './ic-station-exceptions.mjs';
import { matchBoundaryStation, CONNECTION_STATIONS } from './ic-connection-stations.mjs';

const outputDir = new URL('../public/data/', import.meta.url);
await mkdir(outputDir, { recursive: true });

async function load(url) {
  try { return JSON.parse(await readFile(url, 'utf8')); }
  catch { return { type: 'FeatureCollection', features: [] }; }
}

async function loadFirst(urls) {
  for (const url of urls) {
    const data = await load(url);
    if (data.features?.length) return data;
  }
  return { type: 'FeatureCollection', features: [] };
}

const combined = await load(new URL('../data/raw/n02.geojson', import.meta.url));
const railroad = combined.features?.length
  ? combined
  : await loadFirst([
      new URL('../data/raw/n02/N02-25_GML/UTF-8/N02-25_RailroadSection.geojson', import.meta.url),
      new URL('../data/raw/n02/N02-25_GML/N02-25_GML/UTF-8/N02-25_RailroadSection.geojson', import.meta.url),
    ]);
const stationSource = combined.features?.length
  ? combined
  : await loadFirst([
      new URL('../data/raw/n02/N02-25_GML/UTF-8/N02-25_Station.geojson', import.meta.url),
      new URL('../data/raw/n02/N02-25_GML/N02-25_GML/UTF-8/N02-25_Station.geojson', import.meta.url),
    ]);

function sourceStats(source) {
  const unmapped = new Map();
  let shinkansen = 0;
  let catalogMapped = 0;
  let noIcAssignment = 0;
  for (const feature of source.features ?? []) {
    const properties = feature.properties ?? {};
    const operator = properties.N02_004 ?? properties.operator ?? '（事業者名なし）';
    const line = properties.N02_003 ?? properties.line ?? '';
    if (String(properties.N02_002 ?? '') === SHINKANSEN_OPERATOR_TYPE || line.includes('新幹線')) {
      shinkansen += 1;
      continue;
    }
    const mapped = OPERATOR_TO_AREA[operator];
    if (!mapped) {
      unmapped.set(operator, (unmapped.get(operator) ?? 0) + 1);
    } else if (mapped === 'other') {
      noIcAssignment += 1;
    } else {
      catalogMapped += 1;
    }
  }
  return {
    sourceFeatures: source.features?.length ?? 0,
    catalogMapped,
    noIcAssignment,
    shinkansen,
    unmappedFeatures: [...unmapped.values()].reduce((sum, count) => sum + count, 0),
    unmappedOperators: Object.fromEntries(
      [...unmapped.entries()].sort((left, right) => right[1] - left[1]),
    ),
  };
}

const railroadSourceStats = sourceStats(railroad);
const stationSourceStats = sourceStats(stationSource);

const centroid = (geometry) => {
  if (!geometry) return null;
  if (geometry.type === 'Point') return geometry.coordinates;
  const coordinates = geometry.type === 'MultiLineString' ? geometry.coordinates.flat() : geometry.coordinates;
  if (!coordinates?.length) return null;
  const sum = coordinates.reduce(([x, y], point) => [x + point[0], y + point[1]], [0, 0]);
  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
};
const round = (number) => Math.round(number * 1e5) / 1e5;

function classify(feature, station = false) {
  const properties = feature.properties ?? {};
  const operator = properties.N02_004 ?? properties.operator ?? '';
  const line = properties.N02_003 ?? properties.line ?? '';
  const name = properties.N02_005 ?? properties.station ?? '';
  const operatorType = String(properties.N02_002 ?? '');
  const point = centroid(feature.geometry);
  if (!point) return null;
  if (operatorType === SHINKANSEN_OPERATOR_TYPE || line.includes('新幹線')) {
    return station ? { brandId: 'shinkansen', icAreaId: 'shinkansen', icRide: 'none', operator, line, name, point } : null;
  }
  const brandId = OPERATOR_TO_AREA[operator] ?? 'none';
  const icAreaId = brandId === 'none' ? 'none' : resolveIcAreaId(point[0], point[1], brandId, operator) ?? 'none';
  if (!station && icAreaId === 'none') return null;
  const exception = brandId === 'none' ? null : matchException(name, brandId, line);
  return { brandId, icAreaId, icRide: exception?.icRide ?? (icAreaId === 'none' ? 'none' : 'full'), operator, line, name, point, exception };
}

const railroads = railroad.features
  .map((feature) => ({ feature, classified: classify(feature) }))
  .filter((row) => row.classified)
  .map(({ feature, classified }) => ({
    type: 'Feature',
    geometry: feature.geometry,
    properties: { areaId: classified.brandId, icAreaId: classified.icAreaId, line: classified.line, operator: classified.operator },
  }));

const stationIndex = stationSource.features
  .filter((feature) => (feature.properties?.N02_005 ?? feature.properties?.station))
  .map((feature) => classify(feature, true))
  .filter(Boolean)
  .map((station, index) => {
    const connection = matchBoundaryStation(station.name, station.operator);
    const icAreaIds = [...new Set([station.icAreaId, ...(connection?.icAreaIds ?? [])].filter((id) => id !== 'none'))];
    return {
      id: `${station.icAreaId}:${station.name}:${station.line}:${index}`,
      name: station.name,
      line: station.line,
      operator: station.operator,
      brandId: station.brandId,
      icAreaId: station.icAreaId,
      icAreaIds,
      icRide: station.icRide,
      lon: round(station.point[0]),
      lat: round(station.point[1]),
      ...(station.exception ? { icReason: station.exception.reason } : {}),
      ...(connection ? { boundaryNote: connection.note, connectionIds: [connection.id] } : {}),
    };
  });

railroadSourceStats.areaMatched = railroads.length;
railroadSourceStats.outsideCatalogArea = Math.max(
  0,
  railroadSourceStats.catalogMapped - railroads.length,
);
stationSourceStats.areaMatched = stationIndex.filter(
  (station) => !['none', 'shinkansen'].includes(station.icAreaId),
).length;
stationSourceStats.outsideCatalogArea = stationIndex.filter(
  (station) =>
    !['none', 'other', 'shinkansen'].includes(station.brandId) &&
    station.icAreaId === 'none',
).length;

function buildGraph(stations) {
  const byName = new Map();
  for (const station of stations) {
    if (station.line.includes('新幹線')) continue;
    if (!byName.has(station.name)) byName.set(station.name, []);
    byName.get(station.name).push(`${station.operator}\t${station.line}`);
  }
  const edgeMap = new Map();
  for (const [name, keys] of byName) {
    const unique = [...new Set(keys)];
    for (let i = 0; i < unique.length; i += 1) for (let j = i + 1; j < unique.length; j += 1) {
      const [a, b] = unique[i] < unique[j] ? [unique[i], unique[j]] : [unique[j], unique[i]];
      edgeMap.set(`${a}\n${b}`, { a, b, station: name });
    }
  }
  return { note: '同名駅の在来線を結ぶ経由路線グラフ', lines: [...new Set(stations.filter((s) => !s.line.includes('新幹線')).map((s) => `${s.operator}\t${s.line}`))], edges: [...edgeMap.values()] };
}

const lineGraph = buildGraph(stationIndex);
const stationFeatures = stationIndex.map((station) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [station.lon, station.lat] },
  properties: station,
}));
const operatorEdges = [];
for (const connection of CONNECTION_STATIONS) {
  for (let i = 0; i < connection.operators.length; i += 1) for (let j = i + 1; j < connection.operators.length; j += 1) {
    operatorEdges.push({ a: connection.operators[i], b: connection.operators[j], station: connection.name });
  }
}

await writeFile(new URL('railroads.geojson', outputDir), JSON.stringify({ type: 'FeatureCollection', features: railroads }));
await writeFile(new URL('stations.geojson', outputDir), JSON.stringify({ type: 'FeatureCollection', features: stationFeatures }));
await writeFile(new URL('station-index.json', outputDir), JSON.stringify({ note: 'N02全駅。IC非対応・新幹線もnoneとして保持', stations: stationIndex }));
await writeFile(new URL('line-graph.json', outputDir), JSON.stringify(lineGraph));
await writeFile(new URL('operator-latch.json', outputDir), JSON.stringify({ edges: operatorEdges }));
await writeFile(new URL('../src/data/generatedOperatorLatch.json', import.meta.url), JSON.stringify({ note: 'N02と接続駅カタログから生成', edges: operatorEdges }, null, 2));
await writeFile(new URL('station-exceptions.json', outputDir), JSON.stringify({ rules: AREA_INTRA_RULES, stations: STATION_EXCEPTIONS }, null, 2));
await writeFile(new URL('meta.json', outputDir), JSON.stringify({
  source: '国土数値情報（鉄道データ）N02-2025',
  sourceUrl: 'https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-2025.html',
  license: 'CC BY 4.0',
  note: 'N02は地図形状と事業者名の照合にのみ使用。IC利用可否は公式案内に基づく事業者カタログ・エリアマスク・駅例外で付与。',
  generatedAt: new Date().toISOString(),
  railroads: railroads.length,
  stations: stationIndex.length,
  railroadSource: railroadSourceStats,
  stationSource: stationSourceStats,
  lineGraph: { lines: lineGraph.lines.length, edges: lineGraph.edges.length },
}, null, 2));

console.log(JSON.stringify({
  railroads: railroads.length,
  stations: stationIndex.length,
  railroadSource: railroadSourceStats,
  stationSource: stationSourceStats,
}, null, 2));
