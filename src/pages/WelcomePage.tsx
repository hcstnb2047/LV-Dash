import { useNavigate } from 'react-router-dom'

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-4">⚡</div>
      <h1 className="text-2xl font-bold mb-2">LV Dash</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
        LifeVault GitHub Actions をスマホからワンタップで操作
      </p>
      <button
        onClick={() => navigate('/settings')}
        className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white"
      >
        PATを設定して始める
      </button>
    </div>
  )
}
