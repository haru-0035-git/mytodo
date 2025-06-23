import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import { AppStateProvider } from "@/contexts/StateContext";
// ★★★ レイアウト関連のコンポーネントをここでインポート ★★★
import { LayoutController } from "../components/LayoutController";
import "./globals.css";

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
      <html lang="ja">
        <body>
          <AppStateProvider>
            {/* ★★★ LayoutControllerがレイアウトを管理 ★★★ */}
            <LayoutController>{children}</LayoutController>
          </AppStateProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
