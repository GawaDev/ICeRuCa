import { useEffect, useMemo, useState } from 'react';
import {
  Accordion, ActionIcon, Alert, AppShell, Autocomplete, Badge, Box, Button, Group,
  Paper, ScrollArea, SegmentedControl, Select, SimpleGrid, Stack, Text, TextInput,
  ThemeIcon, Title, Tooltip, UnstyledButton,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconAlertTriangle, IconBuilding, IconCircleCheck, IconCircleX, IconCreditCard,
  IconHelpCircle, IconMinus, IconRoute, IconTicket, IconTransfer,
} from '@tabler/icons-react';
import {
  CARD_CATALOG, CARD_SERVICES, COMPANIES, IC_AREAS, SERVICE_CATEGORIES,
  SERVICE_COVERAGES, areasOfCompany, coveragesForCard,
  defaultVariantId, displayIcArea, evaluateJourney, findViaRoute, getCompany,
  getVariant, resolveCompatibility, searchCompanies, searchTransferGates,
  servicesForCard, variantsForCard, type CompatCode, type JourneyCheck,
  type JourneyResult, type LineGraphData, type ServiceCoverage, type StationHit,
} from './data';
import { NetworkMap } from './components/NetworkMap';
import { HelpModal } from './HelpModal';
import { ProductHeader } from './ui/AppChrome';
import './App.css';

type Perspective = 'card' | 'company' | 'journey' | 'transfer' | 'service';

const views = [
  { value: 'card', label: 'カード', icon: IconCreditCard },
  { value: 'company', label: '会社', icon: IconBuilding },
  { value: 'journey', label: '駅間検索', icon: IconRoute },
  { value: 'transfer', label: '乗換改札', icon: IconTransfer },
  { value: 'service', label: 'サービス', icon: IconTicket },
] as const;

const compatMeta: Record<CompatCode, { label: string; color: string; ok: boolean | null }> = {
  full: { label: '利用できます', color: 'green', ok: true },
  ticket: { label: '交通利用できます', color: 'green', ok: true },
  oneway: { label: '片方向に利用できます', color: 'blue', ok: true },
  oneway_ticket: { label: '片方向に交通利用できます', color: 'blue', ok: true },
  limited: { label: '条件があります', color: 'orange', ok: null },
  no: { label: '利用できません', color: 'red', ok: false },
  unknown: { label: '公式情報で確認できません', color: 'gray', ok: null },
};

function StatusIcon({ ok, label }: { ok: boolean | null; label: string }) {
  const Icon = ok === true ? IconCircleCheck : ok === false ? IconCircleX : IconMinus;
  return <ThemeIcon variant="light" color={ok === true ? 'green' : ok === false ? 'red' : 'gray'} aria-label={label}><Icon size={18} /></ThemeIcon>;
}

function CompatBadge({ code }: { code: CompatCode }) {
  const meta = compatMeta[code];
  return <Badge color={meta.color} variant="light">{meta.label}</Badge>;
}

