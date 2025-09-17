"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { TaskFormModal } from "@/components/TaskFormModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAppState } from "@/contexts/StateContext";

export function LayoutController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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

  // レイアウトを表示しないページのリスト
  const noLayoutRoutes = ["/sign-in", "/sign-up"];

  const normalizedPathname =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  // もし現在のページが認証関連のページなら、中身だけを表示
  if (noLayoutRoutes.includes(normalizedPathname)) {
    return <>{children}</>;
  }

  // それ以外のページでは、ヘッダーやナビゲーションを含む完全なレイアウトを表示
  return (
    <>
      <Layout
        footer={<Footer />}
        isNavOpen={isNavOpen}
        isLargeScreen={isLargeScreen}
        toggleNav={toggleNav}
        onOpenModal={handleOpenAddTaskModal}
        isSignedIn={!!isSignedIn}
        pathname={pathname}
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
