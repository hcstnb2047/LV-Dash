export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-3xl mb-3">🚧</div>
      <h1 className="text-lg font-bold mb-1">{title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">準備中</p>
    </div>
  )
}
