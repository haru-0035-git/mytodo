import React from "react";
import "./globals.css";
import Header from "@/components/Header";
// import { SortableTodoList } from "@/components/SortableTodoList";
import KanbanBoard from "@/components/KanbanBoard";

export default function Home() {
  return (
    <>
      <header>
        <Header />
      </header>
      <main>
        <KanbanBoard />
      </main>
    </>
  );
}
