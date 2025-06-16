"use client";

import React, { useState, FormEvent } from "react";
import type { Task } from "../types/task"; // 修正: '@/types/task' を './types/task' に変更

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, "id">) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAddTask({ title, description, dueDate });
    onClose(); // モーダルを閉じる
    // フォームをリセット
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  return (
    // オーバーレイ
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* モーダル本体 */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold mb-4">新しいタスクを追加</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトル"
              className="w-full p-2 border rounded-md text-black"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="説明（オプション）"
              rows={3}
              className="w-full p-2 border rounded-md text-black"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-transparent rounded-md hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              タスクを追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
