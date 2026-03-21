# keisetsu Publisher

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/kumo01GitHub/keisetsu-publisher/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/kumo01GitHub/keisetsu-publisher/actions/workflows/ci.yml/badge.svg)](https://github.com/kumo01GitHub/keisetsu-publisher/actions/workflows/ci.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a0da510a881f4e229b63f0db95009c33)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-publisher/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/a0da510a881f4e229b63f0db95009c33)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-publisher/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

keisetsu の deck 編集・生成ツールです。  
Next.js 上で動作し、ブラウザ内で `.kdb` と deck manifest を生成します。

## できることの概要

- 新規 deck を作成してカード編集
- CSV 取り込みでカード一括投入
- 既存 `.kdb` を読み込んで再編集
- `deck_metadata` + `cards` を含む `.kdb` を生成
- `keisetsu-database/catalog/decks/` に配置する deck manifest を生成
- `.kdb` + manifest の同梱 ZIP を生成

## 対応言語

- English (`en`)
- 日本語 (`ja`)

## アーキテクチャ

```text
Next.js (App Router)
	|- src/app/layout.tsx
	|    - フォント/全体レイアウト定義
	|
	|- src/app/page.tsx  (client component)
	|    - deckメタ情報とカード編集UI
	|    - CSV/kdb取り込み
	|    - sql.js でSQLite生成
	|    - deck manifest生成
	|    - JSZipで同梱zip出力
	|
	|- src/app/page.module.css
			 - 管理画面スタイル
```

### 主な依存

- `sql.js`: ブラウザ内で SQLite を生成/読み込み
- `papaparse`: CSV パース
- `jszip`: 複数成果物の ZIP 化

## ローカルの開発手順

### 前提

- Node.js 20 系以上（推奨）
- npm

### セットアップ

```bash
cd keisetsu-publisher
npm ci
```

### 開発サーバ起動

```bash
npm run dev
```

### 品質チェック

```bash
npm run lint
npm run build
```

### 利用フロー（最短）

1. `npm run dev` で画面を開く
2. カードを直接入力、または CSV / kdb を取り込む
3. deck メタ情報（ID、タイトル、言語など）を調整
4. `kdbのみ` または `deck jsonのみ` または `同梱ZIP` をダウンロード
5. 生成物を `keisetsu-database` に反映して検証する

## 出力の想定反映先

- `.kdb` -> `keisetsu-database/databases/`
- `deck-id.json` -> `keisetsu-database/catalog/decks/`

## 利用方法

1. [keisetsu-publisher 公開ページ](https://keisetsu-publisher.vercel.app) にアクセス
2. 新規 deck を作成、または CSV / 既存 kdb を取り込む
3. カードや deck 情報（ID、タイトル、言語など）を編集
4. 「kdbのみ」「deck jsonのみ」「同梱ZIP」いずれかをダウンロード
5. 生成物を keisetsu-database に反映して検証

## 公開方法

### 公開URL

- [https://keisetsu-publisher.vercel.app](https://keisetsu-publisher.vercel.app)

### Vercel での公開手順

1. keisetsu-publisher ディレクトリを GitHub などのリポジトリに push する
2. Vercel（https://vercel.com）にログインし、「Add New Project」からリポジトリを選択
3. Framework: Next.js（自動認識）/ Root Directory: keisetsu-publisher を指定
4. 必要に応じて環境変数（.env）を設定
5. 「Deploy」ボタンでデプロイ開始
6. デプロイ完了後、発行された URL でアクセス可能
7. main ブランチを更新（push/merge）するだけで自動的に再デプロイされる

## 関連リンク

- [keisetsu-database](https://github.com/kumo01GitHub/keisetsu-database)
- [keisetsu-mobile](https://github.com/kumo01GitHub/keisetsu-mobile)
- [keisetsu-docs](https://github.com/kumo01GitHub/keisetsu-docs)
