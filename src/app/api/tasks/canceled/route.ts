import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma"; // Prisma Clientをインポート
import type { Task } from "@/types/task";

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
      // 念のため作成日時の新しい順で並び替え
      orderBy: {
        created_at: "desc",
      },
    });

    // フロントエンドで使いやすいようにデータを整形
    const canceledTasks: Task[] = tasksFromDb.map((task) => ({
      ...task,
      id: String(task.id),
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
