"use client";

import React from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { ToggleButton } from "./ToggleButton";

// Layoutコンポーネントが受け取るProps（プロパティ）の型定義
interface LayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  isNavOpen: boolean;
  isLargeScreen: boolean;
  toggleNav: () => void;
  onOpenModal: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  footer,
  isNavOpen,
  isLargeScreen,
  toggleNav,
  onOpenModal,
}) => {
  return (
    // ★★★ 変更点 1: position: relative を追加 ★★★
    // fixed配置のボタンやナビゲーションの基準点となるように設定
    <div className="relative flex min-h-screen bg-gray-100">
      <Navigation
        open={isNavOpen}
        isLargeScreen={isLargeScreen}
        onClose={toggleNav} // ナビゲーションを閉じる際もtoggleNavを呼ぶ
        onOpenModal={onOpenModal}
      />

      {/* fixed配置のボタン */}
      <div className="fixed top-4 left-4 z-40">
        <ToggleButton
          open={isNavOpen}
          onClick={toggleNav}
          controls="navigation"
          label="ナビゲーションを開閉"
        />
      </div>

      {/* ★★★ 変更点 2: メインコンテンツのマージンを動的に変更 ★★★ */}
      {/* ナビゲーションの幅に合わせてコンテンツの開始位置を調整 */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isLargeScreen && isNavOpen
            ? "ml-80"
            : isLargeScreen
            ? "ml-20"
            : "ml-0"
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
