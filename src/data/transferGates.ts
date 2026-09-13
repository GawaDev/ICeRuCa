export type TransferMedia = 'ic' | 'magnetic' | 'ex_ic' | 'shinkansen_ticket';

export type TransferStep = {
  order: 'magnetic_first' | 'ic_only' | 'stack_magnetic' | 'stack_ic_ex' | 'exit_reenter';
  detail: string;
};

export type TransferGate = {
  id: string;
  station: string;
  companyA: string;
  companyB: string;
  gateName: string;
  region: string;
  scenarios: Array<{
    id: string;
    title: string;
    mediaA: TransferMedia;
    mediaB: TransferMedia;
    steps: TransferStep[];
    warnings?: string[];
  }>;
  sources: string[];
};

export const TRANSFER_GATES: TransferGate[] = [
  {
    id: 'kintetsu-nagoya-jr',
    station: '近鉄名古屋',
    companyA: '近畿日本鉄道',
    companyB: 'JR東海',
    gateName: 'JR乗りかえ用自動改札機（フェアシステムK）',
    region: '名古屋',
    sources: ['https://www.kintetsu.co.jp/gyoumu/systemk/W20039.html'],
    scenarios: [
      {
        id: 'both-ic', title: '双方IC（同一カード）', mediaA: 'ic', mediaB: 'ic',
        steps: [{ order: 'ic_only', detail: '1枚のICをタッチするだけで、近鉄出場とJR入場が同時処理される' }],
      },
      {
        id: 'ic-mag', title: '一方IC・一方磁気券', mediaA: 'ic', mediaB: 'magnetic',
        steps: [{ order: 'magnetic_first', detail: '必ず先に磁気券を投入し、その後ICをタッチする' }],
        warnings: ['先にICをタッチすると相手側の入場も同時処理され、係員の取消が必要になる'],
      },
      {
        id: 'both-mag', title: '双方磁気券', mediaA: 'magnetic', mediaB: 'magnetic',
        steps: [{ order: 'stack_magnetic', detail: '双方の磁気券を重ねて自動改札機に入れる' }],
      },
      {
        id: 'diff-ic', title: '異なるICカードで乗り継ぎ', mediaA: 'ic', mediaB: 'ic',
        steps: [{ order: 'exit_reenter', detail: '乗換改札は使えない。一旦出場し、相手改札から改めて入場する' }],
      },
      {
        id: 'ic-ex', title: '近鉄IC + 新幹線EX-IC', mediaA: 'ic', mediaB: 'ex_ic',
        steps: [
          { order: 'ic_only', detail: '近鉄側はICのみタッチして通過' },
          { order: 'stack_ic_ex', detail: '新幹線改札では近鉄ICとEX-ICを重ねてタッチ（方向により手順が逆）' },
        ],
      },
    ],
  },
  {
    id: 'kintetsu-nagoya-meitetsu',
    station: '近鉄名古屋',
    companyA: '近畿日本鉄道',
    companyB: '名古屋鉄道',
    gateName: '名鉄乗りかえ用自動改札機',
    region: '名古屋',
    sources: ['https://www.kintetsu.co.jp/gyoumu/systemk/W20039.html'],
    scenarios: [
      {
        id: 'both-ic', title: '双方IC（同一カード）', mediaA: 'ic', mediaB: 'ic',
        steps: [{ order: 'ic_only', detail: '1枚タッチで近鉄出場と名鉄入場が同時処理' }],
      },
      {
        id: 'ic-mag', title: '一方IC・一方磁気券', mediaA: 'ic', mediaB: 'magnetic',
        steps: [{ order: 'magnetic_first', detail: '磁気券を先に投入し、その後ICをタッチ' }],
        warnings: ['IC先タッチは取消処理が必要になる場合あり'],
      },
      {
        id: 'both-mag', title: '双方磁気券', mediaA: 'magnetic', mediaB: 'magnetic',
        steps: [{ order: 'stack_magnetic', detail: '双方の磁気券を重ねて投入' }],
      },
      {
        id: 'diff-ic', title: '異なるICで乗り継ぎ', mediaA: 'ic', mediaB: 'ic',
        steps: [{ order: 'exit_reenter', detail: '乗換改札不可。一旦出場して相手改札へ' }],
      },
    ],
  },
  {
    id: 'toyohashi-jr-meitetsu',
    station: '豊橋',
    companyA: 'JR東海',
    companyB: '名古屋鉄道',
    gateName: 'ICのりかえ改札機（2・3番線）',
    region: '愛知',
    sources: ['JR東海・名鉄各社案内（TOICA/manaca乗換）'],
    scenarios: [{
      id: 'both-ic', title: 'JR⇔名鉄を同一ICで乗換', mediaA: 'ic', mediaB: 'ic',
      steps: [{ order: 'ic_only', detail: 'ホーム上のICのりかえ改札機に必ずタッチ（色分けあり）' }],
      warnings: ['タッチしないと下車駅で処理できない'],
    }],
  },
  {
    id: 'yatomi-jr-meitetsu',
    station: '弥富',
    companyA: 'JR東海',
    companyB: '名古屋鉄道',
    gateName: 'ICのりかえ改札機',
    region: '愛知',
    sources: ['JR東海・名鉄各社案内'],
    scenarios: [{
      id: 'both-ic', title: 'JR⇔名鉄乗換', mediaA: 'ic', mediaB: 'ic',
      steps: [{ order: 'ic_only', detail: 'ICのりかえ改札にタッチ。名鉄のみ利用時は改札口と乗換改札の両方にタッチが必要な場合あり' }],
    }],
  },
  {
    id: 'okazaki-jr-aikan',
    station: '岡崎',
    companyA: 'JR東海',
    companyB: '愛知環状鉄道',
    gateName: 'ICのりかえ改札機（0番線）',
    region: '愛知',
    sources: ['JR東海・愛環案内'],
    scenarios: [{
      id: 'both-ic', title: 'JR⇔愛環乗換', mediaA: 'ic', mediaB: 'ic',
      steps: [{ order: 'ic_only', detail: '乗換改札にタッチしないと高蔵寺経由運賃になる場合あり' }],
    }],
  },
  {
    id: 'maibara-icoca-toica',
    station: '米原',
    companyA: 'JR西日本',
    companyB: 'JR東海',
    gateName: '在来線改札（ICOCA/TOICA系統の使い分け）',
    region: '滋賀',
    sources: ['JR西日本・JR東海エリア案内'],
    scenarios: [{
      id: 'area-boundary', title: 'エリア境界駅での乗換', mediaA: 'ic', mediaB: 'ic',
      steps: [{ order: 'exit_reenter', detail: 'ICOCAエリアとTOICAエリアのまたぎは不可。方向に応じた改札機色・系統に注意' }],
      warnings: ['醒ケ井・近江長岡・柏原はTOICA側扱い'],
    }],
  },
  {
    id: 'tsuruga-hapi-transfer',
    station: '敦賀',
    companyA: 'ハピラインふくい',
    companyB: 'JR西日本',
    gateName: '乗換用IC改札機（改札内）',
    region: '福井',
    sources: ['https://www.hapi-line.co.jp/ticket/ic/02'],
    scenarios: [{
      id: 'hapi-west', title: 'ハピライン⇔JR西日本の条件付きまたぎ', mediaA: 'ic', mediaB: 'ic',
      steps: [{ order: 'ic_only', detail: '公式エリア図の範囲内でICOCA利用。改札内乗換ICにタッチすると下車可能駅が広がる場合あり' }],
      warnings: ['エリア以遠（富山・名古屋・小浜など）へのまたぎは不可'],
    }],
  },
];

export const searchTransferGates = (query: string) => {
  const normalized = query.trim().toLowerCase();
  return TRANSFER_GATES.filter((gate) =>
    !normalized || [gate.station, gate.companyA, gate.companyB, gate.region, gate.gateName]
      .some((value) => value.toLowerCase().includes(normalized)),
  );
};

export const getTransferGate = (id: string) =>
  TRANSFER_GATES.find((gate) => gate.id === id);
