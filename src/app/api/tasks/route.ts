import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma"; // Prisma Clientをインポート
import type { Task, ItemsState, ColumnId, StatusName } from "@/types/task";

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
        NOT: { status: { name: "canceled" } }, // 中止タスクは除外
      },
      include: {
        status: true, // ステータス情報を結合して取得
      },
    });

    const categorizedTasks: ItemsState = { ToDo: [], Doing: [], Done: [] };
    tasks.forEach((task) => {
      const status = task.status?.name as ColumnId;
      if (status && categorizedTasks.hasOwnProperty(status)) {
        categorizedTasks[status].push({
          ...task,
          id: String(task.id),
          dueDate: task.limited_at
            ? new Date(task.limited_at).toISOString().split("T")[0]
            : undefined,
          description: task.description === null ? undefined : task.description,
        });
      }
    });

    return NextResponse.json(categorizedTasks);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - 新しいタスクを作成する
export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, dueDate }: Partial<Task> = await request.json();
    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    // ユーザーが存在しなければ作成し、存在すればそのユーザーに接続する (Upsert)
    const user = await currentUser();
    const dbUser = await prisma.user.upsert({
      where: { clerk_user_id: clerkUserId },
      update: {},
      create: {
        clerk_user_id: clerkUserId,
        name: user?.firstName || "New User",
        email: user?.emailAddresses[0]?.emailAddress || "",
      },
    });

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
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
