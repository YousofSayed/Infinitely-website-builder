import React, { memo, useState } from "react";
import { DetailsNormal } from "@/components/Protos/DetailsNormal";
import { random, uniqueId } from "lodash";

// million-ignore
export const AccordionItem = memo(
  ({
    label,
    title,
    allowPopupLength = false,
    length,
    children,
    notify,
    notifyBg = "bg-brand-primary",
    onSwitch = (state) => {},
  }) => {
    // Generated ONCE per mounted instance, not on every render — a fresh
    // random id every render desyncs the openId comparison in DetailsNormal
    // (toggle() stores the id from click time; a later render regenerates a
    // different one, so the "is this the open item" check stops matching
    // and the item silently collapses on unrelated re-renders).
    const [id] = useState(() => uniqueId(`accordion-${random(9999, 100000)}`));

    return (
      <DetailsNormal
        label={label || title}
        allowPopupLength={allowPopupLength}
        length={length}
        mode="accordion"
        notify={notify}
        notifyBg={notifyBg}
        onSwitch={onSwitch}
        id={id}
      >
        {children}
      </DetailsNormal>
    );
  },
);

// import React, { memo } from "react";
// import { DetailsNormal } from "@/components/Protos/DetailsNormal";
// import { random, uniqueId } from "lodash";
// // import {AccordionItem as RadixAccordionItem , AccordionHeader , AccordionContent} from '@radix-ui/react-accordion'

// // million-ignore
// export const AccordionItem = memo(
//   ({
//     label,
//     title,
//     allowPopupLength = false,
//     length,
//     children,
//     notify,
//     notifyBg = "bg-brand-primary",
//     onSwitch = (state) => {},
//   }) => {
//     return (
//       <DetailsNormal
//         label={label || title}
//         allowPopupLength={allowPopupLength}
//         length={length}
//         mode="accordion"
//         notify={notify}
//         notifyBg={notifyBg}
//         onSwitch={onSwitch}
//         id={uniqueId(`accordion-${random(9999, 100000)}`)}
//       >
//         {children}
//       </DetailsNormal>
//     );
//   }
// );
