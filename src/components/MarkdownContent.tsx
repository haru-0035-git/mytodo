"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  children: string;
  compact?: boolean;
}

export function MarkdownContent({ children, compact }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => (
          <h1
            className="mb-2 text-xl font-bold text-black last:mb-0"
            {...props}
          />
        ),
        h2: (props) => (
          <h2
            className="mb-2 text-lg font-bold text-black last:mb-0"
            {...props}
          />
        ),
        h3: (props) => (
          <h3
            className="mb-2 text-base font-semibold text-black last:mb-0"
            {...props}
          />
        ),
        p: (props) => (
          <p
            className={`${compact ? "mb-1" : "mb-2"} last:mb-0`}
            {...props}
          />
        ),
        ul: (props) => (
          <ul
            className="mb-2 list-disc space-y-1 pl-5 last:mb-0"
            {...props}
          />
        ),
        ol: (props) => (
          <ol
            className="mb-2 list-decimal space-y-1 pl-5 last:mb-0"
            {...props}
          />
        ),
        li: (props) => <li className="pl-1" {...props} />,
        a: (props) => (
          <a
            className="text-sky-700 underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
            {...props}
          />
        ),
        code: (props) => (
          <code
            className="rounded bg-gray-200 px-1 py-0.5 text-[0.9em] text-gray-900"
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote
            className="mb-2 border-l-4 border-gray-300 pl-3 text-gray-600 last:mb-0"
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
