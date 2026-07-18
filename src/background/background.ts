import { executeGetTranscript } from "./tasks/executeGetTranscript";

// background.ts
chrome.runtime.onInstalled.addListener(async () => {
  const RULES = [
    {
      id: 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          // 1. 拡張機能からの通信であることを隠すために Origin を削除（最重要）
          { header: 'origin', operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE },
          // 2. ブラウザが自動付与する Sec-Fetch 系ヘッダーを無効化・偽装
          { header: 'sec-fetch-mode', operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: 'navigate' },
          { header: 'sec-fetch-site', operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: 'none' }
        ]
      },
      condition: {
        // 💡 修正：/watch* から youtube.com 全体に広げ、内部API(Innertube)の通信も対象にする
        urlFilter: '*://*.youtube.com/*', 
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST, // fetch通信
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME     // ページ読み込み
        ]
      }
    }
  ];

  // 既存のルールをクリアして適用
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldIds = oldRules.map(rule => rule.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldIds,
    addRules: RULES
  });
  
  console.log('YouTubeの全CORS制限をバイパスするルールを適用しました');
});

// === 2. 💡 追加：ポップアップからのメッセージを待ち受けるリスナー ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'FETCH_YOUTUBE_TRANSCRIPT') {
    // 非同期処理を走らせて結果をポップアップへ返却
    executeGetTranscript(message.videoId, message.timeout)
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.message || 'Unknown Error' }));
    
    return true; // 💡 非同期レスポンスを有効にするために必ず true を返す
  }
});