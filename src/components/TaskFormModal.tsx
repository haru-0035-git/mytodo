"use client";

import React, { useState, useEffect, FormEvent } from "react";
import type { Task } from "@/types/task";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, "id">, id?: string) => void;
  initialData?: Task | null;
  onCancelTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  onCancelTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setDueDate(initialData.dueDate || "");
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, dueDate }, initialData?.id);
    onClose();
  };

  const handleCancelClick = () => {
    if (initialData?.id) {
      onCancelTask(initialData.id);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    if (initialData?.id) {
      // window.confirmの代わりにカスタムのUIを使うのが望ましいが、一旦これで実装
      if (
        confirm(
          `タスク「${initialData.title}」を本当に削除しますか？この操作は取り消せません。`
        )
      ) {
        onDeleteTask(initialData.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold mb-4">
            {initialData ? "タスクを編集" : "新しいタスクを追加"}
          </h3>
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
              placeholder="説明（Markdown対応）"
              rows={5}
              className="w-full p-2 border rounded-md text-black"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>

          <div className="flex justify-between items-center mt-6">
            <div>
              {initialData && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="px-3 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    中止
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-4">
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
                {initialData ? "更新する" : "追加"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
