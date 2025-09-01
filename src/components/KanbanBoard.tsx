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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import type { Task, ColumnId, ItemsState } from "@/types/task";
import { SortableTaskItem } from "./SortableTaskItem";



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
            <SortableTaskItem
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
  onOrderChange,
}: {
  items: ItemsState;
  setItems: React.Dispatch<React.SetStateAction<ItemsState>>;
  onEditTask: (task: Task) => void;
  onStatusChange: (
    taskId: string,
    sourceColumn: ColumnId,
    destinationColumn: ColumnId
  ) => void;
  onOrderChange: (
    columnId: ColumnId,
    oldIndex: number,
    newIndex: number
  ) => void;
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
    const task = Object.values(items)
      .flat()
      .find((t) => t.id === taskId);
    setActiveTask(task || null);
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

    if (initialContainer && finalContainer) {
      if (initialContainer !== finalContainer) {
        onStatusChange(activeId, initialContainer, finalContainer);
      } else if (activeId !== overId) {
        const itemsInContainer = items[initialContainer];
        const oldIndex = itemsInContainer.findIndex((t) => t.id === activeId);
        const newIndex = itemsInContainer.findIndex((t) => t.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          onOrderChange(initialContainer, oldIndex, newIndex);
        }
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
              <SortableTaskItem
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