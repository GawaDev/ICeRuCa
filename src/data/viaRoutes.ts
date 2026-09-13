import type { StationHit } from './journey';

export type LineGraphEdge = { a: string; b: string; station: string };
export type LineGraphData = { note?: string; lines: string[]; edges: LineGraphEdge[] };
export type ViaLeg = { operator: string; line: string };
export type ViaRoute = { legs: ViaLeg[]; transfers: string[]; summary: string; note: string };

export const lineKeyOf = (value: { operator: string; line: string }) =>
  `${value.operator}\t${value.line}`;

export function parseLineKey(key: string): ViaLeg {
  const separator = key.indexOf('\t');
  return separator < 0
    ? { operator: '', line: key }
    : { operator: key.slice(0, separator), line: key.slice(separator + 1) };
}

export function formatViaSummary(legs: ViaLeg[], transfers: string[]) {
  if (!legs.length) return '';
  const parts = [legs[0].line];
  transfers.forEach((station, index) => parts.push(`（${station}）`, legs[index + 1]?.line ?? ''));
  return parts.filter(Boolean).join(' → ');
}

export function findViaRoute(
  from: StationHit,
  to: StationHit,
  graph: LineGraphData | null | undefined,
): ViaRoute | null {
  const start = lineKeyOf(from);
  const goal = lineKeyOf(to);
  if (start.includes('新幹線') || goal.includes('新幹線')) return null;
  if (start === goal) {
    const leg = parseLineKey(start);
    return { legs: [leg], transfers: [], summary: leg.line, note: '同一路線内の発着です' };
  }
  if (!graph?.edges.length) return null;

  const adjacency = new Map<string, Array<{ to: string; station: string }>>();
  for (const edge of graph.edges) {
    if (edge.a.includes('新幹線') || edge.b.includes('新幹線')) continue;
    if (!adjacency.has(edge.a)) adjacency.set(edge.a, []);
    if (!adjacency.has(edge.b)) adjacency.set(edge.b, []);
    adjacency.get(edge.a)!.push({ to: edge.b, station: edge.station });
    adjacency.get(edge.b)!.push({ to: edge.a, station: edge.station });
  }

  const queue = [start];
  const seen = new Set(queue);
  const previous = new Map<string, { from: string; station: string }>();
  while (queue.length) {
    const current = queue.shift()!;
    for (const step of adjacency.get(current) ?? []) {
      if (seen.has(step.to)) continue;
      seen.add(step.to);
      previous.set(step.to, { from: current, station: step.station });
      if (step.to === goal) {
        const keys = [goal];
        const transfers: string[] = [];
        while (keys[0] !== start) {
          const prior = previous.get(keys[0])!;
          transfers.unshift(prior.station);
          keys.unshift(prior.from);
        }
        const legs = keys.map(parseLineKey);
        return { legs, transfers, summary: formatViaSummary(legs, transfers), note: '乗換回数が最少の路線列です' };
      }
      queue.push(step.to);
    }
  }
  return null;
}
