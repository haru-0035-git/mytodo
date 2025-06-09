"use client";

import React, { useState, useRef } from "react";
import { ToggleButton } from "./ToggleButton";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu"; // UserMenuをインポート
import { useClickOutside } from "../hooks/useClickOutside"; // カスタムフックをインポート

const Header: React.FC = () => {
  // 1. メニューごとに独立したstateとrefを用意
  const [isNavOpen, setNavOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  const navMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 2. カスタムフックを使って、それぞれのメニューを閉じるロジックを適用
  useClickOutside(navMenuRef, () => setNavOpen(false));
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  // 3. 片方のメニューが開いたら、もう片方は閉じるようにする
  const toggleNavMenu = () => {
    setNavOpen((prev) => !prev);
    if (!isNavOpen) {
      setUserMenuOpen(false); // ユーザーメニューを閉じる
    }
  };

  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
    if (!isUserMenuOpen) {
      setNavOpen(false); // ナビゲーションメニューを閉じる
    }
  };

  return (
    <header className="relative text-black p-4 w-full flex flex-row items-center z-20">
      {/* 左側のナビゲーションメニュー */}
      <div className="basis-1/20" ref={navMenuRef}>
        <ToggleButton
          open={isNavOpen}
          controls="navigation"
          label="メニューを開く"
          onClick={toggleNavMenu}
        />
        <Navigation
          open={isNavOpen}
          id="navigation"
          onClose={() => setNavOpen(false)}
        />
      </div>

      <h1 className="text-4xl font-bold text-left basis-10/20 ml-4">
        ToDo App
      </h1>

      {/* 右側のユーザーメニュー */}
      <div
        className="basis-9/20 flex justify-end items-center"
        ref={userMenuRef}
      >
        <button
          onClick={toggleUserMenu} // 円形ボタンにtoggle機能を設定
          aria-expanded={isUserMenuOpen}
          aria-haspopup="true"
          aria-controls="user-menu"
          className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center"
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
export default Header;
