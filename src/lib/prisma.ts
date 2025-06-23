// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// PrismaClientのインスタンスをグローバルに宣言
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 開発環境では、ホットリロードでファイルが再実行されるたびに
// 新しいPrismaClientが作られてしまうのを防ぐ
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // 実行されたクエリをコンソールに表示する設定
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
