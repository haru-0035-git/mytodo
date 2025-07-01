import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Task } from "@/types/task";
import type { JsonValue } from "@prisma/client/runtime/library"; // ★★★ Prismaの型をインポート

// ★★★ 追加: Prismaから返ってくるデータの型を正確に定義 ★★★
type CanceledTaskFromDB = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status_id: number | null;
  created_at: Date;
  updated_at: Date;
  tags: JsonValue;
  limited_at: Date | null;
};

// GET - ステータスが'canceled'のタスクのみを取得する
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

    // ★★★ 変更点: mapの引数に明示的な型を指定 ★★★
    const canceledTasks: Task[] = tasksFromDb.map(
      (task: CanceledTaskFromDB) => ({
        ...task,
        id: String(task.id),
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
