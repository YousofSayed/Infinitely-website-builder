import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { refType } from "../../../helpers/jsDocs";
import { Tooltip } from "react-tooltip";
import { isOverflowedHiddenEl } from "../../../helpers/functions";
import { uniqueID } from "../../../helpers/cocktail";

/**
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props
 * @returns {React.JSX.Element}
 */
export const FitTitle = ({ children, id, className, ...props }) => {
  const [showTooltib, setShowTooltib] = useState(false);
  const elRef = useRef(refType);
  const tbId = useRef(uniqueID());

  useLayoutEffect(() => {
    if (!elRef || !elRef.current) return;
    const isOver = isOverflowedHiddenEl(elRef.current);
    setShowTooltib(isOver);
    // if(isOver){
    //   const widthForChar = elRef.current.clientWidth / (elRef.current.textContent.length||0);
    //   elRef.current.style.fontSize = `${widthForChar}px`
    // }
    const resizerObserver = new ResizeObserver((entries)=>{
      entries.forEach(entry=>{
       const isOver = isOverflowedHiddenEl(elRef.current);
    setShowTooltib(isOver);
    // if(isOver){
    //   const widthForChar = elRef.current.clientWidth / elRef.current.textContent.length;
    //   elRef.current.style.fontSize = `${widthForChar*1.8}px`
    // }
        console.log(isOverflowedHiddenEl(entry.target));
      })
    })

    resizerObserver.observe(elRef.current);

    return ()=>{
      resizerObserver.disconnect()
    }
    // console.log('overflow : ',window.getComputedStyle(elRef.current).overflow,isOverflowedHiddenEl(elRef.current));
    
  }, [elRef, elRef.current]);

  
  return (
    <>
    <h1
      ref={elRef}
      {...props}
      id={id || ""}
      tooltib-id={tbId.current}
      className={`${className} font-semibold px-2 py-1  bg-blue-600 rounded-lg w-fit text-slate-200`}
    >
      {children}
    </h1>
      {showTooltib && <Tooltip place="bottom-start" anchorSelect={`[tooltib-id="${tbId.current}"]`} className="z-10 shadow-sm shadow-slate-950 flex items-center gap-2" opacity={1}>{children}</Tooltip>}
    </>
  );
};
