import { registerSW } from 'virtual:pwa-register';

export function initPwaUpdate() {
  registerSW({
    immediate: true,
    onNeedReload() {
      // 選択中の確認条件を失わないよう、次回起動時に更新する。
    },
  });
}
