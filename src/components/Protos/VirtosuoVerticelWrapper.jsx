import React, { useLayoutEffect, useRef, useState } from "react";
import { isElementScrollable } from "../../helpers/functions";
import { refType } from "../../helpers/jsDocs";

export const VirtosuoVerticelWrapper = (props) => {
  const elRef = useRef(refType);
  const [padding, setPadding] = useState(0);
  /**
   *
   * @param {HTMLElement} el
   */
  const handler = (el) => {
    const scroller = el.parentNode.parentNode.parentNode;
    const isScroller = isElementScrollable(scroller).vertical;

    isScroller && setPadding("0.25rem");
    !isScroller && setPadding("0");
  };
  useLayoutEffect(() => {
    if (!elRef || !elRef.current) return;
    handler(elRef.current);
    const resizerObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        handler(entry.target);
      });
    });

    resizerObserver.observe(elRef.current);

    return () => {
      resizerObserver.disconnect();
    };
  }, [elRef, elRef.current]);

  return (
    <div
      ref={elRef}
      {...props}
      style={{ paddingRight: padding , marginBottom:'0.5rem' }}
      // className="gutter overflow-auto"
    />
  );
};
