import React from "react";

export const NormalTitle = ({ children = ""  , withBorder=false , className = ''}) => {
  return (
    <h1 className={`w-fit capitalize   ${withBorder && 'border-b-2 border-b-slate-600 pr-[60px] py-3'} text-slate-200 text-xl mb-2 font-bold ${className}`}>
      {children}
    </h1>
  );
};
