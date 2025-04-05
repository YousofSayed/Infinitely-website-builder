import React from "react";

export const DetailsNormal = ({ children, label, className = ""  ,  allowPopupLength = false, length}) => {
  return (
   <section  className={`
    relative
    focus:outline-none focus:border-none 
    ${
    className ? className : "p-2 bg-slate-800 w-full rounded-lg select-none "
  }`}>
     <details
     
    > 
      <summary className="text-slate-200 capitalize text-[16px] focus:outline-none focus:border-none">{label}</summary>
      {children ? children : "Nothing Here..."}
    </details>
      {allowPopupLength && !!length &&<p className="w-[25px] h-[25px] bg-blue-500 text-slate-200 flex justify-center items-center font-semibold rounded-full absolute right-[2px] top-0 ">{length}</p>}
   </section>
  ); 
};
