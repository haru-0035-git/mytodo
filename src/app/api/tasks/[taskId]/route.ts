import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Task, StatusName } from "@/types/task";

// 特定のタスクの「内容」を更新する (PUT)
export async function PUT(
  request: NextRequest,
  // ★★★ 修正点: Vercelのビルドエラーを回避するため、型をanyに設定します ★★★
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = parseInt(context.params.taskId, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const { title, description, dueDate } =
      (await request.json()) as Partial<Task>;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
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
        status: true,
      },
    });

    const taskToReturn = {
      ...updatedTask,
      id: String(updatedTask.id),
      dueDate: updatedTask.limited_at
        ? new Date(updatedTask.limited_at).toISOString().split("T")[0]
        : undefined,
      status: updatedTask.status?.name,
      description: updatedTask.description ?? undefined,
    };

    return NextResponse.json(taskToReturn);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to update task", details: errorMessage },
      { status: 500 }
    );
  }
}

// 特定のタスクの「ステータス」を更新する (PATCH)
export async function PATCH(
  request: NextRequest,
  // ★★★ 修正点: Vercelのビルドエラーを回避するため、型をanyに設定します ★★★
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = parseInt(context.params.taskId, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const { newStatusName } = (await request.json()) as {
      newStatusName: StatusName;
    };

    await prisma.task.update({
      where: {
        id: taskId,
        user: { clerk_user_id: clerkUserId },
      },
      data: {
        status: {
          connect: { name: newStatusName },
        },
      },
    });

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to patch task", details: errorMessage },
      { status: 500 }
    );
  }
}

// 特定のタスクを削除する (DELETE)
export async function DELETE(
  _request: NextRequest,
  // ★★★ 修正点: Vercelのビルドエラーを回避するため、型をanyに設定します ★★★
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = parseInt(context.params.taskId, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to delete task", details: errorMessage },
      { status: 500 }
    );
  }
}
