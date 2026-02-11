import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'Actions', icon: '⚡' },
  { path: '/knowledge', label: 'Knowledge', icon: '📚' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/settings', label: '設定', icon: '⚙️' },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {TABS.map((tab) => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="text-lg mb-0.5">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
