import { CONNECTION_STATIONS, LATCH_SPUR_OPERATORS, type TransferKind } from './connectionStations';
import generated from './generatedOperatorLatch.json';

type Edge = { a: string; b: string; station: string; transfer: TransferKind };
type Hub = { name: string; transfer: TransferKind };

const edges: Edge[] = [];
for (const station of CONNECTION_STATIONS) {
  for (let i = 0; i < station.operators.length; i += 1) {
    for (let j = i + 1; j < station.operators.length; j += 1) {
      edges.push({ a: station.operators[i], b: station.operators[j], station: station.name, transfer: station.transfer });
    }
  }
}
for (const edge of generated.edges as Array<{ a: string; b: string; station: string }>) {
  edges.push({ ...edge, transfer: 'inside' });
}

function normalize(station: { operator: string; line: string }) {
  if (station.line.includes('東京モノレール') || station.line.includes('羽田空港線')) return '東京モノレール';
  if (station.line.includes('ゆりかもめ')) return 'ゆりかもめ';
  return station.operator;
}

function directHubs(a: string, b: string): Hub[] {
  return edges
    .filter((edge) => (edge.a === a && edge.b === b) || (edge.a === b && edge.b === a))
    .map((edge) => ({ name: edge.station, transfer: edge.transfer }));
}

export type LatchResult = {
  ok: boolean;
  fromOperator: string;
  toOperator: string;
  viaHubs?: string[];
  includesOutsideTransfer?: boolean;
  includesGateChoice?: boolean;
  note?: string;
};

export function canThroughLatch(
  from: { operator: string; line: string },
  to: { operator: string; line: string },
): LatchResult {
  const fromOperator = normalize(from);
  const toOperator = normalize(to);
  if (fromOperator === toOperator) return { ok: true, fromOperator, toOperator };

  const summarize = (hubs: Hub[]): LatchResult => ({
    ok: true,
    fromOperator,
    toOperator,
    viaHubs: [...new Set(hubs.map((hub) => hub.name))],
    includesOutsideTransfer: hubs.some((hub) => hub.transfer === 'outside'),
    includesGateChoice: hubs.some((hub) => hub.transfer === 'gate_choice'),
  });

  const direct = directHubs(fromOperator, toOperator);
  if (direct.length) return summarize(direct);
  if (LATCH_SPUR_OPERATORS.has(fromOperator) || LATCH_SPUR_OPERATORS.has(toOperator)) {
    return { ok: false, fromOperator, toOperator, note: 'この事業者は登録済みの直接接続以外を多段接続として扱いません' };
  }

  const adjacency = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    adjacency.get(a)!.add(b);
  };
  for (const edge of edges) {
    add(edge.a, edge.b);
    add(edge.b, edge.a);
  }

  const queue = [fromOperator];
  const previous = new Map<string, string>();
  const seen = new Set(queue);
  while (queue.length) {
    const current = queue.shift()!;
    for (const next of adjacency.get(current) ?? []) {
      if (seen.has(next) || (LATCH_SPUR_OPERATORS.has(next) && next !== toOperator)) continue;
      seen.add(next);
      previous.set(next, current);
      if (next === toOperator) {
        const path = [next];
        while (path[0] !== fromOperator) path.unshift(previous.get(path[0])!);
        const hubs = path.slice(0, -1).flatMap((operator, index) => directHubs(operator, path[index + 1]));
        return summarize(hubs);
      }
      queue.push(next);
    }
  }
  return { ok: false, fromOperator, toOperator, note: '発着事業者を結ぶ接続駅がカタログ上ありません' };
}

export const latchGroupOf = normalize;
