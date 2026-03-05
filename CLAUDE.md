# LV-Dash - CLAUDE.md

## ミッション

個人ライフログダッシュボード（lv-dash）の開発・改善。
`life-data` の Markdown/YAML データを可視化する PWA アプリ。

## 技術スタック

- **React 19** (StrictMode)
- **TypeScript** (~5.9)
- **Tailwind CSS v4** (Vite プラグイン経由)
- **Vite 7** + `vite-plugin-pwa`（PWA 対応）
- **React Router v7**
- **js-yaml** — YAML ファイルの読み込み・パース
- **react-markdown** + remark-gfm — Markdown レンダリング

## 開発コマンド

```bash
npm run dev      # 開発サーバー
npm run build    # 本番ビルド
npm run preview  # ビルド結果の確認
```

## 開発ルール

- データソースは `$LIFE_DATA`（`/home/tnb/life-data`）の Markdown/YAML を参照
- コンポーネントは `src/` 配下に配置
- 破壊的な UI 変更前は既存画面のスクリーンショットを残す
- PWA キャッシュ戦略を変更する場合は `vite-plugin-pwa` の設定を確認

---

<!-- cross-project skills from life-claude -->
@/home/tnb/life-claude/.claude/skills/task/SKILL.md
@/home/tnb/life-claude/.claude/skills/research/SKILL.md
@/home/tnb/life-claude/.claude/skills/work-consult/SKILL.md
