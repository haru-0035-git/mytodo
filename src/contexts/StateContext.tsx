"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { arrayMove } from "@dnd-kit/sortable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Task, ItemsState, ColumnId, StatusName } from "@/types/task";

// Contextが提供する値の型定義
interface AppStateContextType {
  items: ItemsState;
  setItems: React.Dispatch<React.SetStateAction<ItemsState>>;
  isFormModalOpen: boolean;
  taskToEdit: Task | null;
  isNavOpen: boolean;
  isLargeScreen: boolean;
  toggleNav: () => void;
  handleOpenAddTaskModal: () => void;
  handleOpenEditTaskModal: (task: Task) => void;
  handleCloseModal: () => void;
  handleFormSubmit: (taskData: Omit<Task, "id">, id?: string) => Promise<void>;
  handleStatusChange: (
    taskId: string,
    sourceColumn: ColumnId,
    destinationColumn: ColumnId
  ) => Promise<void>;
  handleOrderChange: (
    columnId: ColumnId,
    oldIndex: number,
    newIndex: number
  ) => void;
  handleCancelTask: (taskId: string) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleResumeTask: (resumedTask: Task) => Promise<void>; // ★★★ 追加
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ItemsState>({
    ToDo: [],
    Doing: [],
    Done: [],
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const { isSignedIn } = useAuth();

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isNavOpen, setNavOpen] = useState(false);
  useEffect(() => {
    setNavOpen(isLargeScreen);
  }, [isLargeScreen]);
  const toggleNav = () => setNavOpen((prev) => !prev);

  const fetchTasks = useCallback(async () => {
    if (isSignedIn) {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    } else {
      setItems({ ToDo: [], Doing: [], Done: [] });
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenAddTaskModal = () => {
    setTaskToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setTaskToEdit(null);
  };

  const handleFormSubmit = async (taskData: Omit<Task, "id">, id?: string) => {
    const oldItems = items;
    if (id) {
      setItems((prevItems) => {
        const newItems = { ...prevItems };
        for (const columnKey in newItems) {
          const key = columnKey as ColumnId;
          newItems[key] = newItems[key].map((task) =>
            task.id === id ? { ...task, ...taskData } : task
          );
        }
        return newItems;
      });
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (!response.ok) setItems(oldItems);
      } catch (error) {
        console.error("Failed to update task content:", error);
        setItems(oldItems);
      }
    } else {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (response.ok) {
          const newTask = await response.json();
          setItems((prev) => ({ ...prev, ToDo: [...prev.ToDo, newTask] }));
        }
      } catch (error) {
        console.error("Failed to create new task:", error);
      }
    }
  };

  const removeTaskFromState = (taskId: string) => {
    setItems((prev) => {
      const newItems = { ...prev };
      for (const key in newItems) {
        const columnKey = key as ColumnId;
        newItems[columnKey] = newItems[columnKey].filter(
          (task) => task.id !== taskId
        );
      }
      return newItems;
    });
  };

  const handleCancelTask = async (taskId: string) => {
    const oldItems = items;
    removeTaskFromState(taskId);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatusName: "canceled" as StatusName }),
      });
    } catch (error) {
      console.error("Failed to cancel task:", error);
      setItems(oldItems);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const oldItems = items;
    removeTaskFromState(taskId);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      setItems(oldItems);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    sourceColumn: ColumnId,
    destinationColumn: ColumnId
  ) => {
    const oldItems = items;
    setItems((prev) => {
      const newItems = { ...prev };
      const sourceItems = [...newItems[sourceColumn]];
      const destinationItems = [...newItems[destinationColumn]];
      const taskIndex = sourceItems.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;
      const [movedTask] = sourceItems.splice(taskIndex, 1);
      destinationItems.push(movedTask);
      newItems[sourceColumn] = sourceItems;
      newItems[destinationColumn] = destinationItems;
      return newItems;
    });

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatusName: destinationColumn }),
      });
    } catch (error) {
      console.error("ステータス更新に失敗しました。", error);
      setItems(oldItems);
    }
  };

  const handleOrderChange = (
    columnId: ColumnId,
    oldIndex: number,
    newIndex: number
  ) => {
    setItems((prev) => ({
      ...prev,
      [columnId]: arrayMove(prev[columnId], oldIndex, newIndex),
    }));
  };

  const handleResumeTask = async (resumedTask: Task) => {
    setItems((prev) => ({
      ...prev,
      ToDo: [...prev.ToDo, resumedTask],
    }));

    try {
      const response = await fetch(`/api/tasks/${resumedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatusName: "ToDo" }),
      });

      if (!response.ok) {
        console.error("Failed to resume task, rolling back UI change.");
        setItems((prev) => ({
          ...prev,
          ToDo: prev.ToDo.filter((t) => t.id !== resumedTask.id),
        }));
      }
    } catch (error) {
      console.error("Error resuming task:", error);
      setItems((prev) => ({
        ...prev,
        ToDo: prev.ToDo.filter((t) => t.id !== resumedTask.id),
      }));
    }
  };

  const value = {
    items,
    setItems,
    isFormModalOpen,
    taskToEdit,
    isNavOpen,
    isLargeScreen,
    toggleNav,
    handleOpenAddTaskModal,
    handleOpenEditTaskModal,
    handleCloseModal,
    handleFormSubmit,
    handleStatusChange,
    handleOrderChange,
    handleCancelTask,
    handleDeleteTask,
    handleResumeTask,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within a AppStateProvider");
  }
  return context;
};
