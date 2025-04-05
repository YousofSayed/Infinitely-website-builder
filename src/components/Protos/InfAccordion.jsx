import { Accordion } from "@heroui/accordion";
import React, { memo } from "react";

export const InfAccordion = ({ children }) => {
  console.log('ch : ' , children);
  
  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        trigger: "flex items-center justify-between ",
        base: "bg-slate-800 p-3  rounded-lg text-slate-200 font-semibold",
        content: `bg-slate-900 p-[unset!important] mt-2 rounded-md`,
        title: `capitalize`,
        indicator: `text-[18px] transition-all`,
      }}
    >
      {children}
    </Accordion>
  );
};
