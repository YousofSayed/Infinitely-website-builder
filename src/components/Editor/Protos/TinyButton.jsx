import React from "react";
import { addClickClass } from "../../../helpers/cocktail";

/**
 * 
 * @param {{className:string , onClick : (ev:MouseEvent)=>void , title:string}} param0 
 * @returns 
 */
export const TinyButton = ({children , className , onClick , title=''}) => {
  return (
    <button
    aria-label={title}
    title={title}
    className={`w-[35px] h-[35px] hover:bg-blue-600 outline-none border-2 border-transparent focus:border-blue-600 transition-colors flex justify-center items-center rounded-lg ${className? className : 'bg-gray-950'}`} 
        onClick={(ev)=>{
            addClickClass(ev.currentTarget , 'click');
            onClick(ev)
        }}
    >
        {children}
    </button>
  );
};
