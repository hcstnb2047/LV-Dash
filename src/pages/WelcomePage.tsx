import { useNavigate } from 'react-router-dom'

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
      <div className="font-mono text-sky-400 text-xs tracking-widest uppercase mb-6">
        [ KNOWLEDGE TERMINAL ]
      </div>
      <h1 className="font-mono text-2xl font-bold text-zinc-100 mb-2">LV Dash</h1>
      <p className="font-mono text-sm text-zinc-500 mb-8 max-w-xs">
        life-data の Knowledge を検索・閲覧・定着させる個人端末
      </p>
      <button
        onClick={() => navigate('/settings')}
        className="font-mono rounded border border-sky-400 text-sky-400 px-6 py-3 text-sm uppercase tracking-wider hover:bg-sky-400 hover:text-zinc-950 transition-colors"
      >
        PAT を設定して接続
      </button>
    </div>
  )
}
