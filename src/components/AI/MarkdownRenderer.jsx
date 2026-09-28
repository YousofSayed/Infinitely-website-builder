import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// --- VS Code Style Code Block with Copy Button ---
const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-slate-700/50 shadow-lg">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-[#252526] text-slate-400 text-xs px-4 py-2 border-b border-slate-700/50">
        <span className="font-mono uppercase tracking-wider">{language || "plaintext"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] font-medium uppercase tracking-wider"
        >
          {copied ? "✓ Copied" : "Copy code"}
        </button>
      </div>
      
      {/* Syntax Highlighter */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || "text"}
        PreTag="div"
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.85rem",
          padding: "1rem",
          background: "#1e1e1e", // Exact VS Code background
        }}
        lineNumberStyle={{ 
          color: "#858585", 
          fontSize: "0.75rem", 
          paddingRight: "1rem",
          minWidth: "2.5rem"
        }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
};

// --- Main Markdown Renderer ---
export const MarkdownRenderer = ({ content, isUser = false }) => {
  return (
    <div className={`markdown-body ${isUser ? "text-white" : "text-slate-200"} text-sm leading-relaxed w-full break-words`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 1. Handle Code Blocks vs Inline Code
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const hasNewlines = String(children).includes("\n");

            // If it has a language tag OR contains newlines, it's a block code
            if (match || hasNewlines) {
              return <CodeBlock language={match ? match[1] : ""} children={children} />;
            }

            // Otherwise, it's inline code (e.g., `const x = 1`)
            return (
              <code
                className={`${className || ""} ${isUser ? "bg-white/20" : "bg-slate-700/60"} px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-white/10`}
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // 2. Style standard Markdown elements for dark mode
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-primary pl-3 italic text-slate-300 my-3 bg-slate-800/30 py-1 rounded-r">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mb-1 mt-2">{children}</h3>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded border border-slate-700">
              <table className="min-w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-slate-700 bg-slate-800/50 px-3 py-2 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-slate-700/50 px-3 py-2">{children}</td>,
          hr: () => <hr className="my-4 border-slate-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};