"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import KanbanBoard from "@/components/KanbanBoard";
import Footer from "@/components/Footer";
import { TaskFormModal } from "@/components/TaskFormModal"; // 新しいモーダルをインポート
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Task, ItemsState } from "@/types/task";

export default function Home() {
  const [items, setItems] = useState<ItemsState>({
    ToDo: [],
    Doing: [],
    Done: [],
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null); // ★★★ 編集対象のタスクを管理するstate

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isNavOpen, setNavOpen] = useState(false); // ★★★ デフォルトは閉じた状態に
  useEffect(() => {
    setNavOpen(isLargeScreen);
  }, [isLargeScreen]);
  const toggleNav = () => setNavOpen((prev) => !prev);

  // ★★★ モーダルを開くための関数群 ★★★
  const handleOpenAddTaskModal = () => {
    setTaskToEdit(null); // 編集対象がない＝新規追加
    setIsFormModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setTaskToEdit(task); // 編集対象のタスクをセット
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setTaskToEdit(null);
  };

  // ★★★ フォームが送信された時の処理 ★★★
  const handleFormSubmit = (taskData: Omit<Task, "id">, id?: string) => {
    if (id) {
      // idがあれば編集モード
      setItems((prevItems) => {
        const newItems = { ...prevItems };
        for (const column in newItems) {
          newItems[column as keyof ItemsState] = newItems[
            column as keyof ItemsState
          ].map((task) => (task.id === id ? { ...task, ...taskData } : task));
        }
        return newItems;
      });
    } else {
      // idがなければ新規追加モード
      const newTask: Task = { id: `task-${Date.now()}`, ...taskData };
      setItems((prevItems) => ({
        ...prevItems,
        ToDo: [...prevItems.ToDo, newTask],
      }));
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
        <KanbanBoard
          items={items}
          setItems={setItems}
          onEditTask={handleOpenEditTaskModal}
        />
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
