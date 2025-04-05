import React from "react";
import { addClickClass } from "../../helpers/cocktail";

export const Button = ({ children , title , type = 'button'  , className = "py-2 h-full  px-4  font-bold", onClick = ()=>{} }) => {
  return (
    <button
    title={title}
    type={type}
      className={`bg-blue-600 rounded-lg flex gap-2 items-center ${className} text-nowrap text-white text-[14px]`}
      onClick={(ev) => {
        addClickClass(ev.currentTarget, "click");
        onClick(ev); 
      }}
    >
      {children} 
    </button>
  );
};
