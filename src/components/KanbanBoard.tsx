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
  verticalListSortingStrategy, // 変更
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ItemId = string;
type ColumnId = "ToDo" | "Doing" | "Done";
interface ItemsState {
  [key: string]: ItemId[];
}

function SortableItem({ id, isOverlay }: { id: ItemId; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease",
  };

  // スタイルを変更
  const itemClasses = `
    w-full h-24 mb-2 rounded-md shadow-sm cursor-grab
    flex items-center justify-center text-center p-2
    ${isOverlay ? "bg-blue-100 shadow-lg" : "bg-white"}
    ${isDragging ? "opacity-50" : "opacity-100"}
  `;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={itemClasses}
      {...attributes}
      {...listeners}
    >
      {id}
    </div>
  );
}

const columnTitleColor: { [key in ColumnId]: string } = {
  ToDo: "text-red-500",
  Doing: "text-blue-600",
  Done: "text-green-600",
};

function Column({ id, items }: { id: ColumnId; items: ItemId[] }) {
  const { setNodeRef } = useSortable({ id, data: { isContainer: true } });

  return (
    // strategy を変更
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        // classNameは元のままでも機能しますが、意図を明確にするため flex-col にしても良いでしょう
        className="flex flex-col flex-1 p-2 mx-2 bg-gray-300 rounded-lg min-h-[200px]"
      >
        <h3
          className={`w-full px-2 pb-2 text-lg font-semibold ${columnTitleColor[id]}`}
        >
          {id}
        </h3>
        {items.map((item) => (
          <SortableItem key={item} id={item} />
        ))}
      </div>
    </SortableContext>
  );
}

// KanbanBoard本体のロジックは変更なし
export default function KanbanBoard() {
  const [items, setItems] = useState<ItemsState>({
    ToDo: [
      "タスク 1",
      "タスク 2",
      "タスク 3",
      "タスク A",
      "タスク B",
      "タスク C",
    ],
    Doing: ["タスク 4", "タスク 5"],
    Done: ["タスク 6"],
  });

  const [activeId, setActiveId] = useState<ItemId | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const findContainer = (id: ItemId): ColumnId | undefined => {
    if (id in items) return id as ColumnId;
    return Object.keys(items).find((key) => items[key].includes(id)) as
      | ColumnId
      | undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as ItemId);
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as ItemId;
    const overId = over.id as ItemId;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;
    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overItems.indexOf(overId);
      const newActiveItems = [...activeItems];
      const [movedItem] = newActiveItems.splice(activeIndex, 1);
      const newOverItems = [...overItems];
      // Note: overIndex can be -1 if hovering over container, not an item
      const insertIndex = overIndex !== -1 ? overIndex : newOverItems.length;
      newOverItems.splice(insertIndex, 0, movedItem);
      return {
        ...prev,
        [activeContainer]: newActiveItems,
        [overContainer]: newOverItems,
      };
    });
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }
    const activeId = active.id as ItemId;
    const overId = over.id as ItemId;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (activeContainer && overContainer && activeContainer === overContainer) {
      const itemsInContainer = items[activeContainer];
      const oldIndex = itemsInContainer.indexOf(activeId);
      const newIndex = itemsInContainer.indexOf(overId);
      if (oldIndex !== newIndex) {
        setItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(itemsInContainer, oldIndex, newIndex),
        }));
      }
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-around w-full p-5 box-border">
        {Object.keys(items).map((columnId) => (
          <Column
            key={columnId}
            id={columnId as ColumnId}
            items={items[columnId]}
          />
        ))}
      </div>
      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeId ? <SortableItem id={activeId} isOverlay /> : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
