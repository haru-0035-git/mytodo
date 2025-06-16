"use client";

import React from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface ToggleButtonProps {
  open: boolean;
  onClick: () => void;
  controls: string;
  label: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  open,
  onClick,
  controls,
  label,
}) => {
  // ベースとなる共通のスタイル
  const baseClasses =
    "p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500";

  // ★★★ 変更点: 開閉状態で背景色を切り替える ★★★
  const stateClasses = open
    ? "bg-gray-200 hover:bg-gray-300" // 開いている時：常に背景色あり
    : "hover:bg-gray-200"; // 閉じている時：ホバー時のみ背景色あり

  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      className={`${baseClasses} ${stateClasses}`}
    >
      <span className="sr-only">{label}</span>

      {open ? (
        <XMarkIcon className="h-8 w-8 text-black" aria-hidden="true" />
      ) : (
        <Bars3Icon className="h-8 w-8 text-black" aria-hidden="true" />
      )}
    </button>
  );
};
