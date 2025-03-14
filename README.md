# VJMix - リアルタイムGLSLエディタ

VJMixは、GLSLシェーダーをリアルタイムでプレビューしながら編集できるWebアプリケーションです。

## 機能

- リアルタイムGLSLエディタとプレビュー
- コードオーバーレイ表示/非表示
- 別ウィンドウでのプレビュー表示
- シェーダーの保存と管理
- ユーザー認証

## 技術スタック

- Next.js 15
- TypeScript
- TailwindCSS
- Drizzle ORM
- Turso (SQLite)
- Clerk (認証)
- Google Cloud Storage
- Three.js / React Three Fiber
- Monaco Editor

## 開発環境のセットアップ

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/vjmix.git
cd vjmix
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な環境変数を設定します。

4. 開発サーバーを起動

```bash
npm run dev
```

5. ブラウザで http://localhost:3000 にアクセス

## データベースのセットアップ

1. Tursoアカウントを作成し、データベースを作成します。
2. 環境変数にデータベースURLとトークンを設定します。
3. マイグレーションを実行します。

```bash
npx drizzle-kit push:sqlite
```

## デプロイ

このプロジェクトはVercelにデプロイすることを推奨します。

```bash
vercel
```

## ライセンス

MIT
