import { readFileSync } from 'node:fs';

export const CONNECTION_STATIONS = JSON.parse(
  readFileSync(new URL('../src/data/connectionStations.json', import.meta.url), 'utf8'),
);

export const matchConnectionStations = (name, operator) =>
  CONNECTION_STATIONS.filter((station) =>
    (station.name === name || station.aliases?.includes(name)) &&
    station.operators.includes(operator),
  );

export const matchBoundaryStation = (name, operator) =>
  matchConnectionStations(name, operator)[0] ?? null;
