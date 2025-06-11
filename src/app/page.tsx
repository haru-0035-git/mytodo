import React from "react";
import "./globals.css";
import Header from "@/components/Header";
// import { SortableTodoList } from "@/components/SortableTodoList";
import KanbanBoard from "@/components/KanbanBoard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <header>
        <Header />
      </header>
      <main className="flex flex-col min-h-screen bg-gray-100">
        <KanbanBoard />
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}
