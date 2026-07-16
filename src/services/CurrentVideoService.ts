import type { ICurrentVideoService } from "./ICurrentVideoService";


export class CurrentVideoService  implements ICurrentVideoService {

  public async getCurrentVideoId(): Promise<string|boolean> {

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log('tab', tab);
    if (!tab || !tab.url) {
      return false;
    }

    const url = new URL(tab.url);

    console.log('url', url);

    const videoId = url.searchParams.get('v');

    console.log('videoId', videoId);
    if (!videoId) {
      return false;
    }

    return videoId;
  }
}