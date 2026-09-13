import { useState } from 'react';
import {
  ActionIcon, Anchor, AppShell, Badge, Box, Button, Divider, Group, NavLink, Paper,
  ScrollArea, SegmentedControl, Select, SimpleGrid, Stack, Text,
  ThemeIcon, Title, Tooltip,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconBuilding, IconCreditCard, IconExternalLink, IconHelpCircle, IconMapPin,
  IconRoute, IconTicket, IconTransfer,
} from '@tabler/icons-react';
import { NetworkMap } from './components/NetworkMap';
import {
  areas, areaById, cards, cardById, checkCompatibility, evaluateJourney,
  operators, operatorById, services, sourceById, stations, transferGates,
  type Medium, type Purpose, type ResultStatus,
} from './data/catalog';
import { HelpModal } from './HelpModal';
import { PaneHeader, ProductHeader } from './ui/AppChrome';
import './App.css';

type Perspective = 'card' | 'company' | 'journey' | 'transfer' | 'service';
type MobileView = 'controls' | 'result';

const perspectives = [
  { id: 'card' as const, label: 'カード', icon: IconCreditCard },
  { id: 'company' as const, label: '会社', icon: IconBuilding },
  { id: 'journey' as const, label: '駅間検索', icon: IconRoute },
  { id: 'transfer' as const, label: '乗換改札', icon: IconTransfer },
  { id: 'service' as const, label: 'サービス', icon: IconTicket },
];

const statusMeta: Record<ResultStatus, { color: string; label: string }> = {
  available: { color: 'green', label: '利用できます' },
  unavailable: { color: 'red', label: '利用できません' },
  conditional: { color: 'orange', label: '条件があります' },
  unknown: { color: 'gray', label: '公式情報で確認できません' },
};
const purposeLabels: Record<Purpose, string> = {
  fare: '交通利用',
  pass: '定期券',
  emoney: '電子マネー',
  shinkansen: '新幹線',
  points: 'ポイント',
};

function StatusBadge({ status }: { status: ResultStatus }) {
  const meta = statusMeta[status];
  return <Badge color={meta.color} variant="light" radius="sm">{meta.label}</Badge>;
}

function SourceLink({ sourceId }: { sourceId: string }) {
  const source = sourceById(sourceId);
  return (
    <Paper withBorder p="sm">
      <Text size="xs" c="dimmed">根拠・{source.checkedAt}確認</Text>
      <Anchor href={source.url} target="_blank" rel="noopener noreferrer" size="sm">
        {source.publisher}「{source.title}」 <IconExternalLink size={12} />
      </Anchor>
    </Paper>
  );
}

