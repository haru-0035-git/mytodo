export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
}

// DB上の全ステータスを定義
export type StatusName = "ToDo" | "Doing" | "Done" | "canceled";

// かんばんボードに表示するカラムのみを定義
export type ColumnId = "ToDo" | "Doing" | "Done";

export interface ItemsState {
  ToDo: Task[];
  Doing: Task[];
  Done: Task[];
}
