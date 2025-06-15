import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { refsStt, showCustomModalState, widths } from "../../../helpers/atoms";

export const Aside = ({ children, className = "", dir = "left" , style }) => {
  /**
   * @type {{current:HTMLElement}}
   */
  const asideRef = useRef();
  /**
   * @type {{current:HTMLElement}}
   */
  const resizerRef = useRef();
  const showCustomModal = useRecoilValue(showCustomModalState);

  return (
    <aside
    id="main-aside"
    style={style}
      ref={asideRef}
      className={`${className}  relative backdrop-blur-lg  h-full  bg-slate-900 p-2 flex flex-col   overflow-y-auto hideScrollBar`}
    >
      {/* <section id="" className="h-full w-full  flex flex-col gap-3  overflow-y-auto hideScrollBar">
        {children}
      </section> */}

      {children}

      {/* {!showCustomModal && (
        <PanelResizeHandle
          className={`flex  items-center justify-center opacity-0  hover:opacity-[1] select-none transition-all absolute w-[5px] h-full  top-0 ${
            dir == "left" ? "left-0" : "right-0"
          } bg-blue-600 cursor-col-resize`}
        />
      )} */}
    </aside>
  );
};
