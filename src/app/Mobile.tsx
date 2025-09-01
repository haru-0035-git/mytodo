"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAppState } from "@/contexts/StateContext";
import { TodoList } from "@/components/TodoList";
import { ColumnId } from "@/types/task";

export default function Mobile() {
  const { items, handleOpenEditTaskModal } = useAppState();
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<ColumnId>("ToDo");

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-lg text-gray-500">
          タスクボードを表示するにはサインインしてください。
        </p>
      </div>
    );
  }

  const tabs: ColumnId[] = ["ToDo", "Doing", "Done"];

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold px-4 pb-2">タスク</h1>
      <div className="flex justify-around border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-lg font-semibold ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-grow overflow-y-auto">
        <TodoList
          tasks={items[activeTab]}
          onEditTask={handleOpenEditTaskModal}
        />
      </div>
    </div>
  );
}