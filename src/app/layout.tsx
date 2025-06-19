import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import "./globals.css";
// import { Inter } from "next/font/google"; // デフォルトのフォント読み込みを簡略化

// const inter = Inter({ subsets: ["latin"] }); // 使われていなければ削除

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "直感的な操作でタスクを管理できるカンバンボードアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={jaJP}>
      {/* <body>タグからフォントクラスを削除 */}
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
