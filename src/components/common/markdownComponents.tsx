import type { Components } from "react-markdown";

// ReactMarkdown 用のカスタムコンポーネント定義
export const markdownComponents: Components = {
  // 見出し 1
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-2 mt-4 mb-3">
      {children}
    </h1>
  ),
  // 見出し 2
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2 flex items-center gap-2">
      <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
      {children}
    </h2>
  ),
  // 見出し 3
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1.5">
      {children}
    </h3>
  ),
  // パラグラフ（段落）
  p: ({ children }) => (
    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
      {children}
    </p>
  ),
  // 箇条書きリスト (ul)
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-3 pl-2">
      {children}
    </ul>
  ),
  // 番号付きリスト (ol)
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-3 pl-2">
      {children}
    </ol>
  ),
  // リスト項目 (li)
  li: ({ children }) => (
    <li className="leading-relaxed">
      {children}
    </li>
  ),
  // 太字 (strong)
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-950 px-1 rounded">
      {children}
    </strong>
  ),
  // 引用 (blockquote)
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-800/50 italic text-gray-600 dark:text-gray-400 p-2.5 my-3 rounded-r text-sm">
      {children}
    </blockquote>
  ),
  // インラインコード / コードブロック (code)
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-xs font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} text-xs font-mono`} {...props}>
        {children}
      </code>
    );
  },
  // コードブロックのコンテナ (pre)
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs my-3">
      {children}
    </pre>
  ),
  // リンク (a)
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
    >
      {children}
    </a>
  ),
  // テーブル (table)
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full text-xs text-left text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-gray-100 dark:bg-gray-800 p-2 font-semibold border-b border-gray-200 dark:border-gray-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="p-2 border-b border-gray-100 dark:border-gray-800">
      {children}
    </td>
  ),
};