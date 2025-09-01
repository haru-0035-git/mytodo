"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Task } from "@/types/task";

export function TaskItem({
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
  const itemClasses = `w-full min-h-[5rem] mb-2 p-4 rounded-md shadow-sm cursor-grab flex flex-col justify-start items-start text-left transition-shadow ${
    isOverlay ? "bg-sky-500 text-white shadow-2xl" : "bg-white"
  } ${isDragging ? "opacity-50" : "opacity-100"}`;

  return (
    <div
      className={itemClasses}
      onClick={() => onTaskClick(task.id)}
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
        className="w-full grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden">
          <div className="pt-2">
            {task.description && (
              <div className="w-full text-black text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => (
                      <h1 className="text-xl font-bold mb-2" {...props} />
                    ),
                    h2: (props) => (
                      <h2 className="text-lg font-bold mb-2" {...props} />
                    ),
                    h3: (props) => (
                      <h3 className="text-base font-bold mb-2" {...props} />
                    ),
                    p: (props) => <p className="mb-2" {...props} />,
                    ul: (props) => (
                      <ul className="list-disc pl-5 mb-2" {...props} />
                    ),
                    ol: (props) => (
                      <ol className="list-decimal pl-5 mb-2" {...props} />
                    ),
                    li: (props) => <li className="mb-1" {...props} />,
                    a: (props) => (
                      <a className="text-blue-600 hover:underline" {...props} />
                    ),
                    strong: (props) => (
                      <strong className="font-bold" {...props} />
                    ),
                    code: (props) => (
                      <code
                        className="bg-gray-200 rounded px-1 py-0.5 font-mono text-sm"
                        {...props}
                      />
                    ),
                    blockquote: (props) => (
                      <blockquote
                        className="border-l-4 border-gray-300 pl-4 text-gray-600 italic my-2"
                        {...props}
                      />
                    ),
                  }}
                >
                  {task.description}
                </ReactMarkdown>
              </div>
            )}
            {task.dueDate && (
              <p className="text-xs mt-2 pt-2 border-t w-full text-gray-600">
                期限: {task.dueDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
