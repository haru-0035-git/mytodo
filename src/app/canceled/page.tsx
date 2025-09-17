"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAppState } from "@/contexts/StateContext";
import type { Task } from "@/types/task";

export default function CanceledTasksPage() {
  const [canceledTasks, setCanceledTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn } = useAuth();
  const { handleResumeTask } = useAppState();

  const fetchCanceledTasks = useCallback(async () => {
    if (isSignedIn) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/tasks/canceled");
        if (response.ok) {
          const data = await response.json();
          setCanceledTasks(data);
        }
      } catch (error) {
        void error; // suppressed error logging
        return null;
      } finally {
        setIsLoading(false);
      }
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchCanceledTasks();
  }, [fetchCanceledTasks]);

  const onResumeClick = async (taskToResume: Task) => {
    setCanceledTasks((prevTasks) =>
      prevTasks.filter((t) => t.id !== taskToResume.id)
    );
    await handleResumeTask(taskToResume);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">中止したタスク一覧</h1>
      {isLoading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : canceledTasks.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {canceledTasks.map((task) => (
              <li
                key={task.id}
                className="p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-black">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onResumeClick(task)}
                  className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  再開
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">中止したタスクはありません。</p>
      )}
    </div>
  );
}
