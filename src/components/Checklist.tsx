"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/StateContext";
import type { Task } from "@/types/task";
import { MarkdownContent } from "./MarkdownContent";

interface ChecklistProps {
  task: Task;
  content: string;
}

interface ChecklistItem {
  lineIndex: number;
  text: string;
  checked: boolean;
}

interface MarkdownBlock {
  type: "markdown";
  key: string;
  content: string;
}

interface ChecklistBlock {
  type: "checklist";
  key: string;
  item: ChecklistItem;
}

type RenderBlock = MarkdownBlock | ChecklistBlock;

const taskListItemRegex = /^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/;
const checklistFenceRegex = /^```\s*checklist\s*$/;
const fenceRegex = /^```\s*$/;

export function Checklist({ task, content }: ChecklistProps) {
  const { handleDescriptionChange } = useAppState();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [blocks, setBlocks] = useState<RenderBlock[]>([]);

  useEffect(() => {
    const lines = content.split("\n");
    const parsedItems: ChecklistItem[] = [];
    const parsedBlocks: RenderBlock[] = [];
    const markdownBuffer: string[] = [];
    let inChecklistFence = false;

    const flushMarkdown = () => {
      const markdown = markdownBuffer.join("\n").trim();
      if (markdown) {
        parsedBlocks.push({
          type: "markdown",
          key: `markdown-${parsedBlocks.length}`,
          content: markdown,
        });
      }
      markdownBuffer.length = 0;
    };

    lines.forEach((line, lineIndex) => {
      if (checklistFenceRegex.test(line.trim())) {
        flushMarkdown();
        inChecklistFence = true;
        return;
      }

      if (inChecklistFence && fenceRegex.test(line.trim())) {
        flushMarkdown();
        inChecklistFence = false;
        return;
      }

      const match = line.match(taskListItemRegex);
      if (match) {
        flushMarkdown();
        const item = {
          lineIndex,
          checked: match[2].toLowerCase() === "x",
          text: match[3].trim(),
        };
        parsedItems.push(item);
        parsedBlocks.push({
          type: "checklist",
          key: `checklist-${lineIndex}`,
          item,
        });
        return;
      }

      if (!inChecklistFence) {
        markdownBuffer.push(line);
      }
    });

    flushMarkdown();
    setItems(parsedItems);
    setBlocks(parsedBlocks);
  }, [content]);

  const handleCheckboxChange = (index: number) => {
    if (index < 0) return;

    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);

    const currentDescription = task.description ?? "";
    const lines = currentDescription.split("\n");
    const item = newItems[index];
    const currentLine = lines[item.lineIndex] ?? "";
    lines[item.lineIndex] = currentLine.replace(
      /^(\s*[-*+]\s+\[)([ xX])(\]\s+.*)$/,
      `$1${item.checked ? "x" : " "}$3`
    );

    handleDescriptionChange(task.id, lines.join("\n"));
  };

  return (
    <div className="bg-gray-100 p-3 my-2 rounded-md text-sm text-gray-700">
      {blocks.map((block) => {
        if (block.type === "markdown") {
          return (
            <div key={block.key} className="mb-2 last:mb-0">
              <MarkdownContent compact>{block.content}</MarkdownContent>
            </div>
          );
        }

        const index = items.findIndex(
          (item) => item.lineIndex === block.item.lineIndex
        );

        return (
          <label
            key={block.key}
            className="mb-2 flex items-center last:mb-0"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={block.item.checked}
              onChange={() => handleCheckboxChange(index)}
              className="mr-3 h-5 w-5"
            />
            <span
              className={
                block.item.checked
                  ? "text-gray-500 line-through"
                  : "text-black"
              }
            >
              {block.item.text}
            </span>
          </label>
        );
      })}
    </div>
  );
}
