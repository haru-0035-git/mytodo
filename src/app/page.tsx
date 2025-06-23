"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import KanbanBoard from "@/components/KanbanBoard";
import { useAppState } from "@/contexts/StateContext";

export default function Home() {
  const {
    items,
    setItems,
    handleOpenEditTaskModal,
    handleStatusChange,
    handleOrderChange,
  } = useAppState();

  const { isSignedIn } = useAuth();

  return (
    <>
      {isSignedIn ? (
        <KanbanBoard
          items={items}
          setItems={setItems}
          onEditTask={handleOpenEditTaskModal}
          onStatusChange={handleStatusChange}
          onOrderChange={handleOrderChange}
        />
      ) : (
        <div className="flex items-center justify-center h-full p-8">
          <p className="text-lg text-gray-500">
            タスクボードを表示するにはサインインしてください。
          </p>
        </div>
      )}
    </>
  );
}
