import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Task, ItemsState, ColumnId } from "@/types/task";
import type { Prisma } from "@prisma/client";

// PrismaのfindManyとincludeから返されるタスクの正確な型を定義します
// ★★★ 修正点: モデル名'Task'に合わせて 'TaskGetPayload' に修正します ★★★
type TaskWithStatus = Prisma.TaskGetPayload<{
  include: {
    status: true;
  };
}>;

// GET - ログインしているユーザーのタスクを取得する
export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ ToDo: [], Doing: [], Done: [] });
    }

    const tasksFromDb: TaskWithStatus[] = await prisma.task.findMany({
      where: {
        user_id: user.id,
        NOT: {
          status: {
            name: "canceled",
          },
        },
      },
      include: {
        status: true,
      },
    });

    const categorizedTasks: ItemsState = { ToDo: [], Doing: [], Done: [] };
    tasksFromDb.forEach((task: TaskWithStatus) => {
      const status = task.status?.name as ColumnId | undefined;

      if (status && status in categorizedTasks) {
        categorizedTasks[status].push({
          id: String(task.id),
          title: task.title,
          description: task.description ?? undefined,
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
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, dueDate } =
      (await request.json()) as Partial<Task>;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerk_user_id: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Authenticated user not found in database." },
        { status: 404 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        limited_at: dueDate ? new Date(dueDate) : null,
        user: {
          connect: { id: user.id },
        },
        status: {
          connect: { name: "ToDo" },
        },
      },
    });

    const taskToReturn = {
      ...newTask,
      id: String(newTask.id),
      description: newTask.description ?? undefined,
    };

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
