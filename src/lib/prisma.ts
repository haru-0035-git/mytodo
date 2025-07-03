import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// グローバルなprismaインスタンスの型を定義します。
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClientのインスタンスを生成するシングルトン関数
const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;

  // ★★★ 修正点: Poolの初期化を再度行います ★★★
  // 'isServer'エラーはPoolの初期化プロセスに問題があることを示唆しているため、
  // 明示的にPoolを作成し、型キャストでビルドエラーを回避するアプローチに戻します。
  const pool = new Pool({ connectionString });

  // ★★★ 修正点: Vercelのビルドエラーを回避するため、`pool`を`any`型としてキャストします ★★★
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(pool as any);

  return new PrismaClient({
    adapter,
  });
};

// `globalThis.prisma` が未定義の場合はシングルトン関数を呼び出して新しいインスタンスを生成します。
const prisma = globalThis.prisma ?? prismaClientSingleton();

// アプリケーション全体で使用するために、単一のインスタンスをエクスポートします。
export default prisma;

// 本番環境以外では、生成したインスタンスをグローバルオブジェクトに保存します。
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
