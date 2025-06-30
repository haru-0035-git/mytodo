import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma"; // Prisma Clientをインポート
import type { Task, ColumnId, StatusName } from "@/types/task";

// 特定のタスクの「内容」を更新する (PUT)
export async function PUT(
  request: NextRequest,
  context: { params: { taskId: string } }
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const taskId = parseInt(context.params.taskId, 10);
    const { title, description, dueDate }: Partial<Task> = await request.json();
    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        // AND条件: タスクのIDが一致し、かつ所有者のclerk_user_idも一致する場合のみ更新
        user: {
          clerk_user_id: clerkUserId,
        },
      },
      data: {
        title,
        description: description || null,
        limited_at: dueDate ? new Date(dueDate) : null,
      },
      include: {
        status: true, // 更新後のデータにステータス情報も結合する
      },
    });

    // フロントエンドで使いやすいように、返却するデータの形を整える
    const taskToReturn = {
      ...updatedTask,
      id: String(updatedTask.id),
      dueDate: updatedTask.limited_at
        ? new Date(updatedTask.limited_at).toISOString().split("T")[0]
        : null,
      status: updatedTask.status?.name,
    };

    return NextResponse.json(taskToReturn);
  } catch (error) {
    // タスクが見つからない、または所有者でない場合にPrismaはエラーを投げる
    console.error("API PUT Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to update task. Record to update not found or forbidden.",
      },
      { status: 404 }
    );
  }
}

// 特定のタスクの「ステータス」を更新する (PATCH)
export async function PATCH(
  request: NextRequest,
  context: { params: { taskId: string } }
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const taskId = parseInt(context.params.taskId, 10);
    const { newStatusName }: { newStatusName: StatusName } =
      await request.json();

    const status = await prisma.taskStatus.findUnique({
      where: { name: newStatusName },
    });
    if (!status)
      return NextResponse.json(
        { error: "Invalid status name" },
        { status: 400 }
      );

    // ここでもwhere句で所有者チェックを同時に行う
    await prisma.task.update({
      where: {
        id: taskId,
        user: { clerk_user_id: clerkUserId },
      },
      data: {
        status_id: status.id,
      },
    });

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("API PATCH Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to update task status. Record to update not found or forbidden.",
      },
      { status: 404 }
    );
  }
}

// 特定のタスクを削除する (DELETE)
export async function DELETE(
  _request: NextRequest,
  context: { params: { taskId: string } }
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const taskId = parseInt(context.params.taskId, 10);

    // where句で所有者チェックと存在確認を同時に行う
    await prisma.task.delete({
      where: {
        id: taskId,
        user: { clerk_user_id: clerkUserId },
      },
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to delete task. Record to delete not found or forbidden.",
      },
      { status: 404 }
    );
  }
}
