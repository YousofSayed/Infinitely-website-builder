import React from "react";

export const P = ({ children , className = "text-slate-300 break-all capitalize custom-font-size w-fit font-bold  mr-2"}) => {
  return (
    <p className={className}>
      {children}
    </p>
  );
};
