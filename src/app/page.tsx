"use client";

import React from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import PC from "./PC";
import Mobile from "./Mobile";

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return <>{isMobile ? <Mobile /> : <PC />}</>;
}