function CardView({ cardId, setCardId }: { cardId: string; setCardId: (id: string) => void }) {
  const [variantId, setVariantId] = useState(defaultVariantId(cardId) ?? null);
  const [panel, setPanel] = useState<'map' | 'areas' | 'services' | 'exceptions'>('map');
  const variant = variantId ? getVariant(variantId) : undefined;
  const card = CARD_CATALOG.find((item) => item.id === cardId)!;
  const areaRows = IC_AREAS.map((area) => ({ area, result: resolveCompatibility(cardId, area.brandId, variantId) }));
  const serviceRows = [...servicesForCard(cardId), ...coveragesForCard(cardId)];

  const changeCard = (id: string | null) => {
    if (!id) return;
    setCardId(id);
    setVariantId(defaultVariantId(id) ?? null);
  };

  return (
    <Stack gap="md">
      <Paper withBorder p="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select label="カード" searchable value={cardId} onChange={changeCard}
            data={CARD_CATALOG.map((item) => ({ value: item.id, label: item.name }))} />
          <Select label="種類" value={variantId} onChange={(value) => value && setVariantId(value)}
            data={variantsForCard(cardId).map((item) => ({ value: item.id, label: item.name }))} />
        </SimpleGrid>
        <Group mt="sm" gap="xs">
          <Badge variant="outline">{card.issuer}</Badge>
          {variant?.features.mobile && <Badge variant="light">モバイル</Badge>}
          {variant?.features.child && <Badge variant="light">小児用</Badge>}
          {variant?.features.regionalService && <Badge variant="light">地域連携</Badge>}
        </Group>
      </Paper>
      <SegmentedControl aria-label="カード画面の表示切替" fullWidth value={panel} onChange={(value) => setPanel(value as typeof panel)}
        data={[
          { value: 'map', label: '地図' }, { value: 'areas', label: '全エリア' },
          { value: 'services', label: 'サービス' }, { value: 'exceptions', label: '駅例外' },
        ]} />
      {panel === 'map' && (
        <Stack gap="xs" className="mapPanel">
          <Group>
            <StatusIcon ok={true} label="交通利用" /><Text size="sm">交通利用</Text>
            <StatusIcon ok={variant?.features.emoney ?? null} label="電子マネー" /><Text size="sm">電子マネー</Text>
          </Group>
          <Box className="mapFrame"><NetworkMap cardId={cardId} variantId={variantId} /></Box>
          <Text size="xs" c="dimmed">背景地図 © OpenStreetMap contributors。鉄道形状は国土数値情報「鉄道データ」を表示します。駅はズーム8以上で表示します。</Text>
        </Stack>
      )}
      {panel === 'areas' && (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {areaRows.map(({ area, result }) => (
            <Paper key={area.id} withBorder p="sm">
              <Group justify="space-between" align="flex-start"><Text fw={700} size="sm">{displayIcArea(area)}</Text><CompatBadge code={result.code} /></Group>
              <Group mt="xs" gap="lg"><Text size="xs">交通 {result.fare === null ? '未確認' : result.fare ? '利用可' : '利用不可'}</Text><Text size="xs">電子マネー {result.emoney === null ? '未確認' : result.emoney ? '利用可' : '利用不可'}</Text></Group>
              {result.notes.map((note) => <Text key={note} size="xs" c="dimmed" mt={4}>{note}</Text>)}
            </Paper>
          ))}
        </SimpleGrid>
      )}
      {panel === 'services' && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {serviceRows.map((service) => (
            <Paper key={`${'category' in service ? 'card' : 'coverage'}-${service.id}`} withBorder p="md">
              <Badge variant="light" mb="xs">{'category' in service ? SERVICE_CATEGORIES[service.category] : coverageKind(service.kind)}</Badge>
              <Text fw={700}>{service.name}</Text><Text size="sm" c="dimmed">{service.summary}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      )}
      {panel === 'exceptions' && <StationExceptions />}
    </Stack>
  );
}

function StationExceptions() {
  const [message, setMessage] = useState('駅例外データを読み込んでいます');
  const [rows, setRows] = useState<Array<{ name: string; line?: string; reason: string; icRide: string }>>([]);
  useEffect(() => {
    fetch('/data/station-exceptions.json').then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        setRows(data.stations ?? []);
        setMessage((data.stations ?? []).length ? '' : '駅例外データは生成待ちです');
      }).catch(() => setMessage('駅例外データは生成待ちです'));
  }, []);
  if (message) return <Alert color="blue" title="駅例外">{message}</Alert>;
  return <Stack>{rows.map((row) => <Paper key={`${row.name}-${row.line}`} withBorder p="sm"><Group><StatusIcon ok={row.icRide === 'none' ? false : null} label={row.icRide} /><div><Text fw={700}>{row.name}</Text><Text size="xs">{row.line}</Text><Text size="sm" c="dimmed">{row.reason}</Text></div></Group></Paper>)}</Stack>;
}

function CompanyView() {
  const [query, setQuery] = useState('');
  const [companyId, setCompanyId] = useState(COMPANIES[0]?.id ?? '');
  const list = useMemo(() => searchCompanies(query), [query]);
  const company = getCompany(companyId);
  const areas = company ? areasOfCompany(company.id) : [];
  return (
    <div className="splitView">
      <Paper withBorder p="md" className="splitList">
        <TextInput label="会社を検索" placeholder="会社名またはエリア名" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
        <ScrollArea className="innerScroll" mt="sm"><Stack gap={4}>
          {list.map((item) => <UnstyledButton className="listButton" data-active={item.id === companyId || undefined} key={item.id} onClick={() => setCompanyId(item.id)}><Text fw={700} size="sm">{item.name}</Text><Text size="xs" c="dimmed">{areasOfCompany(item.id).length}エリア</Text></UnstyledButton>)}
        </Stack></ScrollArea>
      </Paper>
      <ScrollArea className="innerScroll"><Stack gap="md" p="md">
        {company && <><div><Title order={2}>{company.name}</Title><Text c="dimmed" size="sm">{company.region}</Text></div>
          {areas.map((area) => <Paper key={area.id} withBorder p="md"><Text fw={700}>{displayIcArea(area)}</Text><Group mt="xs">{area.rules.noCrossArea && <Badge variant="light">エリアまたぎ不可</Badge>}{area.rules.noViaOutside && <Badge variant="light">エリア外経由不可</Badge>}{area.rules.maxFareKm && <Badge color="orange" variant="light">営業キロ上限 {area.rules.maxFareKm}km</Badge>}</Group><Text mt="sm" size="sm">利用可能カード</Text><Group gap={4} mt={4}>{CARD_CATALOG.map((card) => ({ card, result: resolveCompatibility(card.id, area.brandId) })).filter(({ result }) => result.fare !== false).map(({ card, result }) => <Badge key={card.id} color={compatMeta[result.code].color} variant="outline">{card.name}</Badge>)}</Group></Paper>)}
          {!areas.length && <Alert color="blue">この会社のICエリアは登録待ちです</Alert>}
          <Box className="companyMap"><NetworkMap companyId={company.id} /></Box>
        </>}
      </Stack></ScrollArea>
    </div>
  );
}

