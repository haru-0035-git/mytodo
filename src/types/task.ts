export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export type ColumnId = "ToDo" | "Doing" | "Done";

export interface ItemsState {
  [key: string]: Task[];
}
