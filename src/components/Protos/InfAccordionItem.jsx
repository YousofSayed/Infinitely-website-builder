// NOTE: "@heroui/accordion" was never an installed dependency (not in package.json). Swapped to
// this project's own local AccordionItem. CAVEAT: this component isn't imported anywhere else in
// the codebase currently, and the local AccordionItem's props (label/title/notify/etc.) differ
// from what this file assumes - review before using.
import { AccordionItem } from "@/components/Protos/AccordionItem";
import React, { memo } from "react";

export const InfAccordionItem = ({ children, title }) => {
  return (
    <AccordionItem
      // key={key}
      title={title}
      // children={children}
      // content={children}
      // slotProps={{ transition: { unmountOnExit: true } }}
/>
  );
};
