"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const COMPONENTS: Components = {
  p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2 last:mb-0 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2 last:mb-0 text-sm">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  ),
  code: ({ children, className }) =>
    className?.includes("language-") ? (
      <code className="block bg-secondary/60 rounded-lg px-3 py-2 text-[12px] font-mono overflow-x-auto my-2 whitespace-pre">{children}</code>
    ) : (
      <code className="bg-secondary/60 rounded px-1.5 py-0.5 text-[12px] font-mono">{children}</code>
    ),
  pre: ({ children }) => <pre className="overflow-x-auto my-2">{children}</pre>,
  h1: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
  h2: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground my-2">{children}</blockquote>
  ),
  hr: () => <hr className="border-border my-2" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="text-[12px] border-collapse w-full">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border px-2 py-1 bg-secondary/40 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
};

export function MarkdownText({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
      {text}
    </ReactMarkdown>
  );
}
