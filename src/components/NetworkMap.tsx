import { stations, checkCompatibility, type ResultStatus } from '../data/catalog';

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
  const point = ([lat, lon]: [number, number]) => ({
    x: 50 + (lon - 127) * 43,
    y: 570 - (lat - 26) * 37,
  });
  return (
    <svg className="networkMap" viewBox="0 0 650 620" role="img" aria-label="IC利用エリアの駅略図">
      <path className="japanGuide" d="M75 565C190 525 245 455 295 390s105-105 150-180S510 80 570 35" />
      {lineGroups.map((ids) => (
        <polyline key={ids.join('-')} className="railGuide"
          points={ids.map((id) => {
            const { x, y } = point(stations.find((station) => station.id === id)!.position);
            return `${x},${y}`;
          }).join(' ')} />
      ))}
      {stations.map((station) => {
        const result = station.areaId
          ? checkCompatibility(cardId, station.areaId)
          : { status: 'unknown' as const };
        const selected = station.id === selectedStationId;
        return (
          <g key={station.id} className="stationPoint" role="button" tabIndex={0}
            aria-label={`${station.name}・${station.line}`}
            onClick={() => onSelectStation(station.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onSelectStation(station.id);
            }}>
            <circle cx={point(station.position).x} cy={point(station.position).y}
              r={selected ? 10 : 7} fill={statusColor[result.status]}
              stroke={selected ? '#0c4a6e' : '#fff'} strokeWidth={selected ? 4 : 2} />
            <title>{station.name}・{station.line}</title>
          </g>
        );
      })}
      <g className="mapLegend" transform="translate(20 20)">
        <rect width="178" height="112" rx="5" />
        {Object.entries(statusColor).map(([status, color], index) => (
          <g key={status} transform={`translate(12 ${19 + index * 23})`}>
            <circle r="6" fill={color} />
            <text x="13" y="4">{statusMetaLabel(status as ResultStatus)}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function statusMetaLabel(status: ResultStatus) {
  return {
    available: '利用できます',
    conditional: '条件があります',
    unavailable: '利用できません',
    unknown: '未確認',
  }[status];
}
