"use client";

import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

interface NavigationProps {
  open: boolean;
  onClose: () => void;
  onOpenModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  open,
  onClose,
  onOpenModal,
}) => {
  const navClasses = `
    fixed
    top-0 left-0
    h-screen bg-gray-100
    border-r border-gray-200
    flex flex-col
    transition-transform duration-300 ease-in-out z-30
    w-80
    ${open ? "translate-x-0" : "-translate-x-full"}
  `;

  const overlayClasses = `
    fixed lg:hidden
    inset-0 bg-black bg-opacity-50 z-20
    transition-opacity duration-300 ease-in-out
    ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
  `;

  return (
    <>
      <nav className={navClasses}>
        <div className="p-4 pt-20 flex-grow">
          <h2 className="text-xl font-bold text-black mb-4 whitespace-nowrap">
            メニュー
          </h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={onOpenModal}
                className="w-full flex items-center gap-2 p-2 text-black hover:bg-gray-200 rounded"
              >
                <PlusIcon className="h-5 w-5" />
                <span>タスクを追加</span>
              </button>
            </li>
            <li>
              <a
                href="#"
                className="block p-2 text-black hover:bg-gray-200 rounded whitespace-nowrap"
              >
                ボード
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <div className={overlayClasses} onClick={onClose} />
    </>
  );
};
