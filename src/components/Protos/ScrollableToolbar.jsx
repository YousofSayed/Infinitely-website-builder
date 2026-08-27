import { addClickClass } from "@/helpers/cocktail";
import { scrollBarResizerObserver } from "@/observers/scrollbarReszierObserver";
import { Icons } from "@/components/Icons/Icons";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ShowIf } from '@/components/ShowIf'; 

export const ScrollableToolbar = ({ 
  children,
  className = "",
  innerClassName = "",
  space = 1,
  ...props
}) => {
  const scrollEl = useRef(null);
  const [isScrollableElement, setIsScrollable] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  const calcStartAndEnd = useCallback(() => {
    if (!scrollEl.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollEl.current;
    const isInStart = scrollLeft <= 1;
    // Use raw scrollWidth here so the user can scroll all the way into the spacer area
    const isInEnd = scrollLeft + clientWidth >= scrollWidth - 5;
    
    setIsStart((prev) => (prev !== isInStart ? isInStart : prev));
    setIsEnd((prev) => (prev !== isInEnd ? isInEnd : prev));
  }, []);

  useEffect(() => {
    if (!scrollEl.current) return;

    let timeoutId = null;

    const checkScrollable = () => {
      if (!scrollEl.current) return;
      const el = scrollEl.current;
      
      // 🔥 THE FIX FOR THE SPACER TRAP:
      // We must subtract the spacers' width to get the TRUE content width.
      // This prevents the spacers from artificially inflating scrollWidth 
      // and trapping the component in a scrollable state when maximized.
      const spacers = el.querySelectorAll('.scroll-spacer');
      let spacerWidth = 0;
      spacers.forEach((sp) => spacerWidth += (sp ).offsetWidth);
      
      const trueScrollWidth = el.scrollWidth - spacerWidth;
      
      // 5px tolerance safely handles CSS zoom subpixel rounding
      const isScrollable = trueScrollWidth > el.clientWidth + 5;
      
      setIsScrollable((prev) => (prev !== isScrollable ? isScrollable : prev));
      calcStartAndEnd();
    };

    const observerCallback = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScrollable, 50);
    };
    
    scrollEl.current.addEventListener("observer-resize", observerCallback);
    scrollBarResizerObserver.observe(scrollEl.current);
    window.addEventListener("resize", observerCallback);

    checkScrollable();

    return () => {
      clearTimeout(timeoutId);
      if (scrollEl.current) {
        scrollEl.current.removeEventListener("observer-resize", observerCallback);
        scrollBarResizerObserver.unobserve(scrollEl.current);
      }
      window.removeEventListener("resize", observerCallback);
    };
  }, [calcStartAndEnd]);

  const scrollToLeft = () => {
    if (!scrollEl.current) return;
    const scrollValue = scrollEl.current.scrollLeft - scrollEl.current.clientWidth * 0.75;
    scrollEl.current.scrollTo({ left: Math.max(0, scrollValue), behavior: "smooth" });
  };

  const scrollToRight = () => {
    if (!scrollEl.current) return;
    const scrollValue = scrollEl.current.scrollLeft + scrollEl.current.clientWidth * 0.75;
    scrollEl.current.scrollTo({ left: scrollValue, behavior: "smooth" });
  };

  return (
    <section
      {...props}
      style={{ willChange: "width" }}
      className={`relative rounded-lg overflow-hidden ${className}`}
    >
      <div
        className={`z-50 absolute left-0 top-[-25px] h-[calc(100%+50px)] w-[40px] bg-blue-900/40 flex items-center justify-center transition-opacity duration-200 ${
          isScrollableElement ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={(ev) => {
            addClickClass(ev.currentTarget, "click");
            scrollToLeft();
          }}
          className={`btn-arrow backdrop-blur-lg w-[30px] h-[30px] flex items-center justify-center z-30 rounded-lg hover:bg-brand-primary [&:hover_path]:stroke-white transition-colors`}
        >
          <span className="rotate-90 ">
            {Icons.arrow(!isStart ? "white" : undefined)}
          </span>
        </button>
      </div>

      <section
        ref={scrollEl}
        onScroll={calcStartAndEnd}
        className={`w-full h-full items-center overflow-auto hideScrollBar flex justify-between ${
          space && `gap-${space} ${innerClassName}`
        }`}
      >
        {/* Added "scroll-spacer" class so JS can find and subtract them */}
        <ShowIf condition={isScrollableElement}>
          <div className="scroll-spacer h-full w-[40px] block shrink-0"></div>
        </ShowIf>
        {children}
        <ShowIf condition={isScrollableElement}>
          <div className="scroll-spacer h-full w-[40px] block shrink-0"></div>
        </ShowIf>
      </section>

      <div
        className={`z-50 absolute right-0 top-[-25px] h-[calc(100%+50px)] w-[40px] bg-blue-900/40 flex items-center justify-center transition-opacity duration-200 ${
          isScrollableElement ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={(ev) => {
            addClickClass(ev.currentTarget, "click");
            scrollToRight();
          }}
          className={`btn-arrow backdrop-blur-lg w-[30px] h-[30px] flex items-center justify-center z-30 rounded-lg hover:bg-brand-primary [&:hover_path]:stroke-white transition-colors`}
        >
          <span className="rotate-[-90deg]">
            {Icons.arrow(!isEnd ? "white" : undefined)}
          </span>
        </button>
      </div>
    </section>
  );
};