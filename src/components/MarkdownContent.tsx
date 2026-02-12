import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold mt-6 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold mt-3 mb-1">{children}</h4>
  ),
  p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ className, children }) => {
    const isBlock = className?.startsWith('language-')
    if (!isBlock) {
      return (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono">
          {children}
        </code>
      )
    }
    return <code className={`${className ?? ''} text-sm`}>{children}</code>
  },
  pre: ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto mb-3 text-sm">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-3">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ''}
      className="max-w-full h-auto rounded-lg my-3"
      loading="lazy"
    />
  ),
}

interface Props {
  content: string
}

export function MarkdownContent({ content }: Props) {
  return (
    <div className="text-sm text-gray-900 dark:text-gray-100">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  )
}
