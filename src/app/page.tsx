"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs"; // useAuthフックをインポート
import Layout from "@/components/Layout";
import KanbanBoard from "@/components/KanbanBoard";
import Footer from "@/components/Footer";
import { TaskFormModal } from "@/components/TaskFormModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Task, ItemsState } from "@/types/task";

export default function Home() {
  const [items, setItems] = useState<ItemsState>({
    ToDo: [],
    Doing: [],
    Done: [],
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const { isSignedIn } = useAuth(); // ログイン状態を取得

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isNavOpen, setNavOpen] = useState(false);
  useEffect(() => {
    setNavOpen(isLargeScreen);
  }, [isLargeScreen]);
  const toggleNav = () => setNavOpen((prev) => !prev);

  // ★★★ 変更点 1: ログイン時にAPIからタスクを読み込む ★★★
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
    }
  }, [isSignedIn]); // ログイン状態が変わったら再取得

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

  // ★★★ 変更点 2: フォーム送信時にAPIを呼び出すように変更 ★★★
  const handleFormSubmit = async (taskData: Omit<Task, "id">, id?: string) => {
    if (id) {
      // (編集機能は今後のステップで実装)
    } else {
      // 新規追加モード
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        // フロントエンドの状態を更新
        setItems((prevItems) => ({
          ...prevItems,
          ToDo: [...prevItems.ToDo, newTask],
        }));
      }
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
      >
        {/* ★★★ 変更点 3: ログインしていない時の表示を追加 ★★★ */}
        {isSignedIn ? (
          <KanbanBoard
            items={items}
            setItems={setItems}
            onEditTask={handleOpenEditTaskModal}
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
