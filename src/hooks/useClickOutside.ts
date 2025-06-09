import { useEffect } from "react";

type Event = MouseEvent | TouchEvent;

// フックの引数の型定義を、より柔軟なものに変更します
export const useClickOutside = (
  // 「.current プロパティを持つオブジェクト」という、より柔軟な型定義に変更
  ref: { current: HTMLElement | null },
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      // ref.current が存在しないか、クリックした場所が ref の内側なら何もしない
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      // 外側がクリックされた場合のみハンドラを実行
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};
