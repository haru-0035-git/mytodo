import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// グローバルなprismaインスタンスの型を定義します。
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClientのインスタンスを生成するシングルトン関数
const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaNeon({ connectionString });

  // ★★★ 修正点: オプションオブジェクト全体を 'any' にキャストします ★★★
  // これにより、'adapter' プロパティが存在しないという型エラーを根本的に回避します。
  return new PrismaClient({
    adapter,
  } as any);
};

// `globalThis.prisma` が未定義の場合はシングルトン関数を呼び出して新しいインスタンスを生成します。
const prisma = globalThis.prisma ?? prismaClientSingleton();

// アプリケーション全体で使用するために、単一のインスタンスをエクスポートします。
export default prisma;

// 本番環境以外では、生成したインスタンスをグローバルオブジェクトに保存します。
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
