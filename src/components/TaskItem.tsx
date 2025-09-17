"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import type { Task } from "@/types/task";
import { Checklist } from "./Checklist";

export const TaskItem = React.memo(function TaskItem({
  task,
  onEditTask,
  isExpanded,
  onTaskClick,
  isDragging,
  isOverlay,
}: {
  task: Task;
  onEditTask: (task: Task) => void;
  isExpanded: boolean;
  onTaskClick: (id: string) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}) {
  React.useEffect(() => {
    // removed debug logging
  }, [task]);

  const itemClasses = `w-full min-h-[5rem] mb-2 p-4 rounded-md shadow-sm cursor-grab flex flex-col justify-start items-start text-left transition-shadow ${
    isOverlay ? "bg-sky-500 text-white shadow-2xl" : "bg-white"
  } ${isDragging ? "opacity-50" : "opacity-100"}`;

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("input,button,a")) return; // ignore clicks originating from interactive elements
    onTaskClick(task.id);
  };

  return (
    <div
      className={itemClasses}
      onClick={handleClick}
      onDoubleClick={() => onEditTask(task)}
    >
      <div className="w-full text-black">
        <ReactMarkdown
          components={{
            p: ({ children }) => <>{children}</>,
            h2: (props) => <h2 className="text-lg font-bold" {...props} />,
          }}
        >
          {`## ${task.title}`}
        </ReactMarkdown>
      </div>

      <div
        className="w-full grid"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pt-2">
            {task.description && /```checklist\s*/.test(task.description) ? (
              <Checklist task={task} content={task.description} />
            ) : task.description ? (
              <div className="mt-2 text-sm text-gray-600">
                {task.description}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});
