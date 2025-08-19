import React, { useEffect, useRef, useState } from "react";
import { refType } from "../../helpers/jsDocs";
import { entries } from "lodash";
import { toast } from "react-toastify";
import { Loader } from "../Loader";
import { useAutoAnimate } from "@formkit/auto-animate/react";
/**
 * @template T
 * @typedef {Object} IntersectionListProps
 * @property {T[]} list - The array of items to render.
 * @property {(item: T, index: number) => React.ReactNode} renderItem - Function to render each item.
 * @property {number} [count] - Number of items to load initially and on each intersection trigger.
 */

/**
 * A component that renders a list and progressively loads more items
 * when the bottom sentinel enters the viewport.
 *
 * @template T
 * @param {React.HTMLAttributes<HTMLDivElement> & IntersectionListProps<T>} props
 * @returns {JSX.Element}
 */
export const IntersectionList = ({
  list = [],
  renderItem = () => null,
  count = 55,
  ...props
}) => {
  const [visibleCount, setVisibleCount] = useState(count);
  const [parent] = useAutoAnimate();
  const loader = useRef(null);

  useEffect(() => {
    if (!loader.current) return;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + count, list.length));
        }
      },
      { threshold: 0.01 }
    );

    intersectionObserver.observe(loader.current);

    return () => {
      if (loader.current) intersectionObserver.unobserve(loader.current);
      intersectionObserver.disconnect();
    };
  }, [loader, count, list.length]);

  return (
    <div ref={parent} {...props} className={`${props.className || ''} relative`}>
      {list.slice(0, visibleCount).map((item, index) => renderItem(item, index))}
      {visibleCount < list.length && (
        <div
          className="w-full h-[50px] flex justify-center items-center"
          ref={loader}
        >
          <Loader height={30} width={30} />
        </div>
      )}
    </div>
  );
};
