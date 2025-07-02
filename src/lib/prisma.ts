import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// Neonの接続文字列を環境変数から取得します。
const connectionString = `${process.env.DATABASE_URL}`;

// 接続文字列を使用して、Neonデータベースの接続プールを作成します。
const pool = new Pool({ connectionString });

// 作成したプールを基に、Prisma-Neonアダプタを初期化します。
// Vercelのビルド環境で発生する型エラーを回避するため、
// `pool` を `any` 型としてキャストし、型チェックを一時的に無効化します。
// 以下の行でESLintのエラーも意図的に無効化しています。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaNeon(pool as any);

// PrismaClientのインスタンスをグローバルに宣言するための型定義
declare global {
  var prisma: PrismaClient | undefined;
}

// グローバルに保存されたインスタンスがあれば再利用し、なければ新しいインスタンスを作成します。
// これにより、開発環境でのホットリロード時にインスタンスが増え続けるのを防ぎます。
const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// 本番環境以外では、生成したインスタンスをグローバルオブジェクトに保存します。
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// デフォルトエクスポート
export default prisma;
