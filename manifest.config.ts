import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'CRXJS from scratch',
  version: '1.0.0',
  action: {
    default_popup: 'src/index.html',
  },
  background: {
    service_worker: 'src/background/background.ts',
    type: 'module', // TypeScript や一連の import文 を動かすため
  },  
  permissions: [
    'tabs',   // タブ情報の取得用
    'storage', // ← ストレージへのアクセス権限を追加
    "declarativeNetRequest"
  ],
  host_permissions: [
    'https://www.youtube.com/*',
  ],
})
