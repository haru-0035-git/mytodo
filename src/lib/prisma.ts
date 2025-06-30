// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// PrismaClientのインスタンスをグローバルに宣言
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 開発環境では、ホットリロードでファイルが再実行されるたびに
// 新しいPrismaClientが作られてしまうのを防ぐ
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 開発時に実行されたクエリをコンソールに表示する設定
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
