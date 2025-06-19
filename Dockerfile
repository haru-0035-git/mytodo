# === ビルドステージ (Stage 1) ===
# 依存関係のインストールとアプリケーションのビルドを行う
FROM node:20-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係のファイルを先にコピーする（キャッシュ効率化のため）
COPY package.json yarn.lock* package-lock.json* ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# .envファイルの内容をビルド引数として受け取る
# docker-compose.ymlから渡されることを想定
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

# ビルド時に環境変数を設定
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

# 本番用にアプリケーションをビルド
RUN npm run build


# === プロダクションステージ (Stage 2) ===
# ビルドステージから成果物のみをコピーし、実行する
FROM node:20-alpine AS runner

WORKDIR /src

# 本番実行用に最適化されたユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ビルドステージから必要なファイルのみをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 所有者をnextjsユーザーに設定
USER nextjs

# ポートを公開
EXPOSE 3001

# サーバーを起動 (本番モード)
CMD ["node", "server.js"]
