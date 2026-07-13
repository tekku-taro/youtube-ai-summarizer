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
    const year = createdAt.getFullYear();
    const month = String(createdAt.getMonth() + 1).padStart(2, '0');
    const day = String(createdAt.getDate()).padStart(2, '0');
    const hours = String(createdAt.getHours()).padStart(2, '0');
    const minutes = String(createdAt.getMinutes()).padStart(2, '0');
    const seconds = String(createdAt.getSeconds()).padStart(2, '0');

    return `youtube-summary-${videoId}-${year}${month}${day}-${hours}${minutes}${seconds}.md`;
  }
}
