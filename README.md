# LV Dash

LifeVault GitHub Actions をスマホからワンタップで操作するPWAダッシュボード。

**URL**: https://hcstnb2047.github.io/LV-Dash/

## セットアップ

### 1. GitHub Fine-grained PAT を作成

https://github.com/settings/personal-access-tokens/new を開き、以下を設定する。

| 項目 | 値 |
|------|-----|
| Token name | `LV-Dash` |
| Expiration | 90 days（推奨） |
| Repository access | **Only select repositories** → `LifeVault` のみ |

**Permissions（3つ）**:

| Permission | Access |
|-----------|--------|
| **Actions** | Read and write |
| **Contents** | Read-only |
| **Metadata** | Read-only |

**Generate token** をクリックし、`github_pat_...` をコピーする。

### 2. LV Dash にPATを登録

1. スマホで https://hcstnb2047.github.io/LV-Dash/ を開く
2. **「PATを設定して始める」** をタップ
3. コピーしたPATをペースト
4. **「検証して保存」** をタップ
5. ワークフロー一覧が表示されたら完了

### 3. ホーム画面に追加（PWA）

**iPhone Safari**:

1. 共有ボタン（□↑）をタップ
2. 「ホーム画面に追加」を選択
3. 「追加」をタップ

ホーム画面からアプリのように起動できるようになる。

## 使い方

### ワークフロー実行

1. カードの **▶ 実行** をタップ
2. inputs がある場合はフォームに入力
3. **実行する** をタップ
4. ステータスが自動更新される（30秒間隔、最大10分）

### お気に入り

- カード左の **☆** をタップで ★ に切替
- お気に入りは一覧の先頭に表示される
- フィルターの **★** タブでお気に入りだけ表示

### カテゴリフィルター

| カテゴリ | 内容 |
|---------|------|
| 記録 | 記事収集、健康データ取込、Task同期 |
| 分析 | メンタルウェザー、ウェルビーイング、月次レポート |
| リマインダー | 朝リマインダー、週報、Issue棚卸し |
| リサーチ | Deep Research、書籍リサーチ |
| iPhone | iPhoneコマンド |
| システム | Streakバッジ、ラベル初期化、デバッグ用 |

### 実行履歴

カードをタップすると、直近3回の実行結果が展開表示される。

### 設定画面

- **PAT管理**: 検証・削除・再設定
- **テーマ**: OS連動 / ライト / ダーク
- **ワークフロー表示**: 個別にON/OFF切替

## PAT更新手順

PATの有効期限が切れた場合:

1. GitHub で新しいPATを発行（手順1と同じ）
2. LV Dash の設定画面を開く
3. 「PATを削除」をタップ
4. 新しいPATを入力して「検証して保存」

## 技術スタック

Vite + React + TypeScript + Tailwind CSS v4 + React Router (HashRouter) + Vite PWA Plugin

GitHub Pages でホスティング、main push で自動デプロイ。
