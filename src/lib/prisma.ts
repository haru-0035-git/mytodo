import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
// Poolのインポートは不要になったため削除しました。

// グローバルなprismaインスタンスの型を定義します。
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClientのインスタンスを生成するシングルトン関数
const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;

  // ★★★ 修正点: Poolの作成を省略し、アダプタに直接接続文字列を渡します ★★★
  // これにより、'isServer'エラーの原因となっていたPoolの初期化を回避します。
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    // Vercelビルド環境での型エラーを回避するためのキャスト
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: adapter as any,
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
