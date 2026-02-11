import { useApp } from '../context/AppContext'

export function ToastContainer() {
  const { toasts, dismissToast } = useApp()
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 p-3 pt-[env(safe-area-inset-top,12px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`w-full max-w-sm rounded-lg px-4 py-3 text-sm font-medium shadow-lg cursor-pointer transition-all animate-[slideDown_0.2s_ease-out] ${
            t.type === 'success'
              ? 'bg-green-600 text-white'
              : t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
