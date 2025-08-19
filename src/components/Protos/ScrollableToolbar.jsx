import React, { useEffect, useRef, useState } from "react";
import { currentRefType, refType } from "../../helpers/jsDocs";
import { Icons } from "../Icons/Icons";
import { addClickClass } from "../../helpers/cocktail";
import { isElementScrollable } from "../../helpers/functions";
import { scrollBarResizerObserver } from "../../observers/scrollbarReszierObserver";
import { useAutoAnimate } from "@formkit/auto-animate/react";

/**
 *
 * @param {React.HTMLAttributes<HTMLElement>} [props]
 * @returns
 */
export const ScrollableToolbar = ({
  children,
  className = "",
  space = 1,
  ...props
}) => {
  const scrollEl = useRef(refType);
  const [isScrollableElement, setIsScrollable] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [parent] = useAutoAnimate();

  const calcStartAndEnd = () => {
    const scrollLeft = scrollEl.current.scrollLeft;
    const isInStart = scrollLeft === 0;
    const isInEnd =
      scrollLeft ===
      scrollEl.current.scrollWidth - scrollEl.current.clientWidth;
    setIsStart(isInStart);
    setIsEnd(isInEnd);
  };

  useEffect(() => {
    if (!scrollEl.current) return;
  }, [scrollEl]);

  useEffect(() => {
    if (!scrollEl.current) return;

    const windowResizeCallback = (ev) => {
      const isScrollable = isElementScrollable(scrollEl.current).horizontal;
      setIsScrollable(isScrollable);
      calcStartAndEnd();
    };
    windowResizeCallback();
    // window.addEventListener("resize", windowResizeCallback);
    const callback = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => {
          if (!scrollEl.current) return;
          const isScrollable = isElementScrollable(scrollEl.current).horizontal;
          // console.log(
          //   "el resizing , ",
          //   isScrollable,
          //   isElementScrollable(scrollEl.current)
          // );
          setIsScrollable(isScrollable);
          calcStartAndEnd();
        });
      } else {
        const isScrollable = isElementScrollable(scrollEl.current).horizontal;
        console.log(
          "el resizing , ",
          isScrollable,
          isElementScrollable(scrollEl.current)
        );
        setIsScrollable(isScrollable);
        calcStartAndEnd();
      }
    };
    scrollEl.current.addEventListener("observer-resize", callback);

    scrollBarResizerObserver.observe(scrollEl.current);

    return () => {
      // window.removeEventListener("resize", windowResizeCallback);
      // scrollEl.current.removeEventListener("observer-resize", callback);
      scrollEl.current && scrollBarResizerObserver.unobserve(scrollEl.current);
    };
  }, [scrollEl]);

  const scrollToLeft = () => {
    const scrollValue =
      scrollEl.current.scrollLeft - scrollEl.current.clientWidth * (75 / 100);
    scrollEl.current.scrollTo({ left: scrollValue, behavior: "smooth" });
    // calcStartAndEnd();
  };

  const scrollToRight = () => {
    const scrollValue =
      scrollEl.current.scrollLeft + scrollEl.current.clientWidth * (75 / 100);
    scrollEl.current.scrollTo({ left: scrollValue, behavior: "smooth" });
    // calcStartAndEnd();
  };

  return (
    <section
      {...props}
      ref={parent}
      style={{ willChange: "width" }}
      className={`relative rounded-lg overflow-hidden   ${className}`}
    >
      {isScrollableElement && (
        <div
          className={`z-50 absolute left-0 top-[-25px] h-[calc(100%+50px)] w-[40px]  backdrop-blur-xl bg-[rgba(255,255,255,0.01)] flex items-center justify-center  transition-all `}
        >
          <button
            onClick={(ev) => {
              addClickClass(ev.currentTarget, "click");
              scrollToLeft();
            }}
            className={`btn-arrow backdrop-blur-lg w-[30px] h-[30px] flex items-center justify-center z-30 rounded-lg  hover:bg-blue-600  [&:hover_path]:stroke-white transition-colors  `}
          >
            <span className="rotate-90 ">
              {Icons.arrow(!isStart ? "white" : undefined)}
            </span>
          </button>
        </div>
      )}
      <section
        ref={scrollEl}
        onScroll={(ev) => {
          calcStartAndEnd();
        }}
        style={{
          padding: `0 ${isScrollableElement ? "45px" : ""}`,
        }}
        className={` w-full h-full items-center overflow-auto hideScrollBar  transition-all duration-[0.1s] flex justify-between  ${
          space && `gap-${space}`
        } `}
      >
        {children}
      </section>

      {isScrollableElement && (
        <div
          className={`z-50 absolute right-0 top-[-25px] h-[calc(100%+50px)] w-[40px]  backdrop-blur-xl bg-[rgba(255,255,255,0.01)] flex items-center justify-center  `}
        >
          <button
            onClick={(ev) => {
              addClickClass(ev.currentTarget, "click");
              scrollToRight();
            }}
            className={`btn-arrow backdrop-blur-lg w-[30px] h-[30px] flex items-center justify-center z-30 rounded-lg  hover:bg-blue-600  [&:hover_path]:stroke-white transition-colors `}
          >
            <span className="rotate-[-90deg]">
              {Icons.arrow(!isEnd ? "white" : undefined)}
            </span>
          </button>
        </div>
      )}
    </section>
  );
};