function stationLabel(station: StationHit) {
  return `${station.name}（${station.line} ${station.operator}）`;
}

function JourneyView() {
  const [stations, setStations] = useState<StationHit[]>([]);
  const [lineGraph, setLineGraph] = useState<LineGraphData | null>(null);
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [result, setResult] = useState<JourneyResult | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch('/data/station-index.json').then((response) => response.json()),
      fetch('/data/line-graph.json').then((response) => response.ok ? response.json() : null),
    ]).then(([stationData, graph]) => {
      setStations(Array.isArray(stationData) ? stationData : stationData.stations ?? []);
      setLineGraph(graph);
    }).finally(() => setLoading(false));
  }, []);
  const uniqueStations = useMemo(
    () => [...new Map(stations.map((station) => [stationLabel(station), station])).values()],
    [stations],
  );
  const labels = useMemo(() => uniqueStations.map(stationLabel), [uniqueStations]);
  const run = () => {
    const from = uniqueStations.find((station) => stationLabel(station) === fromText);
    const to = uniqueStations.find((station) => stationLabel(station) === toText);
    if (from && to) setResult(evaluateJourney(from, to));
  };
  if (!loading && !stations.length) return <Alert color="blue" title="駅データ生成待ち">全駅データがまだ生成されていません。代表駅による代用は行いません。</Alert>;
  return (
    <Stack gap="md">
      <Paper withBorder p="md"><SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Autocomplete label="出発駅" placeholder="駅名を入力" data={labels} value={fromText} onChange={setFromText} limit={40} />
        <Autocomplete label="到着駅" placeholder="駅名を入力" data={labels} value={toText} onChange={setToText} limit={40} />
        <Button mt={{ base: 0, sm: 25 }} onClick={run}>確認する</Button>
      </SimpleGrid></Paper>
      {result && <JourneyResultView result={result} route={findViaRoute(result.from, result.to, lineGraph)} />}
    </Stack>
  );
}

function JourneyResultView({ result, route }: { result: JourneyResult; route: ReturnType<typeof findViaRoute> }) {
  const overall = result.usable === true ? '連続利用できる見込みです' : result.usable === false ? '連続利用できない見込みです' : '公式情報で確認できません';
  return <Stack>
    <Paper withBorder p="md"><Group><StatusIcon ok={result.usable} label={overall} /><div><Title order={3}>{overall}</Title><Text size="sm">{result.from.name}から{result.to.name}</Text><Text size="sm" c="dimmed">概算 {result.approxFareKm.toFixed(1)}km</Text></div></Group></Paper>
    <div className="checkStrip">{result.checks.map((check) => <CheckCard key={check.id} check={check} />)}</div>
    <Paper withBorder p="md"><Text fw={700}>経由路線</Text><Text size="sm">{route?.summary ?? `${result.from.line}から${result.to.line}の経路は特定できません`}</Text>{route && <Text size="xs" c="dimmed">{route.note}</Text>}</Paper>
    <Paper withBorder p="md">{[...result.reasons, ...result.notes].map((note) => <Text key={note} size="sm">{note}</Text>)}</Paper>
  </Stack>;
}

function CheckCard({ check }: { check: JourneyCheck }) {
  return <Paper withBorder p="sm" className="checkCard"><Group wrap="nowrap" align="flex-start"><StatusIcon ok={check.ok} label={check.label} /><div><Text fw={700} size="sm">{check.label}</Text><Text size="xs" c="dimmed">{check.detail}</Text></div></Group></Paper>;
}

