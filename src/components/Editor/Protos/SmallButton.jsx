import React from "react";
import { addClickClass } from "../../../helpers/cocktail";

/**
 *
 * @param {{onClick : (ev : MouseEvent)=>void , onBlur:(ev:MouseEvent)=>{}, className:string , title:string, children : children}} param0
 * @returns
 */
export const SmallButton = ({
  onClick = (_) => {},
  onBlur = (ev) => {},
  className = "",
  children,
  title = "",
}) => {
  return ( 
    <button
      aria-label={title}
      title={title}
      onBlur={onBlur}
      onClick={(ev) => {
        addClickClass(ev.currentTarget, "click");
        onClick(ev);
      }}
      className={`w-[48px] outline-none border-2 border-transparent focus:border-blue-600 transition-colors   hover:bg-blue-600 flex rounded-lg cursor-pointer items-center justify-center flex-shrink-0  ${
        className ? className : "bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
};

let l = {
  0: {
    color: "",
    opacity: "",
  },
};
