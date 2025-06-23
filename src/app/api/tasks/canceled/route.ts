import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import type { Task } from "@/types/task";

type TaskFromDB = Omit<Task, "dueDate"> & {
  id: number;
  limited_at?: Date | null;
};

// ステータスが'canceled'のタスクのみを取得する (GET)
export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userResult = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE clerk_user_id = ?",
      [clerkUserId]
    );
    if (userResult.length === 0) {
      return NextResponse.json([]); // ユーザーが見つからなければ空の配列を返す
    }
    const internalUserId = userResult[0].id;

    // 'canceled'ステータスのタスクのみを取得する
    const tasksFromDb = await query<TaskFromDB[]>(
      "SELECT t.* FROM tasks t JOIN task_statuses ts ON t.status_id = ts.id WHERE t.user_id = ? AND ts.name = 'canceled'",
      [internalUserId]
    );

    // フロントエンドで使いやすいようにデータを整形
    const canceledTasks: Task[] = tasksFromDb.map((task) => ({
      ...task,
      id: String(task.id),
      dueDate: task.limited_at
        ? new Date(task.limited_at).toISOString().split("T")[0]
        : undefined,
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
