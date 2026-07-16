export class DateUtil {
  public static nowIso(): string {
    return new Date().toISOString();
  }

  public static formatDisplay(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid Date');
    }

// タイムゾーンを 'Asia/Tokyo' に固定してフォーマットする
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24時間表記
    });

    // 出力結果: "2026/07/16 14:00"
    return formatter.format(date);
  }
}
