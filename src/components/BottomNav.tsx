import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'Actions', icon: '\u26A1' },
  { path: '/knowledge', label: 'Knowledge', icon: '\uD83D\uDCDA' },
  { path: '/books', label: '\u66F8\u7C4D', icon: '\uD83D\uDCD6' },
  { path: '/settings', label: '\u8A2D\u5B9A', icon: '\u2699\uFE0F' },
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
              className={`relative flex-1 flex flex-col items-center py-2 text-xs font-medium transition-all ${
                active
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
              )}
              <span className={`text-lg mb-0.5 transition-transform ${active ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className={active ? 'font-bold' : ''}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}