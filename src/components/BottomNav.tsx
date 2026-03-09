import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'Knowledge', icon: '◈' },
  { path: '/flashcards', label: 'Flashcards', icon: '▣' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {TABS.map((tab) => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                active
                  ? 'text-sky-400'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <span className="text-base mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
              {active && <div className="absolute top-0 w-12 h-px bg-sky-400" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
