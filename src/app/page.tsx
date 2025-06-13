import React from "react";
import "./globals.css";
import Layout from "@/components/Layout";
import KanbanBoard from "@/components/KanbanBoard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    // Layoutにfooter propを渡す
    <Layout footer={<Footer />}>
      {/* これまで通り、メインのコンテンツを子要素として渡す */}
      <KanbanBoard />
    </Layout>
  );
}
