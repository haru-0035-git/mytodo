"use client";

import React, { useState } from "react";
import { TaskItem } from "@/components/TaskItem";
import { Task } from "@/types/task";

export function TodoList({ tasks, onEditTask }) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId((prevId) => (prevId === taskId ? null : taskId));
  };

  return (
    <div className="p-4">
      {tasks.map((task: Task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEditTask={onEditTask}
          isExpanded={expandedTaskId === task.id}
          onTaskClick={handleTaskClick}
        />
      ))}
    </div>
  );
}
