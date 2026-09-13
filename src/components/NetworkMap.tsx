import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { companyByN02, resolveCompatibility, type CompatCode } from '../data';

const statusColor: Record<CompatCode | 'focus', string> = {
  full: '#16834a',
  ticket: '#16834a',
  oneway: '#1971c2',
  oneway_ticket: '#1971c2',
  limited: '#b26a00',
  no: '#b42318',
  unknown: '#667085',
  focus: '#16834a',
};

type Props = {
  cardId?: string;
  variantId?: string | null;
  companyId?: string;
  selectedStationId?: string | null;
  onSelectStation?: (id: string) => void;
};

type GeoFeature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>;
type GeoCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, Record<string, unknown>>;

const textProperty = (feature: GeoFeature, ...keys: string[]) => {
  for (const key of keys) {
    const value = feature.properties?.[key];
    if (typeof value === 'string' && value) return value;
  }
  return '';
};

export function NetworkMap({ cardId, variantId, companyId, selectedStationId, onSelectStation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let map: L.Map | null = null;
    Promise.all([
      fetch('/data/railroads.geojson').then((response) => response.ok ? response.json() : Promise.reject()),
      fetch('/data/stations.geojson').then((response) => response.ok ? response.json() : ({ type: 'FeatureCollection', features: [] })),
    ]).then(([railroads, stationData]: [GeoCollection, GeoCollection]) => {
      if (cancelled || !containerRef.current) return;
      if (!railroads.features.length && !stationData.features.length) {
        setState('empty');
        return;
      }
      setState('ready');
      map = L.map(containerRef.current, {
        center: [36.3, 137.3],
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        renderer: L.canvas({ padding: 0.5 }),
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const featureCode = (feature: GeoFeature): CompatCode | 'focus' => {
        const areaId = textProperty(feature, 'areaId', 'icAreaId', 'brandId');
        if (cardId && areaId) return resolveCompatibility(cardId, areaId, variantId).code;
        const operator = textProperty(feature, 'operator', 'N02_004');
        return companyId && companyByN02(operator)?.id === companyId ? 'focus' : 'unknown';
      };
      const railLayer = L.geoJSON(railroads, {
        style: (feature) => {
          const code = featureCode(feature as GeoFeature);
          return { color: statusColor[code], weight: code === 'focus' ? 5 : 3, opacity: code === 'unknown' ? 0.45 : 0.9 };
        },
        onEachFeature: (feature, layer) => {
          const line = textProperty(feature as GeoFeature, 'line', 'N02_003');
          const operator = textProperty(feature as GeoFeature, 'operator', 'N02_004');
          if (line || operator) layer.bindTooltip([operator, line].filter(Boolean).join(' '));
        },
      }).addTo(map);
      const stationLayer = L.geoJSON(stationData, {
        pointToLayer: (feature, latlng) => {
          const id = textProperty(feature as GeoFeature, 'id');
          const code = featureCode(feature as GeoFeature);
          const selected = id === selectedStationId;
          return L.circleMarker(latlng, {
            radius: selected ? 8 : 5,
            color: selected ? '#0c4a6e' : '#fff',
            fillColor: statusColor[code],
            fillOpacity: 1,
            weight: selected ? 3 : 1,
          });
        },
        onEachFeature: (feature, layer) => {
          const id = textProperty(feature as GeoFeature, 'id');
          const name = textProperty(feature as GeoFeature, 'name', 'station');
          const line = textProperty(feature as GeoFeature, 'line');
          layer.bindTooltip([name, line].filter(Boolean).join(' '));
          if (id && onSelectStation) layer.on('click', () => onSelectStation(id));
        },
      });
      const updateStations = () => {
        if (!map) return;
        if (map.getZoom() >= 8) stationLayer.addTo(map);
        else stationLayer.removeFrom(map);
      };
      map.on('zoomend', updateStations);
      updateStations();
      if (railroads.features.length) map.fitBounds(railLayer.getBounds(), { padding: [16, 16] });
    }).catch(() => {
      if (!cancelled) setState('error');
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [cardId, companyId, onSelectStation, selectedStationId, variantId]);

  return (
    <div className="networkMapHost" data-state={state}>
      <div ref={containerRef} className="networkMap" role="application" aria-label="IC利用エリアの地図" />
      {state === 'ready' && cardId && (
        <div className="mapLegend" aria-label="地図の色">
          <div><span style={{ background: statusColor.full }} />利用できます</div>
          <div><span style={{ background: statusColor.oneway }} />片方向に利用できます</div>
          <div><span style={{ background: statusColor.limited }} />条件があります</div>
          <div><span style={{ background: statusColor.no }} />利用できません</div>
          <div><span style={{ background: statusColor.unknown }} />公式情報で確認できません</div>
        </div>
      )}
      {state !== 'ready' && (
        <div className="mapEmpty">
          {state === 'loading' && '地図データを読み込んでいます'}
          {state === 'empty' && '実軌道・駅データは生成待ちです'}
          {state === 'error' && '地図データを読み込めませんでした'}
        </div>
      )}
    </div>
  );
}
