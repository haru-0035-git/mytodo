"use client";

import { FC } from "react";

type UserMenuProps = {
  open: boolean;
  onClose: () => void;
};

export const UserMenu: FC<UserMenuProps> = ({ open, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    // 表示位置を右上に調整
    <div
      className="absolute top-16 right-4 bg-white shadow-lg rounded-md p-4 w-64 z-20"
      role="menu"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-2xl text-gray-600 hover:text-black"
        aria-label="メニューを閉じる"
      >
        &times;
      </button>
      <ul className="space-y-2">
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded">
            アカウント情報
          </a>
        </li>
        <li className="border-1"></li>
        <li>
          <a
            href="#"
            className="block p-2 text-red-600 hover:bg-gray-100 rounded"
          >
            ログアウト
          </a>
        </li>
      </ul>
    </div>
  );
};
