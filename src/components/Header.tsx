"use client";

import React, { useState, useRef } from "react";
// ToggleButtonのインポートは不要になる
import { UserMenu } from "./UserMenu";
import { useClickOutside } from "../hooks/useClickOutside";

// isNavOpen, toggleNav を受け取らないようにする
export const Header: React.FC = () => {
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
  };

  // ToggleButtonを表示していた部分を削除
  return (
    <header className="relative bg-white text-black p-4 w-full flex flex-row items-center border-b z-10">
      {/* タイトルがヘッダーの左端から始まるように調整 */}
      <h1 className="text-2xl md:text-4xl font-bold text-left basis-1/2 md:basis-10/20 ml-16">
        TaskFlow
      </h1>

      {/* 右側のユーザーメニュー (変更なし) */}
      <div
        className="basis-1/2 md:basis-9/20 flex justify-end items-center"
        ref={userMenuRef}
      >
        <button
          onClick={toggleUserMenu}
          aria-expanded={isUserMenuOpen}
          className="h-10 w-10 bg-gray-200 text-black rounded-full flex items-center justify-center font-bold"
        >
          O
        </button>
        <UserMenu
          open={isUserMenuOpen}
          onClose={() => setUserMenuOpen(false)}
        />
      </div>
    </header>
  );
};
