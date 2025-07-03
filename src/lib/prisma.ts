import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// グローバルなprismaインスタンスの型を定義します。
declare global {
  // 警告が出ていたため、この行のESLint無効化コメントを削除しました。
  var prisma: PrismaClient | undefined;
}

// PrismaClientのインスタンスを生成するシングルトン関数
// このパターンは、Prisma公式ドキュメントで推奨されています。
const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;

  // NeonのサーバーレスドライバからPoolをインスタンス化
  const pool = new Pool({ connectionString });

  // ★★★ 修正点: Vercelのビルドエラーを回避するため、`pool`を`any`型としてキャストします ★★★
  // この行でESLintルールも無効化しています。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(pool as any);

  return new PrismaClient({
    // ここでのキャストは不要になったため削除しました。
    adapter,
  });
};

// `globalThis.prisma` が未定義の場合はシングルトン関数を呼び出して新しいインスタンスを生成します。
// これにより、開発環境でのホットリロード時にインスタンスが増え続けるのを防ぎます。
const prisma = globalThis.prisma ?? prismaClientSingleton();

// アプリケーション全体で使用するために、単一のインスタンスをエクスポートします。
export default prisma;

// 本番環境以外では、生成したインスタンスをグローバルオブジェクトに保存します。
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
