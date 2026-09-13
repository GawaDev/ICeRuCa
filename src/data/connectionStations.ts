import raw from './connectionStations.json';

export type TransferKind = 'inside' | 'outside' | 'gate_choice';
export type ConnectionStation = {
  id: string;
  name: string;
  aliases?: string[];
  operators: string[];
  icAreaIds: string[];
  latch: 'shared';
  transfer: TransferKind;
  note: string;
};

export const CONNECTION_STATIONS = raw as ConnectionStation[];
export const connectionsForStationName = (name: string) =>
  CONNECTION_STATIONS.filter((station) => station.name === name || station.aliases?.includes(name));
export const connectionById = (id: string) =>
  CONNECTION_STATIONS.find((station) => station.id === id);

export function fareLatchOperatorEdges(): [string, string][] {
  return CONNECTION_STATIONS.flatMap((station) =>
    station.operators.flatMap((left, index) =>
      station.operators.slice(index + 1).map((right) => [left, right] as [string, string]),
    ),
  );
}

export const sameLatchOperatorEdges = fareLatchOperatorEdges;
export const LATCH_SPUR_OPERATORS = new Set(['東京モノレール', 'ゆりかもめ']);
