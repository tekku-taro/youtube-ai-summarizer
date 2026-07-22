export class DownloadService {
  /**
   * テキストデータを指定されたファイル名でテキスト（Markdown）ファイルとしてダウンロードさせる。
   */
  public downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}