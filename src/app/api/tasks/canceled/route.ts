import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Task } from "@/types/task"; // これはフロントエンド用のカスタム型
// ★★★ 修正点: Prismaが生成した正しい'Task'型（大文字）をインポートします ★★★
import type { Task as PrismaTask } from "@prisma/client";

// ステータスが'canceled'のタスクのみを取得する (GET)
export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Prismaを使って、ログインユーザーの、ステータスが'canceled'のタスクを取得
    const tasksFromDb = await prisma.task.findMany({
      where: {
        user: {
          clerk_user_id: clerkUserId,
        },
        status: {
          name: "canceled",
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // フロントエンドで使いやすいようにデータを整形
    const canceledTasks: Task[] = tasksFromDb.map((task: PrismaTask) => ({
      id: String(task.id),
      title: task.title,
      status: "canceled", // ステータスは'canceled'で確定
      dueDate: task.limited_at
        ? new Date(task.limited_at).toISOString().split("T")[0]
        : undefined,
      description: task.description === null ? undefined : task.description,
    }));

    return NextResponse.json(canceledTasks);
  } catch (error) {
    console.error("API GET (canceled) Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch canceled tasks", details: errorMessage },
      { status: 500 }
    );
  }
}
