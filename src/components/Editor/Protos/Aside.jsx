import { refsStt, showCustomModalState, widths } from "@/helpers/atoms";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const Aside = ({ children, className = "", dir = "left", style }) => {
  const [parent] = useAutoAnimate();

  return (
    <aside
      id="main-aside"
      style={style}
      ref={parent}
      className={`  relative   h-full  bg-surface-secondary p-2    overflow-y-auto hideScrollBar auto-animate animate-go-to  ${className}`}
    >
      <section className="relative h-full w-full overflow-y-auto flex flex-col hideScrollBar">
        {children}
      </section>
    </aside>
  );
};
