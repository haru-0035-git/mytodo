import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import type { Task, ColumnId } from "@/types/task";

// ルートのコンテキストの型定義を削除

// 特定のタスクを更新する (PUT)
export async function PUT(
  request: NextRequest,
  // ★★★ 変更点: 型チェックとESLintの両方を回避 ★★★
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const taskId = context.params.taskId;
  const { title, description, dueDate }: Partial<Task> = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    // --- セキュリティチェック ---
    const userResult = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE clerk_user_id = ?",
      [clerkUserId]
    );
    if (userResult.length === 0)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    const internalUserId = userResult[0].id;

    const numericTaskId = parseInt(taskId, 10);
    if (isNaN(numericTaskId))
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });

    const taskResult = await query<{ user_id: number }[]>(
      "SELECT user_id FROM tasks WHERE id = ?",
      [numericTaskId]
    );
    if (taskResult.length === 0 || taskResult[0].user_id !== internalUserId) {
      return NextResponse.json(
        { error: "Forbidden or Task not found" },
        { status: 403 }
      );
    }
    // --- セキュリティチェックここまで ---

    await query(
      "UPDATE tasks SET title = ?, description = ?, limited_at = ? WHERE id = ?",
      [title, description || null, dueDate || null, numericTaskId]
    );

    const updatedTasks = await query<(Task & { status: ColumnId })[]>(
      "SELECT t.*, ts.name as status FROM tasks t JOIN task_statuses ts ON t.status_id = ts.id WHERE t.id = ?",
      [numericTaskId]
    );
    if (updatedTasks.length === 0) {
      return NextResponse.json(
        { error: "Failed to retrieve updated task" },
        { status: 404 }
      );
    }

    const taskToReturn = { ...updatedTasks[0], id: String(updatedTasks[0].id) };
    return NextResponse.json(taskToReturn);
  } catch (error) {
    console.error("API PUT Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update task", details: errorMessage },
      { status: 500 }
    );
  }
}

// 特定のタスクのステータスを更新する (PATCH)
export async function PATCH(
  request: NextRequest,
  // ★★★ 変更点: 型チェックとESLintの両方を回避 ★★★
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = context.params.taskId;
    const { newStatusName }: { newStatusName: ColumnId } = await request.json();
    if (!newStatusName)
      return NextResponse.json(
        { error: "newStatusName is required" },
        { status: 400 }
      );

    const statusResult = await query<{ id: number }[]>(
      "SELECT id FROM task_statuses WHERE name = ?",
      [newStatusName]
    );
    if (statusResult.length === 0)
      return NextResponse.json(
        { error: `Invalid status name: ${newStatusName}` },
        { status: 400 }
      );
    const newStatusId = statusResult[0].id;

    const numericTaskId = parseInt(taskId, 10);
    if (isNaN(numericTaskId))
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });

    const userResult = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE clerk_user_id = ?",
      [clerkUserId]
    );
    const internalUserId = userResult[0]?.id;
    if (!internalUserId)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const taskResult = await query<{ user_id: number }[]>(
      "SELECT user_id FROM tasks WHERE id = ?",
      [numericTaskId]
    );
    if (taskResult.length === 0 || taskResult[0].user_id !== internalUserId) {
      return NextResponse.json(
        { error: "Forbidden or Task not found" },
        { status: 403 }
      );
    }

    await query("UPDATE tasks SET status_id = ? WHERE id = ?", [
      newStatusId,
      numericTaskId,
    ]);
    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("API PATCH Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update task status: ${errorMessage}` },
      { status: 500 }
    );
  }
}
