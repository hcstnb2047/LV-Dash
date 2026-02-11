import type { WorkflowMeta } from '../types'

export const WORKFLOW_META: WorkflowMeta[] = [
  // 記録・収集
  { fileName: 'daily-clips.yml', displayName: '記事収集', category: 'collect' },
  {
    fileName: 'health-import.yml',
    displayName: '健康データ取込',
    category: 'collect',
    inputs: [
      { name: 'days', type: 'string', required: false, default: '7' },
      { name: 'update_daily', type: 'boolean', required: false, default: 'true' },
    ],
  },
  {
    fileName: 'health-sync-api.yml',
    displayName: '健康データ手動入力',
    category: 'collect',
    inputs: [
      { name: 'date', type: 'string', required: true, description: 'YYYY-MM-DD' },
      { name: 'steps', type: 'string', required: false, default: '0' },
      { name: 'active_cal', type: 'string', required: false, default: '0' },
      { name: 'exercise_min', type: 'string', required: false, default: '0' },
      { name: 'resting_hr', type: 'string', required: false, default: '0' },
      { name: 'hrv', type: 'string', required: false, default: '0' },
      { name: 'daylight_min', type: 'string', required: false, default: '0' },
    ],
  },
  {
    fileName: 'task-sync.yml',
    displayName: 'Task Inbox同期',
    category: 'collect',
    inputs: [
      { name: 'priority', type: 'choice', required: false, default: 'medium', options: ['high', 'medium', 'low'] },
      { name: 'category', type: 'string', required: false, default: 'daily-task' },
      { name: 'dry_run', type: 'boolean', required: false, default: 'false' },
    ],
  },
  {
    fileName: 'big6-sync.yml',
    displayName: 'BIG6トレーニング同期',
    category: 'collect',
    defaultHidden: true,
    inputs: [
      { name: 'payload', type: 'string', required: true, description: 'JSON payload' },
    ],
  },

  // 分析・レポート
  {
    fileName: 'health-pattern-analysis.yml',
    displayName: '活動パターン分析',
    category: 'analysis',
    inputs: [
      { name: 'days', type: 'string', required: false, default: '90' },
    ],
  },
  {
    fileName: 'mental-weather.yml',
    displayName: 'メンタルウェザー',
    category: 'analysis',
    inputs: [
      { name: 'week', type: 'string', required: false, description: '例: 2026-W06' },
    ],
  },
  {
    fileName: 'wellbeing-weekly.yml',
    displayName: 'ウェルビーイングスコア',
    category: 'analysis',
    inputs: [
      { name: 'week', type: 'string', required: false, description: '例: 2026-W06' },
    ],
  },
  {
    fileName: 'monthly-health-report.yml',
    displayName: '月次ヘルスレポート',
    category: 'analysis',
    inputs: [
      { name: 'month', type: 'string', required: false, description: '例: 2026-01' },
    ],
  },
  {
    fileName: 'health-alert.yml',
    displayName: '健康アラート検知',
    category: 'analysis',
    inputs: [
      { name: 'dry_run', type: 'boolean', required: false, default: 'false' },
    ],
  },

  // リマインダー
  { fileName: 'morning-reminder.yml', displayName: '朝リマインダー', category: 'reminder' },
  { fileName: 'schedule-reminders.yml', displayName: 'リマインダー一括', category: 'reminder' },
  { fileName: 'weekly-reminder.yml', displayName: '週報リマインダー', category: 'reminder' },
  { fileName: 'monthly-audit-reminder.yml', displayName: 'Issue棚卸し', category: 'reminder' },

  // リサーチ
  {
    fileName: 'deep-research.yml',
    displayName: 'Deep Research',
    category: 'research',
    inputs: [
      { name: 'topic', type: 'string', required: true },
      { name: 'provider', type: 'choice', required: false, default: 'gemini', options: ['gemini', 'perplexity', 'openai', 'grok'] },
      { name: 'mode', type: 'choice', required: false, default: 'general', options: ['general', 'book'] },
      { name: 'output', type: 'string', required: false },
    ],
  },
  {
    fileName: 'book-research.yml',
    displayName: '書籍リサーチ',
    category: 'research',
    inputs: [
      { name: 'book', type: 'string', required: true },
      { name: 'provider', type: 'choice', required: false, default: 'gemini', options: ['gemini', 'perplexity', 'openai', 'grok'] },
    ],
  },

  // iPhone連携
  {
    fileName: 'lifevault-command.yml',
    displayName: 'iPhoneコマンド',
    category: 'iphone',
    inputs: [
      { name: 'command', type: 'choice', required: true, options: ['quick-daily', 'task-add', 'clips', 'deep-research'] },
      { name: 'mood', type: 'string', required: false, default: '3', description: '1-5' },
      { name: 'args', type: 'string', required: false, default: '' },
    ],
  },

  // システム
  { fileName: 'streak-badge.yml', displayName: 'Streakバッジ更新', category: 'system' },
  { fileName: 'stale-issues.yml', displayName: '放置Issue整理', category: 'system' },
  { fileName: 'setup-labels.yml', displayName: 'ラベル初期化', category: 'system', defaultHidden: true },
  {
    fileName: 'shortcut-debug.yml',
    displayName: 'Shortcutデバッグ',
    category: 'system',
    defaultHidden: true,
    inputs: [
      { name: 'message', type: 'string', required: false, default: 'hello from iPhone' },
      { name: 'payload', type: 'string', required: false, default: '{}' },
    ],
  },
  {
    fileName: 'sign-shortcut-poc.yml',
    displayName: 'Shortcut PoC',
    category: 'system',
    defaultHidden: true,
    inputs: [
      { name: 'shortcut_script', type: 'choice', required: true, default: 'poc_hello.py', options: ['poc_hello.py', 'poc_health.py'] },
    ],
  },
]

export function getMetaByFileName(fileName: string): WorkflowMeta | null {
  return WORKFLOW_META.find((m) => m.fileName === fileName) ?? null
}
