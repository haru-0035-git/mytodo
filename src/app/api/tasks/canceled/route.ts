import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Task } from "@/types/task";

// ステータスが'canceled'のタスクのみを取得する (GET)
export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // ★★★ 変更点: mapの引数から明示的な型定義を削除 ★★★
    // TypeScriptが 'tasksFromDb' から 'task' の型を正しく推論します。
    interface TaskFromDb {
      id: number;
      limited_at: Date | null;
      description?: string | null;
      [key: string]: any;
    }

    const canceledTasks: Task[] = tasksFromDb.map(
      (task: TaskFromDb): Task => ({
        ...task,
        id: String(task.id),
        title: task.title ?? "", // Ensure title is present; adjust as needed
        dueDate: task.limited_at
          ? new Date(task.limited_at).toISOString().split("T")[0]
          : null,
        description: task.description || null,
      })
    );

    return NextResponse.json(canceledTasks);
  } catch (error) {
    console.error("API GET (canceled) Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch canceled tasks", details: errorMessage },
      { status: 500 }
    );
  }
}
