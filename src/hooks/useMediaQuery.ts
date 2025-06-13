"use client";

import { useState, useEffect } from "react";

// 指定されたメディアクエリに一致するかどうかを判定するカスタムフック
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // 初期表示時にサーバーとクライアントで差異が出ないよう、
    // windowオブジェクトはuseEffect内で参照する
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
