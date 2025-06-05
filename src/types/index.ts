// ToDoの状態を表す型 (ユーザー指定の要素)
// 文字列のユニオン型にすることで、決まった値以外はエラーになり、安全性が高まります。
export type TodoStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

// 1つのToDoアイテムを表す型
export type Todo = {
  // --- 必須の要素 ---
  id: string; // 一意のID (タスクの識別用)
  text: string; // ToDoの内容 (例: 「TypeScriptを勉強する」)
  status: TodoStatus; // 状態 (未実行, 実行中, 完了)
  createdAt: Date; // 作成日時 (ソート用)
  //   updatedAt: Date; // 最終更新日時
  //   dueDate?: Date; // 期限日 (オプショナルなので `?` をつける)
  //   priority?: "high" | "medium" | "low"; // 優先度
  //   tags?: string[]; // タグ (例: ['仕事', '学習'])
};
