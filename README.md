# ICeRuCa

交通系ICカードの利用条件を、カード、媒体、交通事業者、エリア、利用目的ごとに公式情報から確認するWebアプリです。

## 機能

- 全国相互利用10カード、地域カード、地域連携ICの条件確認
- 15カード、27種類の媒体・年齢・福祉・地域連携条件
- カード、会社、駅間、乗換改札、サービスの5視点
- 2025年度国土数値情報による10,234駅と18,113路線要素
- 駅間の5条件、概算営業キロ、経由路線、改札継続の確認
- 7か所の乗換・中間改札カタログ
- ICOCA 200km規則、境界駅、PiTaPa分割エリア
- OpenStreetMap上での駅・実軌道表示
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
