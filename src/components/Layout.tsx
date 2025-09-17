"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { ToggleButton } from "./ToggleButton";

interface LayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  isNavOpen: boolean;
  isLargeScreen: boolean;
  toggleNav: () => void;
  onOpenModal: () => void;
  isSignedIn: boolean;
  pathname: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  footer,
  isNavOpen,
  isLargeScreen,
  toggleNav,
  onOpenModal,
  isSignedIn,
  pathname,
}) => {
  // ★★★ 変更点 1: マウント状態を管理するstateを追加 ★★★
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // ページが表示された後に、マウント状態をtrueにする
    setHasMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Navigation
        open={isNavOpen}
        onClose={toggleNav}
        onOpenModal={onOpenModal}
        isSignedIn={isSignedIn}
        pathname={pathname}
      />

      <div className="fixed top-4 left-4 z-40">
        <ToggleButton
          open={isNavOpen}
          onClick={toggleNav}
          controls="navigation"
          label="ナビゲーションを開閉"
        />
      </div>

      <div
        // ★★★ 変更点 2: マウント後にのみアニメーションクラスを適用 ★★★
        className={`flex-1 flex flex-col ${
          hasMounted ? "transition-all duration-300 ease-in-out" : ""
        } ${isLargeScreen && isNavOpen ? "ml-80" : "ml-0"}`}
      >
        <Header />

        <main className="flex-grow p-4 overflow-y-auto pb-16">{children}</main>

        <footer className="fixed bottom-0 left-0 w-full p-4 bg-white border-t z-10">{footer}</footer>
      </div>
    </div>
  );
};

export default Layout;
