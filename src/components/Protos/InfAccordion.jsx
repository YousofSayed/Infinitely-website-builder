import { Accordion } from "@heroui/accordion";
import React, { memo } from "react";

export const InfAccordion = ({attributes = {} , children }) => {
  
  return (
    <Accordion
      variant="splitted"
      // keepContentMounted
        {...attributes}
      itemClasses={{
        trigger: "flex items-center justify-between ",
        base: "bg-slate-800 p-3  rounded-lg text-slate-200 font-semibold relative ",
        content: `bg-slate-900 p-[unset!important] mt-2 rounded-md will-change-[height,width]`,
        title: `capitalize custom-font-size`,
        indicator: `text-[18px] transition-all`,
      }}
    >
      {children}
    </Accordion>
  );
};
