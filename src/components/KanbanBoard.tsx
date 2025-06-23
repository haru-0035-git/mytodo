"use client";

import React, { useState } from "react";
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
  const itemClasses = `w-full min-h-[5rem] mb-2 p-4 rounded-md shadow-sm cursor-grab flex flex-col justify-start items-start text-left transition-shadow ${
    isOverlay ? "bg-sky-500 text-white shadow-2xl" : "bg-white"
  } ${isDragging ? "opacity-50" : "opacity-100"}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={itemClasses}
      {...attributes}
      {...listeners}
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

const columnTitleColor: { [key in ColumnId]: string } = {
  ToDo: "text-red-500",
  Doing: "text-blue-600",
  Done: "text-green-600",
};

function Column({
  id,
  tasks,
  onEditTask,
  expandedTaskId,
  onTaskClick,
}: {
  id: ColumnId;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  expandedTaskId: string | null;
  onTaskClick: (id: string) => void;
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
            <SortableItem
              key={task.id}
              task={task}
              onEditTask={onEditTask}
              isExpanded={expandedTaskId === task.id}
              onTaskClick={onTaskClick}
            />
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
  onStatusChange,
}: {
  items: ItemsState;
  setItems: React.Dispatch<React.SetStateAction<ItemsState>>;
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatusName: ColumnId) => void;
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [initialContainer, setInitialContainer] = useState<ColumnId | null>(
    null
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId((prevId) => (prevId === taskId ? null : taskId));
  };

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
      if ((items[key as ColumnId] || []).some((task) => task.id === id)) {
        return key as ColumnId;
      }
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = findTaskById(taskId);
    setActiveTask(task);
    setExpandedTaskId(null);
    setInitialContainer(findContainer(taskId) || null);
    document.body.classList.add("grabbing-custom");
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    let overContainer = findContainer(overId);

    if (over.data.current?.isContainer && overContainer === undefined) {
      overContainer = over.id as ColumnId;
    }

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
    setActiveTask(null);

    const { active, over } = event;
    if (!over) {
      setInitialContainer(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const finalContainer = findContainer(activeId);

    // ★★★ 修正点: 並び替えロジックを復活 ★★★
    if (initialContainer && finalContainer) {
      // Case 1: カラムが変更された場合
      if (initialContainer !== finalContainer) {
        onStatusChange(activeId, finalContainer);
      }
      // Case 2: 同じカラム内で並び替えが行われた場合
      else if (activeId !== overId) {
        setItems((items) => {
          const itemsInContainer = items[initialContainer];
          const oldIndex = itemsInContainer.findIndex((t) => t.id === activeId);
          const newIndex = itemsInContainer.findIndex((t) => t.id === overId);
          // 安全のため、インデックスが見つからない場合は何もしない
          if (oldIndex === -1 || newIndex === -1) {
            return items;
          }
          return {
            ...items,
            [initialContainer]: arrayMove(itemsInContainer, oldIndex, newIndex),
          };
        });
      }
    }

    setInitialContainer(null);
  };

  const handleDragCancel = () => {
    document.body.classList.remove("grabbing-custom");
    setActiveTask(null);
    setInitialContainer(null);
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
            expandedTaskId={expandedTaskId}
            onTaskClick={handleTaskClick}
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
                isExpanded={false}
                onTaskClick={() => {}}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
