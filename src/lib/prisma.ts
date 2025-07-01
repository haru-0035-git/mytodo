import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// PrismaClientのインスタンスを生成する関数を定義
const prismaClientSingleton = () => {
  const neon = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaNeon(neon);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : [],
  });
};

// グローバルオブジェクトの型を拡張
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// 開発環境では既存のインスタンスを使い回し、本番環境では新しいインスタンスを作成
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
