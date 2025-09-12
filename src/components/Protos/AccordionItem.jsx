import React, { memo } from "react";
import { DetailsNormal } from "./DetailsNormal";
import { random, uniqueId } from "lodash";
// import {AccordionItem as RadixAccordionItem , AccordionHeader , AccordionContent} from '@radix-ui/react-accordion'

// million-ignore
export const AccordionItem = memo(({
  label,
  title,
  allowPopupLength = false,
  length,
  children,
}) => {
  return (
    <DetailsNormal 
      label={label || title}
      allowPopupLength={allowPopupLength}
      length={length}
      mode="accordion"
      id={uniqueId(`accordion-${random(9999, 100000)}`)}
    >
      {children}
    </DetailsNormal>
    // <RadixAccordionItem className="bg-blue-600">
    //   <AccordionHeader>{label || title}</AccordionHeader>
    //   <AccordionContent>{children}</AccordionContent>
    // </RadixAccordionItem>
  );
});

// import * as AccordionPrimitive from "@radix-ui/react-accordion";
// import React from "react";
// export const AccordionItem = ({ value, title, children }) => {
//   return (
//     <AccordionPrimitive.Item value={value} className="border-b">
//       <AccordionPrimitive.Header className="flex">
//         <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between py-4 text-left font-medium text-gray-800 hover:underline">
//           {title}
//           {/* <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" /> */}
//         </AccordionPrimitive.Trigger>
//       </AccordionPrimitive.Header>
//       <AccordionPrimitive.Content className="overflow-hidden text-sm text-gray-600 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
//         <div className="pb-4 pt-0 px-2">{children}</div>
//       </AccordionPrimitive.Content>
//     </AccordionPrimitive.Item>
//   );
// };