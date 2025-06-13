"use client";

import { FC } from "react";

type NavigationProps = {
  open: boolean;
  isLargeScreen: boolean;
  onClose: () => void;
};

export const Navigation: FC<NavigationProps> = ({
  open,
  isLargeScreen,
  onClose,
}) => {
  const getNavWidth = () => {
    if (open) return "w-80";
    if (isLargeScreen) return "w-20";
    return "w-0 p-0";
  };

  const navClasses = `
    ${isLargeScreen ? "relative" : "fixed"}
    h-screen bg-white shadow-lg p-4 pt-20
    transition-all duration-300 ease-in-out overflow-hidden
    ${getNavWidth()}
  `;

  if (!open && !isLargeScreen) {
    return null;
  }

  return (
    <nav className={navClasses}>
      {!isLargeScreen && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-3xl text-gray-600 hover:text-black"
          aria-label="メニューを閉じる"
        >
          &times;
        </button>
      )}

      <div
        className={`transition-opacity duration-300 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold text-black mb-4 whitespace-nowrap">
          メニュー
        </h2>
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="block p-2 text-black hover:bg-gray-100 rounded whitespace-nowrap"
            >
              ボード
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block p-2 text-black hover:bg-gray-100 rounded whitespace-nowrap"
            >
              かんばん
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block p-2 text-black hover:bg-gray-100 rounded whitespace-nowrap"
            >
              設定
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};
