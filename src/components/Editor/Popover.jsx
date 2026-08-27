import { currentRefType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import Portal from "@/components/Editor/Portal";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Rnd } from "react-rnd";
import { ShowIf } from "../ShowIf";
import { DragLayer } from "./Protos/DragLayer";
import { getParentNode } from "@/helpers/functions";

export const Popover = ({
  targetRef = currentRefType,
  isCode = false,
  zIndex = 50,
  width = 0,
  height = 0,
  isOpen = false,
  setIsOpen = (value = false) => {},
  children,
  className = "",
}) => {
  const contentRef = useRef(null);
  const panelWidth = width || 400;
  const panelHeight = height || 300;

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: panelWidth, height: panelHeight });
  const [isDetached, setIsDetached] = useState(false);
  const [showDragLayer, setShowDragLayer] = useState(false);

  // Refs for the rAF loop (avoids stale closures)
  const rafRef = useRef(null);
  const lastPosRef = useRef(null);
  const isDetachedRef = useRef(false); // instant check, no waiting for re-render

  useEffect(() => {
    setSize({ width: panelWidth, height: panelHeight });
  }, [panelWidth, panelHeight]);

  const calcWhereAmI = useCallback(() => {
    let x = window.innerWidth / 2 - size.width / 2;
    let y = window.innerHeight / 2 - size.height / 2;

    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect(); // ← catches transforms
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeBelow = spaceBelow >= size.height + 20;

      x = rect.left;
      y = placeBelow ? rect.bottom + 8 : rect.top - size.height - 8;
    }

    x = Math.max(8, Math.min(window.innerWidth - size.width - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - size.height - 8, y));

    return { x, y };
  }, [targetRef, size.width, size.height]);

  // ✅ rAF POLLING LOOP — the ONLY thing that catches auto-animate transforms
  useLayoutEffect(() => {
    if (!isOpen) {
      isDetachedRef.current = false;
      setIsDetached(false);
      lastPosRef.current = null;
      return;
    }

    if (isDetached) return; // user dragged it → stop following

    let alive = true;

    const tick = () => {
      if (!alive || isDetachedRef.current) return;

      const next = calcWhereAmI();

      // Only setState when position actually changed (avoids 60 re-renders/sec)
      if (
        !lastPosRef.current ||
        lastPosRef.current.x !== next.x ||
        lastPosRef.current.y !== next.y
      ) {
        lastPosRef.current = next;
        setPos(next);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      alive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, isDetached, calcWhereAmI]);

  // Escape + outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      const parentNode  = getParentNode((el) => el.hasAttribute("data-ignore-popover")  , e.target);
      if (parentNode) return;
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <Portal container={document.querySelector("#root")}>
      <ShowIf condition={showDragLayer}>
        <DragLayer />
      </ShowIf>

      {/*
        react-rnd's drag-delta math assumes its own node is `position: absolute`
        relative to a normally-flowed offsetParent — that's its internal
        default. Forcing `position: fixed` directly on <Rnd> (the old approach)
        changes what the browser actually paints it relative to (the viewport)
        without changing what react-rnd's math assumes, so the two disagree
        the instant you start dragging: the cursor doesn't move, but the panel
        snaps by a fixed offset. This full-viewport `position: fixed` wrapper
        gives <Rnd> the "normally-flowed absolute parent" it expects, so its
        internal math and the actual paint now agree — the offset is gone.
        pointer-events: none here so this empty full-screen div doesn't block
        clicks anywhere else on the page; <Rnd> re-enables pointer-events on
        itself below.
      */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <Rnd
          position={{ x: pos.x, y: pos.y }}
          size={{ width: size.width, height: size.height }}
          minWidth={250}
          minHeight={150}
          bounds="window"
          dragHandleClassName="popover-drag-handle"
          style={{ zIndex, position: "absolute", pointerEvents: "auto" }}
          className={`bg-surface-secondary border border-border-default shadow-md shadow-slate-950 rounded-lg ${className ?? ""}`}
          // --- Drag: detach from target, take manual control ---
          onDragStart={() => {
            isDetachedRef.current = true; // ← instant, kills rAF loop immediately
            setIsDetached(true);
            setShowDragLayer(true);
          }}
          onDrag={(e, d) => {
            setPos({ x: d.x, y: d.y }); // ← required for controlled position
          }}
          onDragStop={(e, d) => {
            setPos({ x: d.x, y: d.y });
            setShowDragLayer(false);
          }}
          // --- Resize: same detach logic ---
          onResizeStart={() => {
            isDetachedRef.current = true;
            setIsDetached(true);
            setShowDragLayer(true);
          }}
          onResize={(e, dir, ref, delta, position) => {
            setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
            setPos({ x: position.x, y: position.y });
          }}
          onResizeStop={(e, dir, ref, delta, position) => {
            setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
            setPos({ x: position.x, y: position.y });
            setShowDragLayer(false);
          }}
        >
          <div ref={contentRef} className="w-full h-full flex flex-col relative">
            {isCode && (
              <div className="z-20 absolute left-[-30px] top-0 bg-surface-tertiary rounded-tl-md rounded-bl-md overflow-hidden flex flex-col justify-center">
                <button
                  data-ignore-popover
                  className="w-[30px] h-[30px] flex justify-center items-center hover:bg-surface-secondary transition-colors"
                  onClick={() => contentRef.current?.requestFullscreen()}
                >
                  {/* {Icons.fullscreen({ fill: "white", width: 15 })} */}
                  <i className="pointer-events-none">
                    <Icons.fullscreen fill="white" width={15} />
                  </i>
                </button>

                <button
                  data-ignore-popover
                  className="popover-drag-handle w-[30px] h-[30px] flex justify-center items-center hover:bg-surface-secondary transition-colors cursor-grab active:cursor-grabbing"
                >
                  {/* {Icons.drag({ fill: "white", width: 15, height: 20 })} */}
                  <i className="pointer-events-none">
                    <Icons.drag fill="white" width={15} height={20} />
                  </i>
                </button>

                <button
                  data-ignore-popover
                  className="w-[30px] h-[30px] flex justify-center items-center hover:bg-surface-secondary transition-colors text-slate-400 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    className="pointer-events-none"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
          </div>
        </Rnd>
      </div>
    </Portal>
  );
};