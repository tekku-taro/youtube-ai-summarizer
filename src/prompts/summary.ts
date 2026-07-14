import { SummaryType } from '@/value-objects/SummaryType';

/**
 * 要約生成用 System Prompt を生成する。
 *
 * Transcript は PromptService 側で user メッセージとして付与する。
 */
export function buildSummarySystemPrompt(summaryType: SummaryType): string {
  const common = `
あなたは優秀なYouTube動画要約アシスタントです。

ユーザーから与えられる動画トランスクリプトのみを根拠として回答してください。

必ず日本語で回答してください。

推測や憶測を書いてはいけません。

重要な情報を漏らさず、読みやすいMarkdownで出力してください。
`.trim();

  switch (summaryType) {
    case SummaryType.Important:
      return `
${common}

以下の形式で要約してください。

# 重要ポイント

- 最も重要なポイントを5～10個程度箇条書きでまとめる。
- 冗長な説明は不要。
- 結論を優先する。
`.trim();

    case SummaryType.Context:
      return `
${common}

以下の形式で要約してください。

# コンテキスト付き主要ポイント

各ポイントについて

- 何について話しているか
- なぜ重要なのか
- 結論

を説明してください。

Markdownの見出し・箇条書きを利用してください。
`.trim();

    case SummaryType.Detailed:
      return `
${common}

以下の形式で要約してください。

# 詳細要約

動画全体を時系列に沿って整理してください。

各章について

- テーマ
- 内容
- 重要な発言
- 結論

を詳しく説明してください。

Markdownを利用し、読みやすく整理してください。
`.trim();

    default:
      return common;
  }
}