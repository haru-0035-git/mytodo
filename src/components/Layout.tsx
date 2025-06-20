"use client";

import React from "react";
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
  isSignedIn: boolean; // ★★★ 追加
}

const Layout: React.FC<LayoutProps> = ({
  children,
  footer,
  isNavOpen,
  isLargeScreen,
  toggleNav,
  onOpenModal,
  isSignedIn, // ★★★ 追加
}) => {
  return (
    <div className="relative flex min-h-screen bg-gray-100">
      <Navigation
        open={isNavOpen}
        onClose={toggleNav}
        onOpenModal={onOpenModal}
        isSignedIn={isSignedIn} // ★★★ 追加
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
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isLargeScreen && isNavOpen ? "ml-80" : "ml-0"
        }`}
      >
        <Header />

        <main className="flex-grow p-4">{children}</main>

        <footer className="p-4 bg-white border-t">{footer}</footer>
      </div>
    </div>
  );
};

export default Layout;
