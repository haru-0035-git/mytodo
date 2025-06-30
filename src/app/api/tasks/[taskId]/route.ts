import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Task, StatusName } from "@/types/task";

// PUT - 特定のタスクの内容を更新する
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
        user: { clerk_user_id: clerkUserId }, // 所有者チェック
      },
      data: {
        title,
        description: description || null,
        limited_at: dueDate ? new Date(dueDate) : null,
      },
      include: { status: true },
    });

    return NextResponse.json({
      ...updatedTask,
      id: String(updatedTask.id),
      dueDate: updatedTask.limited_at?.toISOString().split("T")[0],
      status: updatedTask.status?.name,
    });
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 404 }
    );
  }
}

// PATCH - 特定のタスクのステータスを更新する
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

    await prisma.task.update({
      where: {
        id: taskId,
        user: { clerk_user_id: clerkUserId }, // 所有者チェック
      },
      data: { status_id: status.id },
    });

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("API PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 404 }
    );
  }
}

// DELETE - 特定のタスクを削除する
export async function DELETE(
  request: NextRequest,
  context: { params: { taskId: string } }
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const taskId = parseInt(context.params.taskId, 10);

    // Prismaでは、存在しないレコードを削除しようとするとエラーになるため、
    // where句で所有者チェックを同時に行うことで、セキュリティと存在確認を兼ねる
    await prisma.task.delete({
      where: {
        id: taskId,
        user: { clerk_user_id: clerkUserId }, // 所有者チェック
      },
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 404 }
    );
  }
}
