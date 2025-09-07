import React from "react";
import { generateBeautifulHexColor } from "../../helpers/functions";

export const Hint = ({children}) => {
  return (
    <section
      className="absolute p-2 z-[30] top-[3px]  translate-y-[-50%] left-[-7px] shadow-md  overflow-hidden w-[10px] hover:w-fit h-[10px] hover:h-[40px] text-transparent hover:text-slate-200 transition-all rounded-lg  flex justify-center items-center text-sm font-bold capitalize"
      style={{ background: generateBeautifulHexColor() }}
    >
      {children}
    </section>
  );
};
