import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";

dotenv.config();
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });

// PrismaClientのインスタンスをグローバルに宣言し、
// 開発環境でのホットリロード時にインスタンスが増え続けるのを防ぎます。
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Neonの接続文字列から新しいPoolを作成
// const neon = new Pool({ connectionString: process.env.DATABASE_URL });
// PrismaがNeonのドライバを使うようにアダプタを設定
// const adapter = new PrismaNeon(neon);

// 開発環境ではグローバルに保存されたインスタンスを再利用し、
// 本番環境では常に新しいインスタンスを作成します。
export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
