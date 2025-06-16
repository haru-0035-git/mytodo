"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Task, ColumnId, ItemsState } from "@/types/task";
function SortableItem({
  task,
  isOverlay,
  onEditTask,
}: {
  task: Task;
  isOverlay?: boolean;
  onEditTask: (task: Task) => void;
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
    transition: transition || "transform 250ms ease",
  };
  const itemClasses = `w-full min-h-24 mb-2 p-4 rounded-md shadow-sm cursor-grab flex flex-col justify-start items-start text-left transition-shadow ${
    isOverlay ? "bg-sky-500 text-white shadow-2xl" : "bg-white"
  } ${isDragging ? "opacity-50" : "opacity-100"}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={itemClasses}
      {...attributes}
      {...listeners}
      onDoubleClick={() => onEditTask(task)}
    >
      {/* ★★★ 変更点 1: flex-growコンテナでコンテンツ部分を囲む ★★★ */}
      <div className="flex-grow w-full">
        {/* ★★★ 変更点 2: タイトルをMarkdownの見出し(h2)として表示 ★★★ */}
        <div className="w-full text-black">
          <ReactMarkdown
            components={{
              // pタグがデフォルトで生成されるのを防ぎ、h2のみを直接レンダリング
              p: ({ children }) => <>{children}</>,
              h2: ({ node, ...props }) => (
                <h2 className="text-lg font-bold mb-2" {...props} />
              ),
            }}
          >
            {`## ${task.title}`}
          </ReactMarkdown>
        </div>

        {/* ★★★ 変更点 3: 説明のMarkdown表示にカスタムスタイルを適用 ★★★ */}
        {task.description && (
          <div className="w-full text-black text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl font-bold mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold mb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-bold mb-2" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 mb-2" {...props} />
                ),
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                a: ({ node, ...props }) => (
                  <a className="text-blue-600 hover:underline" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="bg-gray-200 rounded px-1 py-0.5 font-mono text-sm"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
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
      </div>

      {/* 期限表示 (mt-autoはflex-growにより不要) */}
      {task.dueDate && (
        <p className="text-xs mt-2 pt-2 border-t w-full text-gray-600">
          期限: {task.dueDate}
        </p>
      )}
    </div>
  );
}

const columnTitleColor: { [key in ColumnId]: string } = {
  ToDo: "text-red-500",
  Doing: "text-blue-600",
  Done: "text-green-600",
};

function Column({
  id,
  tasks,
  onEditTask,
}: {
  id: ColumnId;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}) {
  const { setNodeRef } = useSortable({ id, data: { isContainer: true } });
  const taskIds = tasks.map((task) => task.id);

  return (
    <SortableContext
      id={id}
      items={taskIds}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className="flex flex-col flex-1 p-2 mx-2 bg-gray-300 rounded-lg min-h-[200px]"
      >
        <h3
          className={`w-full px-2 pb-2 text-lg font-semibold ${columnTitleColor[id]}`}
        >
          {id}
        </h3>
        <div className="flex-grow overflow-y-auto">
          {tasks.map((task) => (
            <SortableItem key={task.id} task={task} onEditTask={onEditTask} />
          ))}
        </div>
      </div>
    </SortableContext>
  );
}

export default function KanbanBoard({
  items,
  setItems,
  onEditTask,
}: {
  items: ItemsState;
  setItems: React.Dispatch<React.SetStateAction<ItemsState>>;
  onEditTask: (task: Task) => void;
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    const styleId = "custom-grabbing-cursor";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `.grabbing-custom { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="1.5" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>'), grabbing; }`;
    document.head.appendChild(style);
  }, []);

  const findTaskById = (id: string) => {
    for (const column of Object.values(items)) {
      const task = column.find((t) => t.id === id);
      if (task) return task;
    }
    return null;
  };

  const findContainer = (id: string): ColumnId | undefined => {
    if (id in items) return id as ColumnId;
    for (const key in items) {
      if (items[key as ColumnId].some((task) => task.id === id)) {
        return key as ColumnId;
      }
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTaskById(event.active.id as string);
    setActiveTask(task);
    document.body.classList.add("grabbing-custom");
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;

      const newActiveItems = [...activeItems];
      const [movedItem] = newActiveItems.splice(activeIndex, 1);

      const newOverItems = [...overItems];
      const overIndex = overItems.findIndex((t) => t.id === overId);
      const insertIndex = overIndex >= 0 ? overIndex : newOverItems.length;
      newOverItems.splice(insertIndex, 0, movedItem);

      return {
        ...prev,
        [activeContainer]: newActiveItems,
        [overContainer]: newOverItems,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    document.body.classList.remove("grabbing-custom");
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }
    if (active.id !== over.id) {
      const activeContainer = findContainer(active.id as string);
      const overContainer = findContainer(over.id as string) || activeContainer;
      if (
        activeContainer &&
        overContainer &&
        activeContainer === overContainer
      ) {
        setItems((currentItems) => {
          const itemsInContainer = currentItems[activeContainer];
          const oldIndex = itemsInContainer.findIndex(
            (t) => t.id === active.id
          );
          const newIndex = itemsInContainer.findIndex((t) => t.id === over.id);
          if (oldIndex === -1 || newIndex === -1) return currentItems;
          return {
            ...currentItems,
            [activeContainer]: arrayMove(itemsInContainer, oldIndex, newIndex),
          };
        });
      }
    }
    setActiveTask(null);
  };

  const handleDragCancel = () => {
    document.body.classList.remove("grabbing-custom");
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex justify-around w-full p-5 pt-0 box-border">
        {Object.keys(items).map((columnId) => (
          <Column
            key={columnId}
            id={columnId as ColumnId}
            tasks={items[columnId as ColumnId]}
            onEditTask={onEditTask}
          />
        ))}
      </div>
      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeTask ? (
              <SortableItem
                task={activeTask}
                isOverlay
                onEditTask={onEditTask}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
