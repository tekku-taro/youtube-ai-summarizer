import type { IVideoPlayerService } from './IVideoPlayerService';

export class VideoPlayerService implements IVideoPlayerService {
  public async seekTo(seconds: number): Promise<boolean> {
    try {
      // 1. 現在のアクティブタブを取得
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        console.warn('Active tab not found.');
        return false;
      }
      // YouTube ページ以外のタブには送信しないチェック
      if (!tab.url?.includes('youtube.com/watch')) {
        console.warn('Current tab is not a YouTube video page.');
        return false;
      }

      console.log('tab', tab);

      try {
        // メッセージの送信
        await chrome.tabs.sendMessage(tab.id, {
          type: 'SEEK_VIDEO',
          seconds: seconds,
        });
        return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (messagingError:unknown) {
        // 「Could not establish connection」をキャッチした場合
        console.warn('Content script not ready. Attempting to execute script dynamically...');

        // 万が一 Content Script が注入されていない場合、動的に注入して即座にシーク実行するフォールバック
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (sec) => {
            const video = document.querySelector<HTMLVideoElement>('video');
            if (video) {
              video.currentTime = sec;
              video.play();
            }
          },
          args: [seconds],
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to seek video:', error);
      throw new Error('Failed to seek video', { cause: error });
    }
  }
}