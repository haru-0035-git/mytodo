"use client";

import React from "react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link"; // next/linkをインポート

export const Header: React.FC = () => {
  return (
    <header className="relative bg-white text-black p-4 w-full flex flex-row items-center border-b z-10">
      <h1 className="text-2xl md:text-4xl font-bold text-left basis-1/2 md:basis-10/20 ml-16">
        TaskFlow
      </h1>

      <div className="basis-1/2 md:basis-9/20 flex justify-end items-center">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        {/* ★★★ 変更点: SignInButtonを通常のLinkに変更 ★★★ */}
        <SignedOut>
          <Link href="/sign-in">
            <div className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">
              サインイン
            </div>
          </Link>
        </SignedOut>
      </div>
    </header>
  );
};
