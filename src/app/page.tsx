"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Layout from "@/components/Layout";
import KanbanBoard from "@/components/KanbanBoard";
import Footer from "@/components/Footer";
import { TaskFormModal } from "@/components/TaskFormModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Task, ItemsState, ColumnId } from "@/types/task";

export default function Home() {
  const [items, setItems] = useState<ItemsState>({
    ToDo: [],
    Doing: [],
    Done: [],
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const { isSignedIn } = useAuth();

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isNavOpen, setNavOpen] = useState(false);
  useEffect(() => {
    setNavOpen(isLargeScreen);
  }, [isLargeScreen]);
  const toggleNav = () => setNavOpen((prev) => !prev);

  const fetchTasks = async () => {
    if (isSignedIn) {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        } else {
          console.error(
            "Failed to fetch tasks, server responded with:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    } else {
      setItems({ ToDo: [], Doing: [], Done: [] });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [isSignedIn]);

  const handleOpenAddTaskModal = () => {
    setTaskToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setTaskToEdit(null);
  };

  const handleFormSubmit = async (taskData: Omit<Task, "id">, id?: string) => {
    if (id) {
      // ★★★ ここからが楽観的UI更新のロジック ★★★
      const oldItems = items; // 1. 更新前の状態を記憶

      // 2. まずフロントエンドの状態を即座に更新
      setItems((prevItems) => {
        const newItems = { ...prevItems };
        for (const columnKey in newItems) {
          const key = columnKey as ColumnId;
          newItems[key] = newItems[key].map((task) =>
            task.id === id ? { ...task, ...taskData } : task
          );
        }
        return newItems;
      });

      // 3. 次にバックエンドのAPIを呼び出す
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        // 4. もしAPIが失敗したら、UIを元の状態に戻す（ロールバック）
        if (!response.ok) {
          console.error("Failed to update task content on server.");
          setItems(oldItems); // 記憶しておいた古い状態で上書き
        }
      } catch (error) {
        console.error("Error updating task:", error);
        setItems(oldItems); // ネットワークエラーでもロールバック
      }
    } else {
      // 新規追加モード（こちらは変更なし）
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (response.ok) {
        const newTask = await response.json();
        setItems((prev) => ({ ...prev, ToDo: [...prev.ToDo, newTask] }));
      } else {
        console.error("Failed to create new task.");
      }
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatusName: ColumnId
  ) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatusName }),
      });
      if (!response.ok) {
        console.error(
          "Failed to update task status on server. Refetching tasks."
        );
        fetchTasks(); // 失敗したら再取得して同期
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      fetchTasks();
    }
  };

  return (
    <>
      <Layout
        footer={<Footer />}
        isNavOpen={isNavOpen}
        isLargeScreen={isLargeScreen}
        toggleNav={toggleNav}
        onOpenModal={handleOpenAddTaskModal}
        isSignedIn={!!isSignedIn}
      >
        {isSignedIn ? (
          <KanbanBoard
            items={items}
            setItems={setItems}
            onEditTask={handleOpenEditTaskModal}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-500">
              タスクボードを表示するにはサインインしてください。
            </p>
          </div>
        )}
      </Layout>

      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={taskToEdit}
      />
    </>
  );
}
