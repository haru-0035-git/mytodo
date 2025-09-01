"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/task";
import { TaskItem } from "./TaskItem";

export function SortableTaskItem({
  task,
  isOverlay,
  onEditTask,
  isExpanded,
  onTaskClick,
}: {
  task: Task;
  isOverlay?: boolean;
  onEditTask: (task: Task) => void;
  isExpanded: boolean;
  onTaskClick: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(
      transform
        ? {
            ...transform,
            scaleX: isOverlay ? 1.05 : 1,
            scaleY: isOverlay ? 1.05 : 1,
          }
        : null
    ),
    transition: transition || "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem
        task={task}
        onEditTask={onEditTask}
        isExpanded={isExpanded}
        onTaskClick={onTaskClick}
        isDragging={isDragging}
        isOverlay={isOverlay}
      />
    </div>
  );
}