function TransferView() {
  const [query, setQuery] = useState('');
  const list = useMemo(() => searchTransferGates(query), [query]);
  return <Stack><TextInput label="乗換改札を検索" placeholder="駅名または会社名" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
    {list.map((gate) => <Paper key={gate.id} withBorder p="md"><Title order={3}>{gate.station}</Title><Text size="sm" c="dimmed">{gate.companyA}と{gate.companyB} {gate.gateName}</Text><Accordion mt="sm">{gate.scenarios.map((scenario) => <Accordion.Item key={scenario.id} value={scenario.id}><Accordion.Control>{scenario.title}</Accordion.Control><Accordion.Panel><Stack>{scenario.steps.map((step, index) => <Group key={`${step.order}-${index}`} wrap="nowrap" align="flex-start"><ThemeIcon radius="xl">{index + 1}</ThemeIcon><Text size="sm">{step.detail}</Text></Group>)}{scenario.warnings?.map((warning) => <Alert key={warning} icon={<IconAlertTriangle size={16} />} color="orange">{warning}</Alert>)}</Stack></Accordion.Panel></Accordion.Item>)}</Accordion></Paper>)}
  </Stack>;
}

function coverageKind(kind: ServiceCoverage['kind']) {
  return ({ points: 'ポイント', pass: '定期券', booking: '予約', charge: 'チャージ', other: 'その他' })[kind];
}

function ServiceView({ jumpToCard }: { jumpToCard: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => [
    ...CARD_SERVICES.map((item) => ({ ...item, kindLabel: SERVICE_CATEGORIES[item.category], areaIds: [] as string[] })),
    ...SERVICE_COVERAGES.map((item) => ({ ...item, kindLabel: coverageKind(item.kind), areaIds: item.icAreaIds })),
  ].filter((item) => !query || `${item.name}${item.summary}${item.kindLabel}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <Stack><TextInput label="サービスを検索" placeholder="サービス名または種類" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
    <SimpleGrid cols={{ base: 1, md: 2 }}>{rows.map((item, index) => <Paper key={`${item.id}-${index}`} withBorder p="md"><Badge variant="light">{item.kindLabel}</Badge><Title order={3} mt="xs">{item.name}</Title><Text size="sm">{item.summary}</Text><Text fw={700} size="xs" mt="sm">関係カード</Text><Group gap={4} mt={4}>{item.cardIds.map((id) => <Button key={id} variant="subtle" size="compact-sm" onClick={() => jumpToCard(id)}>{CARD_CATALOG.find((card) => card.id === id)?.name ?? id}</Button>)}</Group>{item.areaIds.length > 0 && <><Text fw={700} size="xs" mt="sm">対象エリア</Text>{item.areaIds.map((id) => <Text key={id} size="xs">{displayIcArea(id)}</Text>)}</>}</Paper>)}</SimpleGrid>
  </Stack>;
}

export default function FiveViews() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [perspective, setPerspective] = useState<Perspective>('card');
  const [cardId, setCardId] = useState('suica');
  const [helpOpened, help] = useDisclosure(false);
  const jumpToCard = (id: string) => { setCardId(id); setPerspective('card'); };
  return (
    <AppShell className="icerucaApp" mode="static" header={{ height: isMobile ? 88 : 80 }} padding={0}>
      <AppShell.Header className="appHeader">
        <Group h={40} px="sm" justify="space-between"><ProductHeader /><Tooltip label="ヘルプ"><ActionIcon aria-label="ヘルプ" variant="subtle" onClick={help.open}><IconHelpCircle size={20} /></ActionIcon></Tooltip></Group>
        <ScrollArea type="never" scrollbarSize={0}><SegmentedControl aria-label="確認する視点" className="perspectiveNav" fullWidth value={perspective} onChange={(value) => setPerspective(value as Perspective)}
          data={views.map(({ value, label, icon: Icon }) => ({ value, label: <Group gap={5} wrap="nowrap"><Icon size={16} /><span>{label}</span></Group> }))} /></ScrollArea>
      </AppShell.Header>
      <AppShell.Main className="appMain"><ScrollArea className="pageScroll"><Box p="md" className="pageContent">
        {perspective === 'card' && <CardView cardId={cardId} setCardId={setCardId} />}
        {perspective === 'company' && <CompanyView />}
        {perspective === 'journey' && <JourneyView />}
        {perspective === 'transfer' && <TransferView />}
        {perspective === 'service' && <ServiceView jumpToCard={jumpToCard} />}
      </Box></ScrollArea></AppShell.Main>
      <HelpModal opened={helpOpened} onClose={help.close} />
    </AppShell>
  );
}
