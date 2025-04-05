import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Icons } from "../Icons/Icons";
import { addClickClass } from "../../helpers/cocktail";

/**
 * A great component that displays a shop name!
 * @typedef {object} InfinitelyTooltipButtonProps
 * @property {React.ReactNode} children
 * @property {( ev:MouseEvent , callback: ( setTooltipData : import('react-tooltip').TooltipRefProps)=>void)=>void} onPress
 * @param {React.HTMLAttributes<HTMLButtonElement> } props
 * @returns {JSX.Element}
 */
export const FloatingButton = ({ props }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial position
  const isUp = useRef(true);
  const dontClick = useRef(false);

  useLayoutEffect(() => {
    const moveCallback = (ev) => {
      if (isUp.current) return;
      ev.preventDefault();
      ev.stopPropagation();
      setPosition({
        x: ev.clientX - 20,
        y: ev.clientY - 20,
      });
    };

    const upCallback = (ev) => {
      isUp.current = true;
      dontClick.current = true;
    };

    window.addEventListener("mousemove", moveCallback);
    window.addEventListener("mouseup", upCallback);
    return () => {
      window.removeEventListener("mousemove", moveCallback);
      window.removeEventListener("mouseup", upCallback);
    };
  }, []);

  return (
    <button
      {...props}
      onMouseDown={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        isUp.current = false;
      }}
      onMouseUp={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        isUp.current = true;
        dontClick.current = true;
      }}
      onClick={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (dontClick.current) {
            dontClick.current = false;
            console.log('whaaaaaaaaaaat?' , dontClick.current);
            
          return;
        }
        console.log(isUp.current);

        addClickClass(ev.currentTarget, "click");
        props?.onClick?.(ev);
      }}
      style={{
        top: position.y,
        left: position.x,
      }}
      className="w-[60px] h-[60px] rounded-full z-50 flex justify-center items-center  fixed  bg-blue-600  shadow-lg  shadow-slate-900"
    >
      {Icons.visible({ fill: "white", strokeColor: "white" })}
    </button>
  );
};
