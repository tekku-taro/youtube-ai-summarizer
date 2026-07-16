export class FileUtil {
  public static downloadText(fileName: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(objectUrl);
  }

  public static createMarkdownFileName(videoId: string, createdAtIso: string): string {
    const createdAt = new Date(createdAtIso);
    if (isNaN(createdAt.getTime())) {
      throw new Error('Invalid Date');
    }

    // 👇 Intl.DateTimeFormat を使って日本時間で各パーツを分解して取得
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // formatToParts() を使うと、[ { type: 'year', value: '2026' }, ... ] のような配列が取れます
    const parts = formatter.formatToParts(createdAt);
    
    // 必要なパーツをオブジェクトにマッピング
    const p = Object.fromEntries(parts.map(part => [part.type, part.value]));

    // p.year = '2026', p.month = '07', p.day = '16' ... とアクセスできるようになります
    const timestamp = `${p.year}${p.month}${p.day}-${p.hour}${p.minute}${p.second}`;
    return `youtube-summary-${videoId}-${timestamp}.md`;
  }
}
