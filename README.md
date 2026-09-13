# ICeRuCa

交通系ICカードの利用条件を、カード、媒体、交通事業者、エリア、利用目的ごとに公式情報から確認するWebアプリです。

## 機能

- 全国相互利用10カード、地域カード、地域連携ICの条件確認
- カード、会社、駅間、乗換改札、サービスの5視点
- 外部地図へ接続しない駅・路線表示
- 根拠URLと確認日の表示
- モバイル画面、PWA、オフライン起動

## 開発

```bash
npm ci
npm run dev
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

`data/raw/n02.geojson`へ国土数値情報N02を配置した場合、`npm run data:rail`で表示用データを生成します。N02は地図形状にだけ使い、IC利用可否の根拠にはしません。

## 公開

`render.yaml`はNode Web Service、`/health`、自動デプロイを定義します。公開先は `https://iceruca.onrender.com` を想定しています。

## ライセンス

アプリ本体はMIT Licenseです。第三者データとライブラリは `THIRD_PARTY.md` を確認してください。
