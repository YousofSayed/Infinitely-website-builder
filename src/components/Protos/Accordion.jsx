import React from 'react'
import { AccordionProvider } from '@/components/Protos/DetailsNormal'
// import {Accordion as RadixAccordion , Root}from '@radix-ui/react-accordion'
export const Accordion = ({children}) => {
  return (
    <AccordionProvider>
        {children}
    </AccordionProvider>
    // <RadixAccordion>
    //   {children}
    // </RadixAccordion> 
  )
}
// import * as AccordionPrimitive from "@radix-ui/react-accordion";

// 
// export const Accordion = ({ children }) => {
//   return (
//     <AccordionPrimitive.Root type="single" collapsible className="w-full">
//       {children}
//     </AccordionPrimitive.Root>
//   );
// };
