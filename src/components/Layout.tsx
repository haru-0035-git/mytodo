"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { ToggleButton } from "./ToggleButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface LayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

const Layout = ({ children, footer }: LayoutProps) => {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isNavOpen, setNavOpen] = useState(isLargeScreen);

  useEffect(() => {
    setNavOpen(isLargeScreen);
  }, [isLargeScreen]);

  const toggleNav = () => {
    setNavOpen(!isNavOpen);
  };

  return (
    // 1. ルートの `h-screen` を削除し、高さの固定を解除
    <div className="flex bg-gray-100">
      <Navigation
        open={isNavOpen}
        isLargeScreen={isLargeScreen}
        onClose={() => setNavOpen(false)}
      />

      <div className="fixed top-4 left-4 z-40">
        <ToggleButton
          open={isNavOpen}
          controls="navigation"
          label="ナビゲーションを開閉"
          onClick={toggleNav}
        />
      </div>

      {/* 2. このコンテナに min-h-screen を設定 */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        {/* 3. mainの flex-1 と overflow を変更 */}
        <main className="flex-grow p-4">{children}</main>

        <footer className="p-4 bg-white border-t">{footer}</footer>
      </div>
    </div>
  );
};

export default Layout;
