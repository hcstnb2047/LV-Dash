import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { exportSRSData, importSRSData } from '../lib/storage'
import type { Theme } from '../lib/storage'

export function SettingsPage() {
  const { pat, setPAT, removePAT, theme, setTheme, addToast } = useApp()
  const [patInput, setPATInput] = useState('')
  const [validating, setValidating] = useState(false)
  const [showPATInput, setShowPATInput] = useState(false)

  const handleSavePAT = async () => {
    if (!patInput.trim()) return
    setValidating(true)
    const ok = await setPAT(patInput.trim())
    setValidating(false)
    if (ok) {
      setPATInput('')
      setShowPATInput(false)
    }
  }

  const handleExportSRS = () => {
    const json = exportSRSData()
    const today = new Date().toISOString().slice(0, 10)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lv-dash-srs-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('SRSデータをエクスポートしました', 'success')
  }

  const handleImportSRS = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const json = await file.text()
        importSRSData(json)
        addToast('SRSデータをインポートしました', 'success')
      } catch {
        addToast('インポート失敗: 不正なファイル形式', 'error')
      }
    }
    input.click()
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-zinc-950">
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <h1 className="font-mono text-base font-bold text-zinc-100 uppercase tracking-wider">Settings</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* PAT */}
        <section>
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">
            GitHub PAT
          </h2>
          <div className="rounded border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            {pat ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-zinc-400">ghp_****</span>
                  <span className="font-mono text-[10px] text-sky-400 uppercase tracking-wider">Connected</span>
                </div>
                {showPATInput ? (
                  <>
                    <input
                      type="password"
                      value={patInput}
                      onChange={(e) => setPATInput(e.target.value)}
                      placeholder="github_pat_..."
                      className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 focus:border-sky-400 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePAT}
                        disabled={!patInput.trim() || validating}
                        className="flex-1 font-mono rounded border border-sky-400 px-3 py-2 text-xs uppercase tracking-wider text-sky-400 hover:bg-sky-400 hover:text-zinc-950 transition-colors disabled:opacity-40"
                      >
                        {validating ? '検証中...' : '保存'}
                      </button>
                      <button
                        onClick={() => { setShowPATInput(false); setPATInput('') }}
                        className="font-mono rounded border border-zinc-700 px-3 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:border-zinc-500"
                      >
                        キャンセル
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPATInput(true)}
                      className="flex-1 font-mono rounded border border-zinc-700 px-3 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      変更
                    </button>
                    <button
                      onClick={removePAT}
                      className="flex-1 font-mono rounded border border-red-900 px-3 py-2 text-xs uppercase tracking-wider text-red-400 hover:border-red-700 hover:text-red-300 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="font-mono text-xs text-zinc-500 leading-relaxed">
                  GitHub Fine-grained PAT を入力<br />
                  スコープ: Contents (RO) + Metadata (RO)<br />
                  リポジトリ: life-data
                </p>
                <input
                  type="password"
                  value={patInput}
                  onChange={(e) => setPATInput(e.target.value)}
                  placeholder="github_pat_..."
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 focus:border-sky-400 focus:outline-none"
                />
                <button
                  onClick={handleSavePAT}
                  disabled={!patInput.trim() || validating}
                  className="w-full font-mono rounded border border-sky-400 px-4 py-2 text-xs uppercase tracking-wider text-sky-400 hover:bg-sky-400 hover:text-zinc-950 transition-colors disabled:opacity-40"
                >
                  {validating ? '検証中...' : '検証して接続'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Theme */}
        <section>
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Theme
          </h2>
          <div className="rounded border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex gap-2">
              {(['system', 'light', 'dark'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 font-mono rounded border px-3 py-2 text-xs uppercase tracking-wider transition-colors ${
                    theme === t
                      ? 'border-sky-400 bg-sky-400 text-zinc-950'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {t === 'system' ? 'Auto' : t === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SRS Data */}
        <section>
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">
            SRS Data
          </h2>
          <div className="rounded border border-zinc-800 bg-zinc-900 p-4 space-y-2">
            <button
              onClick={handleExportSRS}
              className="w-full font-mono rounded border border-zinc-700 px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 hover:border-sky-400 hover:text-sky-400 transition-colors"
            >
              Export SRS Data
            </button>
            <button
              onClick={handleImportSRS}
              className="w-full font-mono rounded border border-zinc-700 px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 hover:border-sky-400 hover:text-sky-400 transition-colors"
            >
              Import SRS Data
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
