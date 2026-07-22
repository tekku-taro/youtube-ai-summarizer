// src/content/index.ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SEEK_VIDEO') {
    const videoElement = document.querySelector<HTMLVideoElement>('video');
    if (videoElement) {
      videoElement.currentTime = message.seconds;
      videoElement.play(); // 必要に応じて再生開始
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Video element not found' });
    }
  }
  // 非同期レスポンスを行う場合は true を返す（同期の場合は不要）
  return true;
});