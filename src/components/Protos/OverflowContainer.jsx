import { OptionsButton } from "@/components/Protos/OptionsButton";
import React, { useLayoutEffect, useRef, useState } from "react";


export const OverflowContainer = ({
  children,
  className = "",
  moreButtonProps = {},
}) => {
  const containerRef = useRef(null);
  const moreButtonRef = useRef(null);
  const childrenArray = React.Children.toArray(children);

  const [visibleCount, setVisibleCount] = useState(childrenArray.length);
  const [showMore, setShowMore] = useState(false);

  useLayoutEffect(() => {
    const calculate = () => {
      const container = containerRef.current;
      if (!container) return;

      const items = Array.from(container.children).filter(
        (c) => c !== moreButtonRef.current
      );
      if (items.length === 0) return;

      // 1. Force ALL items to be visible temporarily to get true dimensions.
      // This solves the issue where <Hr /> or other flex-grow elements change size based on what is hidden.
      const originalDisplays = items.map((item) => item.style.display);
      items.forEach((item) => {
        item.style.display = "flex";
      });

      // 2. Measure the "More" button's exact width
      let moreWidth = 40;
      if (moreButtonRef.current) {
        const moreBtn = moreButtonRef.current;
        const originalMoreDisplay = moreBtn.style.display;
        
        moreBtn.style.display = "flex";
        moreWidth = moreBtn.offsetWidth;
        
        moreBtn.style.display = originalMoreDisplay || "none";
      }

      // 3. Get the absolute right edge of the container's content area
      const containerRect = container.getBoundingClientRect();
      const safeRight = containerRect.left + container.clientWidth - moreWidth;

      let count = 0;
      let isOverflowing = false;

      // 4. Check which items fit within the safe bounds
      for (let i = 0; i < items.length; i++) {
        const itemRect = items[i].getBoundingClientRect();
        
        // If the item's right edge passes the safe zone, it overflows
        if (itemRect.right <= safeRight + 1) {
          count = i + 1;
        } else {
          isOverflowing = true;
          break; // Since it's a flex row, if one overflows, the rest will too
        }
      }

      // 5. Restore original styles before React re-renders
      items.forEach((item, index) => {
        item.style.display = originalDisplays[index];
      });

      // 6. Trigger React re-render
      setVisibleCount(count);
      setShowMore(isOverflowing);
    };

    calculate();

    // Recalculate when the container resizes
    const ro = new ResizeObserver(calculate);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => ro.disconnect();
  }, [childrenArray]);

  const hiddenChildren = childrenArray.slice(visibleCount);

  return (
    <div
      ref={containerRef}
      className={`flex flex-nowrap items-center gap-2 jusbe overflow-hidden ${className}`}
    >
      {childrenArray.map((child, i) => (
        <div
          key={i}
          className="flex-shrink-0"
          style={{
            display: i >= visibleCount ? "none" : "flex",
            visibility: i >= visibleCount ? "hidden" : "visible",
          }}
        >
          {child}
        </div>
      ))}

      <div
        ref={moreButtonRef}
        className="flex-shrink-0"
        style={{
          display: showMore ? "flex" : "none",
          visibility: showMore ? "visible" : "hidden",
        }}
      >
        <OptionsButton {...moreButtonProps}>
          <div className="flex flex-col gap-2 p-2 max-h-[300px] overflow-y-auto">
            {hiddenChildren.map((child, i) => (
              <div key={i} className="w-full flex justify-center items-center">
                {child}
              </div>
            ))}
          </div>
        </OptionsButton>
      </div>
    </div>
  );
};