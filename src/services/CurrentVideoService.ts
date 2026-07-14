import type { ICurrentVideoService } from "./ICurrentVideoService";


export class CurrentVideoService  implements ICurrentVideoService {

  public async getCurrentVideoId(): Promise<string> {

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url) {
      throw new Error('Current tab URL not found.');
    }

    const url = new URL(tab.url);
    // よりシンプルな方法
    // const url =
    //     new URL(window.location.href);


    const videoId = url.searchParams.get('v');

    if (!videoId) {
      throw new Error('Not a YouTube watch page.');
    }

    return videoId;
  }
}