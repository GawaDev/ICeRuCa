import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { checkCompatibility, stations, type ResultStatus } from '../data/catalog';

const statusColor: Record<ResultStatus, string> = {
  available: '#16834a',
  conditional: '#b26a00',
  unavailable: '#b42318',
  unknown: '#667085',
};

const lineGroups = [
  ['tokyo', 'shinjuku'],
  ['sendai-jr', 'sendai-subway'],
  ['atami-central', 'nagoya', 'maibara-central'],
  ['maibara-west', 'osaka'],
];

type Props = {
  cardId: string;
  selectedStationId?: string;
  onSelectStation: (id: string) => void;
};

export function NetworkMap({ cardId, selectedStationId, onSelectStation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [36.3, 137.3],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    lineGroups.forEach((ids) => {
      L.polyline(
        ids.map((id) => stations.find((station) => station.id === id)!.position),
        { color: '#667085', weight: 3, dashArray: '6 5', opacity: 0.8 },
      ).addTo(map);
    });

    stations.forEach((station) => {
      const status = station.areaId
        ? checkCompatibility(cardId, station.areaId).status
        : 'unknown';
      const selected = station.id === selectedStationId;
      L.circleMarker(station.position, {
        radius: selected ? 10 : 7,
        color: selected ? '#0c4a6e' : '#ffffff',
        fillColor: statusColor[status],
        fillOpacity: 1,
        weight: selected ? 4 : 2,
      })
        .bindTooltip(`${station.name}・${station.line}`)
        .on('click', () => onSelectStation(station.id))
        .addTo(map);
    });

    const legend = new L.Control({ position: 'topleft' });
    legend.onAdd = () => {
      const element = L.DomUtil.create('div', 'mapLegend');
      element.innerHTML = [
        ['available', '利用できます'],
        ['conditional', '条件があります'],
        ['unavailable', '利用できません'],
        ['unknown', '未確認'],
      ].map(([status, label]) =>
        `<div><span style="background:${statusColor[status as ResultStatus]}"></span>${label}</div>`,
      ).join('');
      return element;
    };
    legend.addTo(map);

    return () => {
      map.remove();
    };
  }, [cardId, onSelectStation, selectedStationId]);

  return <div ref={containerRef} className="networkMap" role="application" aria-label="IC利用エリアの地図" />;
}
