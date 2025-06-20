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

  useEffect(() => {
    if (isSignedIn) {
      const fetchTasks = async () => {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      };
      fetchTasks();
    } else {
      setItems({ ToDo: [], Doing: [], Done: [] });
    }
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
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setItems((prevItems) => {
          const newItems = { ...prevItems };
          for (const columnKey in newItems) {
            const key = columnKey as ColumnId;
            newItems[key] = newItems[key].map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            );
          }
          return newItems;
        });
      }
    } else {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (response.ok) {
        const newTask = await response.json();
        setItems((prev) => ({ ...prev, ToDo: [...prev.ToDo, newTask] }));
      }
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatusName: ColumnId
  ) => {
    // フロントエンドのUIはdnd-kitによって楽観的に更新済みなので、
    // ここではバックエンドのデータベースを更新するAPIを呼び出すだけ。
    // エラー時のロールバック処理は、より堅牢な実装で検討します。
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatusName }),
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
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
