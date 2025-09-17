"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/StateContext";
import type { Task } from "@/types/task";

interface ChecklistProps {
  task: Task;
  content: string;
}

interface ChecklistItem {
  text: string;
  checked: boolean;
}

export function Checklist({ task, content }: ChecklistProps) {
  const { handleDescriptionChange } = useAppState();
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const parsedItems = content
      .split("\n")
      .filter((line) => line.trim().startsWith("- ["))
      .map((line) => {
        const match = line.match(/-\s*\[([xX\s]?)\]\s*(.*)/);
        if (!match) return { text: line, checked: false }; // Fallback
        const checked = match[1].toLowerCase() === "x";
        const text = match[2].trim();
        return { text, checked };
      });
    setItems(parsedItems);
  }, [content]);

  const handleCheckboxChange = (index: number) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);

    const newContent = newItems
      .map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`)
      .join("\n");

    const currentDescription = task.description ?? "";

    // Use a regex that doesn't require the 's' flag for broader compatibility
    const checklistRegex = /```checklist\s*\n([\s\S]*?)\n\s*```/;

    const newDescription = currentDescription.replace(
      checklistRegex,
      "\n```checklist\n" + newContent + "\n```\n"
    );

    handleDescriptionChange(task.id, newDescription);
  };

  return (
    <div className="bg-gray-100 p-3 my-2 rounded-md">
      <ul className="list-none space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleCheckboxChange(index)}
              onClick={(e) => e.stopPropagation()}
              className="mr-3 h-5 w-5"
            />
            <span
              className={
                item.checked ? "text-gray-500 line-through" : "text-black"
              }
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
