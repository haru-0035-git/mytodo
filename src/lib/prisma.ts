import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
// ★★★ 修正点: Poolは不要になったため、インポートを削除しました ★★★
// import { Pool } from "@neondatabase/serverless";

// グローバルなprismaインスタンスの型を定義します。
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClientのインスタンスを一度だけ生成するシングルトン関数
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL_WITH_ADAPTER;

  // ★★★ これが最も重要な修正点です ★★★
  // Prisma 6.6.0以降の正しい初期化方法です。
  // Poolを使わず、PrismaNeonアダプタに直接接続文字列を渡します。
  const adapter = new PrismaNeon({ connectionString });

  // Vercelのビルド環境で発生する型エラーを回避するための最終手段としてのキャスト
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
};

// globalThisオブジェクトにprismaインスタンスが存在すればそれを使い、なければ新しく作成します。
const prisma = globalThis.prisma ?? prismaClientSingleton();

// アプリケーション全体で使えるように、単一のインスタンスをエクスポートします。
export default prisma;

// 本番環境以外では、ホットリロードでインスタンスが増えないようにグローバルに保存します。
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
