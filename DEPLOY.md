# Vercel デプロイ手順

1. Vercel にプロジェクトをデプロイする前に、環境変数を設定する必要があります：

   - Vercel のダッシュボードで、プロジェクトの「Settings」→「Environment Variables」に移動
   - 以下の環境変数を追加：
     - Name: `GEMINI_API_KEY`
     - Value: あなたの Gemini API キー

2. プロジェクトを GitHub にプッシュ

3. Vercel でデプロイ：
   - GitHub リポジトリを連携
   - 「Import」をクリック
   - 必要に応じて設定を調整
   - 「Deploy」をクリック

注意：

- 環境変数は必ず Vercel ダッシュボードで設定してください
- ソースコードに直接 API キーを含めないでください

ローカルでブラウザ表示して動作確認する手順

1. ルートに `.env` を作成し、Gemini API キーを追加します（※このファイルは絶対にコミットしないでください）：

```
GEMINI_API_KEY=your_gemini_api_key_here
```

2. 依存パッケージをインストールします：

```bash
npm install
```

3. サーバーを起動します（ローカルで静的ファイルを配信しつつ /api/generate を提供します）：

```bash
npm start
```

4. ブラウザで次を開きます：

```
http://localhost:3000/index.html
```

この構成では、クライアント側（`main.js`）はサーバーの `/api/generate` に POST リクエストを送り、サーバーが Gemini API を呼び出して結果を返します。これにより、API キーはサーバー側の環境変数で保護されます。

"2---ーーーーーーー--------------------------
---ーーーーーーー--------------------------


## Vercel CLI を使ったデプロイ（コマンドライン）

ローカルや CI から Vercel に直接デプロイしたい場合、Vercel CLI を使うと便利です。以下は macOS（zsh）での手順です。

1. Vercel CLI のインストール（グローバル）

```bash
npm install -g vercel
```

2. ログイン

```bash
vercel login
```

3. プロジェクトをリンク（初回）

プロジェクトルートで実行します。既にダッシュボードから作成済みの場合は `vercel link` で関連付けできます。

```bash
cd /path/to/your/project
vercel link
```

4. 環境変数の設定（CLI またはダッシュボード）

- ダッシュボード: プロジェクトの Settings → Environment Variables で追加
- CLI（対話式）:

```bash
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_API_KEY preview
vercel env add GEMINI_API_KEY development
```

（`vercel env add` は対話形式で値を入力するよう促されます。ダッシュボードで設定する方法がもっとも簡単です。）

5. ローカルで Vercel 環境をエミュレートして確認

```bash
vercel dev
```

6. デプロイ

```bash
vercel --prod
```

もしくはプレビューを作成するだけなら `vercel`（`--prod` を付けない）を使います。

### 注意点 / トラブルシュート

- このリポジトリにはローカル用の `server.js`（Express）と、Next.js の `app/` ディレクトリの両方が存在します。Vercel 上で永続的に動作するフルサーバー（Express のような常駐プロセス）はそのままでは動作しません。Vercel では Next.js の API Routes や Serverless Functions を使うのが推奨です。
- 既に `app/api/generate/route.ts` がある場合は、それが Vercel のビルド・実行環境上で動作する想定です。Vercel にデプロイする際は `server.js` を無視して、Next.js のルート（`app/`）を使ってデプロイすることを推奨します。
- ビルドや実行に失敗する場合は、Vercel のデプロイログ（Dashboard → Deployments）を確認してください。依存関係のインストールやビルドコマンドの設定（`vercel.json` や dashboard の Build & Output settings）を見直す必要があります。

付録: よく使うコマンドまとめ

```bash
# インストール
npm install -g vercel

# ログイン
vercel login

# リンク（初回）
vercel link

# ローカル動作確認
vercel dev

# 本番デプロイ
vercel --prod
```
