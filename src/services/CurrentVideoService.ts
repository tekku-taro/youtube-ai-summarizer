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

    if (!this.isTargetPage('www.youtube.com/watch', url)) {
      return false;
    }


    const videoId = url.searchParams.get('v');

    console.log('videoId', videoId);
    if (!videoId) {
      return false;
    }

    return videoId;
  }

  private isTargetPage(target: string, url:URL):boolean {
    const current = `${url.hostname}${url.pathname}`;
    return current === target;
  }  
}