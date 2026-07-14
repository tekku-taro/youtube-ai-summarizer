# TASKS.md

# YouTube AI Summary Chrome Extension

Version 1.0

---

# 開発ルール

* 1Taskずつ実装する。
* Task完了後にBuildが通ること。
* ESLint Error 0件。
* TypeScript Error 0件。
* Task完了後にCommitする。
* 設計書に従う。
* 設計変更は禁止（変更が必要な場合は提案のみ）。

---

# Phase 0 開発環境

## TASK-001 プロジェクト作成

### 内容

* Vite
* React
* TypeScript
* Manifest V3

### 設計書

* プロジェクトディレクトリ構成設計書

---

## TASK-002 開発環境

### 内容

* ESLint
* Prettier
* Alias
* Zustand
* Build確認

### 完了条件

```
npm run build
```

成功

---

# Phase 1 共通基盤

## TASK-101 HttpClient

### 内容

実装

* HttpClient

### 設計書

* Provider設計書
* Utility設計

---

## TASK-102 Utility

実装

* DateUtil
* FileUtil

---

# Phase 2 Domain

## TASK-201 ValueObjects

実装

* ProviderType
* SummaryType
* ThinkingMode
* TokenUsage
* TranscriptSegment
* AIExecutionOptions
* ModelInfo

---

## TASK-202 Models

実装

* VideoData
* TranscriptData
* SummaryData
* ChatSession
* ChatMessage
* Settings
* ProviderConfig

---

## TASK-203 DTO

実装

* GenerateRequest
* GenerateResponse
* SummaryRequestDto
* SummaryResult
* TranscriptResult
* ChatRequestDto
* ChatResult
* ModelListResult
* InitialState

---

# Phase 3 Repository

## TASK-301 SettingsRepository

---

## TASK-302 ProviderRepository

---

## TASK-303 VideoRepository

---

## TASK-304 Repository Test

Storage保存確認

---

# Phase 4 Provider

## TASK-401 IAIProvider

---

## TASK-402 ProviderFactory

---

## TASK-403 LMStudioProvider

接続確認

---

## TASK-404 OpenAIProvider

Responses API対応

---

## TASK-405 GeminiProvider

Generate Content対応

---

## TASK-406 Provider Test

* OpenAI
* Gemini
* LMStudio

---

# Phase 5 Service

## TASK-501 PromptService

---

## TASK-502 GenerateService

---

## TASK-503 MarkdownService

---

## TASK-504 YouTubeTranscriptService

---

## TASK-505 Service Test

---

# Phase 6 Application

## TASK-601 AIFacade

initialize()

---

## TASK-602 Transcript

getTranscript()

---

## TASK-603 Summary

summarize()

---

## TASK-604 Chat

chat()

---

## TASK-605 Model

getModels()

---

# Phase 7 State

## TASK-701 appStore

---

## TASK-702 Store Test

---

# Phase 8 React UI

## TASK-801 Modal

---

## TASK-802 Header

---

## TASK-803 TabBar

---

## TASK-804 Summary Tab

---

## TASK-805 Transcript Tab

---

## TASK-806 Chat Tab

---

## TASK-807 Settings Tab

---

## TASK-808 UI Integration

---

# Phase 9 Chrome Extension

## TASK-901 Content Script

---

## TASK-902 Background

---

## TASK-903 Manifest

---

## TASK-904 Icon

---

## TASK-905 Extension Test

---

# Phase 10 Integration

## TASK-1001 Summary

E2E確認

---

## TASK-1002 Transcript

E2E確認

---

## TASK-1003 Chat

E2E確認

---

## TASK-1004 Markdown

E2E確認

---

## TASK-1005 Provider Switch

E2E確認

---

## TASK-1006 Cache

E2E確認

---

## TASK-1007 Release Build

### 完了条件

* npm run build 成功
* TypeScript Error 0件
* ESLint Error 0件
* Chrome Extension 動作確認
* OpenAI 動作確認
* Gemini 動作確認
* LM Studio 動作確認

---

# 実装順序

```
Phase0

↓

Phase1

↓

Phase2

↓

Phase3

↓

Phase4

↓

Phase5

↓

Phase6

↓

Phase7

↓

Phase8

↓

Phase9

↓

Phase10
```

Taskは必ず番号順に実装すること。

前Taskが完了するまで次Taskへ進まないこと。

---

# Definition of Done

各Taskは以下を満たした場合のみ完了とする。

* 設計書準拠
* TypeScript Compile Error 0件
* ESLint Error 0件
* Build成功
* 既存機能を壊していない
* 必要なコメント・型定義を追加済み
* コードレビュー可能な状態