export default function App() {
  const isPhone = useMediaQuery('(max-width: 560px)');
  const isNarrow = useMediaQuery('(max-width: 768px)');
  const [helpOpened, help] = useDisclosure(false);
  const [perspective, setPerspective] = useState<Perspective>('card');
  const [mobileView, setMobileView] = useState<MobileView>('controls');
  const [cardId, setCardId] = useState('suica');
  const [areaId, setAreaId] = useState('pasmo');
  const [medium, setMedium] = useState<Medium>('physical');
  const [purpose, setPurpose] = useState<Purpose>('fare');
  const [operatorId, setOperatorId] = useState('jr-east');
  const [fromId, setFromId] = useState('tokyo');
  const [toId, setToId] = useState('shinjuku');
  const [stationId, setStationId] = useState('tokyo');
  const [transferId, setTransferId] = useState(transferGates[0].id);
  const [serviceId, setServiceId] = useState(services[0].id);
  const [workspaceMode, setWorkspaceMode] = useState<'map' | 'list'>('map');

  const result = checkCompatibility(cardId, areaId, purpose, medium);
  const journey = evaluateJourney(cardId, fromId, toId);
  const selectedOperator = operatorById(operatorId);
  const operatorAreas = selectedOperator.areaIds.map((id) => areaById(id)!);
  const selectedStation = stations.find((station) => station.id === stationId)!;
  const selectedTransfer = transferGates.find((item) => item.id === transferId)!;
  const selectedService = services.find((item) => item.id === serviceId)!;
  const selectedCard = cardById(cardId);
  const stationOptions = stations.map((station) => ({
    value: station.id,
    label: `${station.name}・${operatorById(station.operatorId).name}`,
  }));
  const headerHeight = isPhone ? 46 : isNarrow ? 44 : 40;
  const mapVisible = !isNarrow || mobileView === 'result';

  const detailsTitle = (() => {
    if (perspective === 'card') return `${selectedCard.name}・${areaById(areaId)?.name}`;
    if (perspective === 'company') return selectedOperator.name;
    if (perspective === 'journey') return `${stations.find((s) => s.id === fromId)?.name}から${stations.find((s) => s.id === toId)?.name}`;
    if (perspective === 'transfer') return selectedTransfer.station;
    return selectedService.name;
  })();

  const selectPerspective = (value: Perspective) => {
    setPerspective(value);
    if (isNarrow) setMobileView('controls');
  };

  const controls = (
    <Stack gap="md" p="md">
      <Stack gap={4}>
        <Text size="xs" fw={700} c="dimmed">確認方法</Text>
        {perspectives.map(({ id, label, icon: Icon }) => (
          <NavLink key={id} label={label} leftSection={<Icon size={17} />} active={perspective === id}
            onClick={() => selectPerspective(id)} variant="light" />
        ))}
      </Stack>
      <Divider />
      {perspective === 'card' && <>
        <Select label="カード" data={cards.map((card) => ({ value: card.id, label: card.name }))} value={cardId} onChange={(value) => value && setCardId(value)} searchable />
        <Select label="媒体" data={[{ value: 'physical', label: 'カード' }, { value: 'mobile', label: 'モバイル' }, { value: 'child', label: '小児用' }]} value={medium} onChange={(value) => value && setMedium(value as Medium)} />
        <Select label="確認する利用" data={[{ value: 'fare', label: '交通利用' }, { value: 'emoney', label: '電子マネー' }, { value: 'pass', label: '定期券' }, { value: 'shinkansen', label: '新幹線' }, { value: 'points', label: 'ポイント' }]} value={purpose} onChange={(value) => value && setPurpose(value as Purpose)} />
        <Select label="利用エリア" data={areas.map((area) => ({ value: area.id, label: area.name }))} value={areaId} onChange={(value) => value && setAreaId(value)} searchable />
      </>}
      {perspective === 'company' &&
        <Select label="交通事業者" data={operators.map((operator) => ({ value: operator.id, label: operator.name }))} value={operatorId} onChange={(value) => value && setOperatorId(value)} searchable />}
      {perspective === 'journey' && <>
        <Select label="カード" data={cards.map((card) => ({ value: card.id, label: card.name }))} value={cardId} onChange={(value) => value && setCardId(value)} searchable />
        <Select label="乗車駅" data={stationOptions} value={fromId} onChange={(value) => value && setFromId(value)} searchable />
        <Select label="降車駅" data={stationOptions} value={toId} onChange={(value) => value && setToId(value)} searchable />
      </>}
      {perspective === 'transfer' &&
        <Select label="乗換駅" data={transferGates.map((gate) => ({ value: gate.id, label: gate.station }))} value={transferId} onChange={(value) => value && setTransferId(value)} />}
      {perspective === 'service' &&
        <Select label="サービス" data={services.map((service) => ({ value: service.id, label: service.name }))} value={serviceId} onChange={(value) => value && setServiceId(value)} />}
      <Text size="xs" c="dimmed">表示内容は2026年9月14日に公式情報を確認しています。</Text>
      {isNarrow && <Button onClick={() => setMobileView('result')}>確認結果を見る</Button>}
    </Stack>
  );

  const workspace = (
    <Box className="workspaceContent">
      {mapVisible && ((perspective === 'card' && workspaceMode === 'map') || perspective === 'journey') &&
        <NetworkMap cardId={cardId} selectedStationId={stationId} onSelectStation={setStationId} />}
      {perspective === 'card' && workspaceMode === 'list' &&
        <ScrollArea h="100%"><Stack p="lg">
          {areas.map((area) => {
            const itemResult = checkCompatibility(cardId, area.id, purpose, medium);
            return (
              <Paper key={area.id} withBorder p="md" className="selectableCard" onClick={() => setAreaId(area.id)}>
                <Group justify="space-between" gap="xs"><Text fw={700}>{area.name}</Text><StatusBadge status={itemResult.status} /></Group>
                <Text size="sm" mt="xs">{itemResult.detail}</Text>
              </Paper>
            );
          })}
        </Stack></ScrollArea>}
      {perspective === 'company' &&
        <ScrollArea h="100%"><Stack p="lg">
          <Title order={2} size="h4">{selectedOperator.name}</Title>
          <Text size="sm" c="dimmed">運営するIC利用エリアと受付カードを確認できます。</Text>
          {operatorAreas.map((area) => (
            <Paper key={area.id} withBorder p="md" onClick={() => setAreaId(area.id)} className="selectableCard">
              <Group justify="space-between"><Text fw={700}>{area.name}</Text><Badge variant="outline">{area.region}</Badge></Group>
              <Text size="sm" mt="xs">{area.note}</Text>
              <Text size="xs" c="dimmed" mt="xs">受付確認済みカード {area.acceptedCardIds.length}種類</Text>
            </Paper>
          ))}
        </Stack></ScrollArea>}
      {perspective === 'transfer' &&
        <ScrollArea h="100%"><Stack p="lg">
          <Title order={2} size="h4">{selectedTransfer.title}</Title>
          {selectedTransfer.steps.map((step, index) => (
            <Group key={step} align="flex-start" wrap="nowrap">
              <ThemeIcon radius="xl" size="md">{index + 1}</ThemeIcon><Text size="sm">{step}</Text>
            </Group>
          ))}
          <Paper withBorder p="md"><Text size="sm">{selectedTransfer.note}</Text></Paper>
        </Stack></ScrollArea>}
      {perspective === 'service' &&
        <ScrollArea h="100%"><Stack p="lg">
          <Title order={2} size="h4">{selectedService.name}</Title>
          <Text>{selectedService.summary}</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {selectedService.conditions.map((condition) => <Paper withBorder p="md" key={condition}><Text size="sm">{condition}</Text></Paper>)}
          </SimpleGrid>
          <Text size="sm" c="dimmed">対象として案内されているカード {selectedService.cardIds.length}種類</Text>
        </Stack></ScrollArea>}
    </Box>
  );

  const details = (
    <Stack p="md">
      <Text fw={700}>{detailsTitle}</Text>
      {perspective === 'card' && <><StatusBadge status={result.status} /><Text size="sm">{result.detail}</Text><SourceLink sourceId={result.source.id} /></>}
      {perspective === 'company' && operatorAreas.map((area) => (
        <Stack key={area.id} gap="xs"><Text size="sm" fw={700}>{area.name}</Text><Text size="sm">{area.note}</Text><SourceLink sourceId={area.sourceId} /></Stack>
      ))}
      {perspective === 'journey' && <>
        <StatusBadge status={journey.status} />
        {journey.checks.map((check) => (
          <Paper key={check.label} withBorder p="sm">
            <Group justify="space-between" gap="xs"><Text size="sm" fw={700}>{check.label}</Text><StatusBadge status={check.status} /></Group>
            <Text size="xs" mt="xs">{check.detail}</Text>
          </Paper>
        ))}
        <Text size="xs" c="dimmed">経路、列車、営業キロを確定せず、乗車可と断定しません。</Text>
      </>}
      {perspective === 'transfer' && <SourceLink sourceId={selectedTransfer.sourceId} />}
      {perspective === 'service' && <><Badge variant="light">{purposeLabels[selectedService.purpose]}</Badge><SourceLink sourceId={selectedService.sourceId} /></>}
      {(perspective === 'card' || perspective === 'journey') && selectedStation && <>
        <Divider /><Group gap="xs"><IconMapPin size={16} /><Text size="sm" fw={700}>選択中の駅</Text></Group>
        <Text size="sm">{selectedStation.name}・{selectedStation.line}</Text>
        {selectedStation.note && <Text size="xs">{selectedStation.note}</Text>}
      </>}
    </Stack>
  );

  return (
    <AppShell className="icerucaApp" mode="static" header={{ height: headerHeight }} padding={0}>
      <AppShell.Header className="appHeader" px="sm">
        <ProductHeader actions={<Tooltip label="ヘルプ"><ActionIcon variant="subtle" color="gray" size="sm" aria-label="ヘルプ" onClick={help.open}><IconHelpCircle size={17} /></ActionIcon></Tooltip>} />
      </AppShell.Header>
      <AppShell.Main className="appMain">
        <Box className="workspaceHost">
          {isNarrow && <SegmentedControl className="mobilePaneSwitch" aria-label="条件と確認結果の切替" fullWidth value={mobileView} transitionDuration={0}
            onChange={(value) => setMobileView(value as MobileView)}
            data={[{ value: 'controls', label: '条件' }, { value: 'result', label: '確認結果' }]} />}
          <Box className="appWorkspace">
            <Box className="pane controlsPane" style={{ display: isNarrow && mobileView !== 'controls' ? 'none' : undefined }}>
              <PaneHeader title="条件" /><ScrollArea className="paneScroll">{controls}</ScrollArea>
            </Box>
            <Box className="pane resultPane" style={{ display: isNarrow && mobileView !== 'result' ? 'none' : undefined }}>
              <PaneHeader title={perspectives.find((item) => item.id === perspective)!.label}
                actions={perspective === 'card' ? <SegmentedControl size="xs" value={workspaceMode} onChange={(value) => setWorkspaceMode(value as 'map' | 'list')}
                  data={[{ value: 'map', label: '地図' }, { value: 'list', label: '一覧' }]} /> : undefined} />
              <Box className="resultLayout">
                <ScrollArea className="resultSummary">
                  <Text className="resultLabel" size="xs" fw={700} c="dimmed">確認結果</Text>
                  {details}
                </ScrollArea>
                <Box className="resultWorkspace">{workspace}</Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </AppShell.Main>
      <HelpModal opened={helpOpened} onClose={help.close} />
    </AppShell>
  );
}
