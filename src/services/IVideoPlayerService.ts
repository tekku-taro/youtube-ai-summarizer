export interface IVideoPlayerService {
  /**
   * 現在のアクティブなYouTubeタブの動画を指定秒数にシークする。
   * @param seconds 移動先の秒数
   */
  seekTo(seconds: number): Promise<boolean>;
}