import { NextResponse, type NextRequest } from "next/server";
// ★ 変更点: 未使用の 'currentUser' を削除
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import type { Task, ItemsState, ColumnId, StatusName } from "@/types/task";

type TaskFromDB = Omit<Task, "dueDate"> & {
  id: number;
  limited_at?: Date | null;
  status: StatusName;
};

// GET - ログインしているユーザーのタスクを取得する
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
      return NextResponse.json({ ToDo: [], Doing: [], Done: [] });
    }
    const internalUserId = userResult[0].id;

    const tasksFromDb = await query<TaskFromDB[]>(
      "SELECT t.*, ts.name as status FROM tasks t JOIN task_statuses ts ON t.status_id = ts.id WHERE t.user_id = ? AND ts.name != 'canceled'",
      [internalUserId]
    );

    const categorizedTasks: ItemsState = { ToDo: [], Doing: [], Done: [] };
    tasksFromDb.forEach((task) => {
      const status = task.status as ColumnId;
      if (status && categorizedTasks.hasOwnProperty(status)) {
        categorizedTasks[status].push({
          ...task,
          id: String(task.id),
          dueDate: task.limited_at
            ? new Date(task.limited_at).toISOString().split("T")[0]
            : undefined,
        });
      }
    });

    return NextResponse.json(categorizedTasks);
  } catch (error) {
    console.error("API GET Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - 新しいタスクを作成する
export async function POST(request: NextRequest) {
  // ★ 変更点: RequestをNextRequestに
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, dueDate }: Partial<Task> = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // ★ 変更点: ユーザーがDBに存在しない場合の自動作成ロジックを削除
    // Clerkで認証されたユーザーは、既にDBに存在していることを前提とします。
    const userResult = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE clerk_user_id = ?",
      [clerkUserId]
    );

    if (userResult.length === 0) {
      // ユーザーが見つからない場合はエラーを返します
      return NextResponse.json(
        { error: "Authenticated user not found in database." },
        { status: 404 }
      );
    }
    const internalUserId = userResult[0].id;

    const statusResult = await query<{ id: number }[]>(
      "SELECT id FROM task_statuses WHERE name = 'ToDo'",
      []
    );

    if (statusResult.length === 0) {
      console.error(
        "Database seed error: 'ToDo' status not found in task_statuses table."
      );
      return NextResponse.json(
        { error: "'ToDo' status is not configured in the database." },
        { status: 500 }
      );
    }
    const todoStatusId = statusResult[0].id;

    const result = await query<{ insertId: number }>(
      "INSERT INTO tasks (user_id, title, description, limited_at, status_id) VALUES (?, ?, ?, ?, ?)",
      [
        internalUserId,
        title,
        description || null,
        dueDate || null,
        todoStatusId,
      ]
    );

    const newTaskId = result.insertId;
    const newTasks = await query<Task[]>("SELECT * FROM tasks WHERE id = ?", [
      newTaskId,
    ]);

    const taskToReturn = { ...newTasks[0], id: String(newTasks[0].id) };

    return NextResponse.json(taskToReturn, { status: 201 });
  } catch (error) {
    console.error("API POST Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create task", details: errorMessage },
      { status: 500 }
    );
  }
}
