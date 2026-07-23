import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Youtube AI summarizer',
  version: '1.0.0',
  side_panel: {
    default_path: 'src/index.html', // ポップアップと同じHTMLを指定
  },  
  action: {
    // default_popup: 'src/index.html',
    default_icon: {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }    
  },
  background: {
    service_worker: 'src/background/background.ts',
    type: 'module', // TypeScript や一連の import文 を動かすため
  },  
  content_scripts: [
    {
      matches: ['https://www.youtube.com/*'],
      js: ['src/content/index.ts'], // 作成するコンテンツスクリプトのパス
    },
  ],  
  permissions: [
    'tabs',   // タブ情報の取得用
    'storage', // ← ストレージへのアクセス権限を追加
    'scripting',
    "declarativeNetRequest",
    'sidePanel',
  ],
  host_permissions: [
    'https://www.youtube.com/*',
    
    // AI サービス通信用の権限を追加
    'https://api.openai.com/*',
    'https://generativelanguage.googleapis.com/*',
    'https://api.anthropic.com/*',
    
    // ローカルLLM（LM Studio や Ollama）等を利用する場合は HTTP / localhost も許可
    'http://localhost/*',
    'http://127.0.0.1/*',

    // あるいは開発用途など、すべての外部ドメインを許可する場合
    // 'https://*/*'    
  ],
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }  
})
