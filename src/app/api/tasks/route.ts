import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Task, ItemsState, ColumnId } from "@/types/task";
import type { JsonValue } from "@prisma/client/runtime/library";

// ★★★ 追加: Prismaから返ってくるデータの型を正確に定義 ★★★
type TaskWithStatusFromDB = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status_id: number | null;
  created_at: Date;
  updated_at: Date;
  tags: JsonValue;
  limited_at: Date | null;
  status: {
    id: number;
    name: string;
  } | null;
};

// GET - ログインしているユーザーのタスクを取得する
export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        user: { clerk_user_id: clerkUserId },
        NOT: { status: { name: "canceled" } },
      },
      include: {
        status: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // ★★★ 変更点: reduceの引数に明示的な型を指定 ★★★
    const categorizedTasks = tasks.reduce(
      (acc: ItemsState, task: TaskWithStatusFromDB) => {
        const status = task.status?.name as ColumnId;
        if (status && acc.hasOwnProperty(status)) {
          acc[status].push({
            ...task,
            id: String(task.id),
            dueDate: task.limited_at
              ? new Date(task.limited_at).toISOString().split("T")[0]
              : null,
            description: task.description || null,
          });
        }
        return acc;
      },
      { ToDo: [], Doing: [], Done: [] } as ItemsState
    );

    return NextResponse.json(categorizedTasks);
  } catch (error: unknown) {
    console.error("API GET Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
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
    const { title, description, dueDate }: Partial<Task> = await request.json();
    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const dbUser = await prisma.user.findUnique({
      where: { clerk_user_id: clerkUserId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in our database." },
        { status: 404 }
      );
    }

    const todoStatus = await prisma.taskStatus.findUnique({
      where: { name: "ToDo" },
    });
    if (!todoStatus) throw new Error("'ToDo' status not found in database.");

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        limited_at: dueDate ? new Date(dueDate) : null,
        user_id: dbUser.id,
        status_id: todoStatus.id,
      },
    });

    return NextResponse.json(
      { ...newTask, id: String(newTask.id) },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("API POST Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to create task", details: errorMessage },
      { status: 500 }
    );
  }
}
