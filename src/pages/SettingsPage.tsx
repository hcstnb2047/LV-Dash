import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Theme } from '../lib/storage'

export function SettingsPage() {
  const { pat, setPAT, removePAT, theme, setTheme, workflows, toggleVisibility } = useApp()
  const [patInput, setPATInput] = useState('')
  const [validating, setValidating] = useState(false)

  const handleSavePAT = async () => {
    if (!patInput.trim()) return
    setValidating(true)
    const ok = await setPAT(patInput.trim())
    setValidating(false)
    if (ok) setPATInput('')
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <h1 className="text-lg font-bold">設定</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* PAT */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            GitHub PAT
          </h2>
          {pat ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">PAT設定済み</span>
                <span className="text-xs text-gray-500">ghp_****</span>
              </div>
              <button
                onClick={removePAT}
                className="w-full rounded-lg border border-red-300 dark:border-red-800 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400"
              >
                PATを削除
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                GitHub Fine-grained PAT を入力してください。
                <br />
                スコープ: Actions (R/W) + Contents (RO) + Metadata (RO)
                <br />
                リポジトリ: LifeVault のみ
              </p>
              <input
                type="password"
                value={patInput}
                onChange={(e) => setPATInput(e.target.value)}
                placeholder="github_pat_..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm"
              />
              <button
                onClick={handleSavePAT}
                disabled={!patInput.trim() || validating}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {validating ? '検証中...' : '検証して保存'}
              </button>
            </div>
          )}
        </section>

        {/* Theme */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            テーマ
          </h2>
          <div className="flex gap-2">
            {(['system', 'light', 'dark'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  theme === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {t === 'system' ? 'OS連動' : t === 'light' ? 'ライト' : 'ダーク'}
              </button>
            ))}
          </div>
        </section>

        {/* Workflow visibility */}
        {workflows.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              ワークフロー表示
            </h2>
            <div className="space-y-1">
              {workflows.map((wf) => {
                const fileName = wf.workflow.path.split('/').pop() ?? ''
                return (
                  <div
                    key={wf.workflow.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm">{wf.meta?.displayName ?? wf.workflow.name}</span>
                    <button
                      onClick={() => toggleVisibility(fileName)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${wf.isVisible ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${wf.isVisible ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
