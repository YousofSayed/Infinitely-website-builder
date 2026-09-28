import React, { memo, useEffect, useRef } from "react";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

// Import a VS Code-like dark theme
import "highlight.js/styles/github-dark.css"; 
import { detectDir } from "@/helpers/functions";

// 1. Configure Marked + Highlight.js (Runs once on load)
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

marked.setOptions({
  breaks: true, // Converts single line breaks to <br> (crucial for AI chat)
  gfm: true,    // GitHub Flavored Markdown (tables, strikethrough, etc.)
});

// 2. The Lightning-Fast Component
const FastMarkdown = memo(function FastMarkdown({ content, isUser }) {
  const containerRef = useRef(null);

  // Parse to HTML string and sanitize (Takes < 1 millisecond)
  const rawHtml = marked.parse(content || "");
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["target"], // Allow target="_blank" on links
  });

  // 3. Attach click handlers to code blocks for "Copy" functionality
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleCopy = (e) => {
      const btn = e.target.closest(".copy-btn");
      if (!btn) return;
      
      const codeBlock = btn.parentElement.querySelector("code");
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText);
        btn.innerText = "Copied!";
        setTimeout(() => (btn.innerText = "Copy"), 2000);
      }
    };

    containerRef.current.addEventListener("click", handleCopy);
    
    // Inject copy buttons into code blocks
    const preBlocks = containerRef.current.querySelectorAll("pre");
    preBlocks.forEach((pre) => {
      if (!pre.querySelector(".copy-btn")) {
        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.innerText = "Copy";
        pre.style.position = "relative";
        btn.style.cssText = "position:absolute;top:8px;right:8px;background:#333;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:11px;cursor:pointer;opacity:0.7;";
        pre.appendChild(btn);
      }
    });

    return () => containerRef.current?.removeEventListener("click", handleCopy);
  }, [cleanHtml]);

  return (
    <div
      ref={containerRef}
      style={{ direction:detectDir(content) }}
      // Use Tailwind's prose if you have it, otherwise use the custom CSS below
      className={`markdown-body my-2 ${isUser ? "text-white" : "text-slate-200"}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
});

export default FastMarkdown;