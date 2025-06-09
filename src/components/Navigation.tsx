"use client";

import { FC } from "react";

type NavigationProps = {
  open: boolean;
  id: string;
  // メニューを閉じるための関数をpropsで受け取る
  onClose: () => void;
};

export const Navigation: FC<NavigationProps> = ({ open, id, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <nav
      id={id}
      className="absolute top-20 left-4 bg-white shadow-lg rounded-md p-4 w-64 z-20"
    >
      {/* メニュー内に閉じるボタンを設置 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-2xl text-gray-600 hover:text-black"
        aria-label="メニューを閉じる"
      >
        &times; {/* 一般的な「閉じる」アイコン */}
      </button>

      <ul className="space-y-2">
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded">
            ボード
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded">
            看板
          </a>
        </li>
      </ul>
    </nav>
  );
};
