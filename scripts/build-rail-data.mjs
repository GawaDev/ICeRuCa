import { mkdir, readFile, writeFile } from 'node:fs/promises';

const inputPath = new URL('../data/raw/n02.geojson', import.meta.url);
const outputDir = new URL('../public/data/', import.meta.url);
await mkdir(outputDir, { recursive: true });

let source;
try {
  source = JSON.parse(await readFile(inputPath, 'utf8'));
} catch {
  source = { type: 'FeatureCollection', features: [] };
}

const features = (source.features ?? [])
  .filter((feature) => ['LineString', 'MultiLineString', 'Point'].includes(feature.geometry?.type))
  .map((feature) => ({
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
      line: feature.properties?.N02_003 ?? feature.properties?.line ?? '',
      operator: feature.properties?.N02_004 ?? feature.properties?.operator ?? '',
      station: feature.properties?.N02_005 ?? feature.properties?.station ?? '',
    },
  }));
const stationIndex = features
  .filter((feature) => feature.properties.station)
  .map((feature, index) => ({
    id: `n02-${index}`,
    name: feature.properties.station,
    line: feature.properties.line,
    operator: feature.properties.operator,
    position: feature.geometry.type === 'Point'
      ? [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
      : null,
  }));

await writeFile(new URL('railroads.geojson', outputDir), JSON.stringify({
  type: 'FeatureCollection',
  features,
}));
await writeFile(new URL('station-index.json', outputDir), JSON.stringify(stationIndex));
await writeFile(new URL('meta.json', outputDir), JSON.stringify({
  source: '国土数値情報（鉄道データ）N02-2025',
  publisher: '国土交通省',
  license: 'CC BY 4.0',
  processedAt: new Date().toISOString(),
  featureCount: features.length,
  stationCount: stationIndex.length,
}, null, 2));

console.log(`${features.length}件の地図要素を書き出しました。`);
