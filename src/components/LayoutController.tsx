"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { TaskFormModal } from "@/components/TaskFormModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAppState } from "@/contexts/StateContext";

export function LayoutController({ children }: { children: React.ReactNode }) {
  const {
    isFormModalOpen,
    taskToEdit,
    handleOpenAddTaskModal,
    handleCloseModal,
    handleFormSubmit,
    handleCancelTask,
    handleDeleteTask,
  } = useAppState();

  const { isSignedIn } = useAuth();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isNavOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(isLargeScreen);
  }, [isLargeScreen]);

  const toggleNav = () => setNavOpen((prev) => !prev);

  return (
    <>
      <Layout
        footer={<Footer />}
        isNavOpen={isNavOpen}
        isLargeScreen={isLargeScreen} // ★★★ この行を追加 ★★★
        toggleNav={toggleNav}
        onOpenModal={handleOpenAddTaskModal}
        isSignedIn={!!isSignedIn}
      >
        {children}
      </Layout>

      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={taskToEdit}
        onCancelTask={handleCancelTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}
