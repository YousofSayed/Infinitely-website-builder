// NOTE: "@heroui/accordion" was never an installed dependency (not in package.json) - this is a
// leftover/incorrect import. Swapped to this project's own local Accordion/AccordionItem components.
// CAVEAT: the local components do NOT support the variant/itemClasses styling props used below -
// those props will be silently ignored, which will change this component's visual appearance.
import { Accordion } from "@/components/Protos/Accordion";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import React, { memo } from "react";

export const InfAccordion = ({attributes = {} , children }) => {
  // console.log('is instance ????' , children instanceof AccordionItem, children) ;
  
  return (
    // children
    <Accordion
      variant="splitted"
      // keepContentMounted
        {...attributes}
      itemClasses={{
        trigger: "flex items-center justify-[between!important] text-[start!important] [&_div]:text-start p-[unset!important]",
        base: "bg-surface-tertiary p-3  rounded-lg text-text-primary font-semibold relative ",
        content: `bg-surface-secondary p-[unset!important] mt-2 rounded-md will-change-[height,width]`,
        title: `capitalize custom-font-size`,
        indicator: `text-[18px] transition-all`,
      }}
    >
      {children}
    </Accordion>
  );
};
