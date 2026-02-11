import { useState } from 'react'
import type { WorkflowInput, WorkflowState } from '../types'
import { useApp } from '../context/AppContext'

interface Props {
  wf: WorkflowState
  onClose: () => void
}

export function DispatchDialog({ wf, onClose }: Props) {
  const { dispatch } = useApp()
  const inputs = wf.meta?.inputs ?? []
  const requiredInputs = inputs.filter((i) => i.required)
  const optionalInputs = inputs.filter((i) => !i.required)

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const input of inputs) {
      init[input.name] = input.default ?? ''
    }
    return init
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const allRequiredFilled = requiredInputs.every((i) => values[i.name]?.trim())

  const handleSubmit = async () => {
    setSubmitting(true)
    const cleaned: Record<string, string> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v.trim()) cleaned[k] = v.trim()
    }
    await dispatch(wf, cleaned)
    setSubmitting(false)
    onClose()
  }

  const displayName = wf.meta?.displayName ?? wf.workflow.name

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">
          {inputs.length === 0 ? `「${displayName}」を実行しますか？` : `${displayName} を実行`}
        </h2>

        {requiredInputs.length > 0 && (
          <div className="space-y-3 mb-4">
            {requiredInputs.map((input) => (
              <InputField key={input.name} input={input} value={values[input.name]} onChange={(v) => setValues((p) => ({ ...p, [input.name]: v }))} />
            ))}
          </div>
        )}

        {optionalInputs.length > 0 && (
          <>
            <button
              type="button"
              className="mb-3 text-sm text-blue-600 dark:text-blue-400"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▾ 詳細オプションを閉じる' : '▸ 詳細オプション'}
            </button>
            {showAdvanced && (
              <div className="space-y-3 mb-4">
                {optionalInputs.map((input) => (
                  <InputField key={input.name} input={input} value={values[input.name]} onChange={(v) => setValues((p) => ({ ...p, [input.name]: v }))} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm font-medium"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allRequiredFilled || submitting}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {submitting ? '実行中...' : '実行する'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InputField({
  input,
  value,
  onChange,
}: {
  input: WorkflowInput
  value: string
  onChange: (v: string) => void
}) {
  const label = `${input.name}${input.required ? ' *' : ''}`

  if (input.type === 'choice' && input.options) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          {input.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    )
  }

  if (input.type === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{input.name}</label>
        <button
          type="button"
          onClick={() => onChange(value === 'true' ? 'false' : 'true')}
          className={`relative h-6 w-11 rounded-full transition-colors ${value === 'true' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${value === 'true' ? 'translate-x-5' : ''}`} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
        {input.description && <span className="ml-1 text-xs text-gray-400">({input.description})</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={input.default || input.description || ''}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
      />
    </div>
  )
}
