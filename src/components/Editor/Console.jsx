import { consoleLogs, consoleLogsNotification } from "@/helpers/atoms";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRecoilState } from "recoil";
import { ShowIf } from "@/components/ShowIf";
import { Icons } from "@/components/Icons/Icons";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";

// million-ignore

// ✅ FIX: IMPORT FROM THE REACT SUBFOLDER!
import { Console as ConsoleFeed } from "console-feed";

export const Console = () => {
  const [logs, setLogs] = useRecoilState(consoleLogs);
  const [logsNotification, setLogsNotification] = useRecoilState(
    consoleLogsNotification,
  );
  const [filterSource, setFilterSource] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);

  const clearLogs = () => setLogs([]);

  // Just filter. Do not map or rebuild the data array!
  const formattedLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterSource !== "all" && log.source !== filterSource) return false;
      if (filterLevel !== "all" && log.method !== filterLevel) return false;
      return true;
    });
  }, [logs, filterSource, filterLevel]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setLogsNotification(false);
  }, [formattedLogs, autoScroll]);

  useEffect(() => {
    
  }, []);

  const levelOptions = [
    { value: "all", label: "All Levels" },
    { value: "log", label: "Log" },
    { value: "info", label: "Info" },
    { value: "warn", label: "Warn" },
    { value: "error", label: "Error" },
    { value: "debug", label: "Debug" },
  ];

  return (
    <main className="h-full w-full flex flex-col bg-surface-secondary rounded-lg overflow-hidden border border-surface-tertiary shadow-xl">
      <header className="flex  justify-between gap-2 p-2 border-b border-surface-tertiary bg-surface-tertiary/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 pl-1">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
          <MiniTitle className="!m-0 text-sm">Console</MiniTitle>
        </div>

        <div className="flex h-full gap-2">
          <div className="flex  bg-surface-secondary rounded-lg  border border-surface-tertiary">
            <button
              type="button"
              className={` px-2 py-1 text-[11px] rounded-md transition-all font-medium ${
                filterSource === "all"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setFilterSource("all")}
            >
              All
            </button>
            <button
              type="button"
              className={` px-2 py-1 text-[11px] rounded-md transition-all font-medium ${
                filterSource === "editor"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setFilterSource("editor")}
            >
              Editor
            </button>
            <button
              type="button"
              className={` px-2 py-1 text-[11px] rounded-md transition-all font-medium ${
                filterSource === "preview"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setFilterSource("preview")}
            >
              Preview
            </button>
          </div>

          <select
            className="bg-surface-secondary text-slate-200 text-[11px] rounded-lg px-2 py-1.5 border border-surface-tertiary focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium cursor-pointer"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            {levelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <SmallButton
            tooltipTitle="Clear console"
            className="!bg-[crimson]/80 hover:!bg-[crimson] p-1.5 border border-[crimson]/50"
            tooltipClassName="!bg-[crimson]"
            onClick={clearLogs}
          >
            {Icons.trash("white", 2, 14, 14)}
          </SmallButton>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto hideScrollBar bg-[#242424]"
      >
        <ShowIf condition={formattedLogs.length === 0}>
          {() => (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-12 h-full">
              <div className="w-14 h-14 rounded-full bg-surface-tertiary flex items-center justify-center border border-surface-tertiary">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-600"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-slate-400 block">
                  Console is empty
                </span>
              </div>
            </div>
          )}
        </ShowIf>

        <ShowIf condition={formattedLogs?.length > 0}>
          {() => (
            <ConsoleFeed
              logs={formattedLogs}
              variant="dark"
              styles={{
                PADDING: `.4rem`,
                LOG_BORDER: "#475569",
              }}
            />
          )}
        </ShowIf>
      </div>

      <footer className="flex items-center justify-between px-3 py-1.5 border-t border-surface-tertiary bg-surface-tertiary/30 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="text-slate-500">Logs:</span>
          <span className="text-slate-200">{formattedLogs.length}</span>
          <span className="text-slate-600">/ {logs.length}</span>
        </span>

        <button
          type="button"
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${autoScroll ? "text-brand-primary" : "hover:text-slate-200"}`}
          onClick={() => setAutoScroll(!autoScroll)}
        >
          <span>Auto-scroll</span>
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${autoScroll ? "bg-brand-primary" : "bg-slate-500"}`}
          ></span>
        </button>
      </footer>
    </main>
  );
};
