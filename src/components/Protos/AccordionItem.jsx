import React, { memo } from "react";
import { DetailsNormal } from "./DetailsNormal";
import { random, uniqueId } from "lodash";
// import {AccordionItem as RadixAccordionItem , AccordionHeader , AccordionContent} from '@radix-ui/react-accordion'

// million-ignore
export const AccordionItem = memo(
  ({
    label,
    title,
    allowPopupLength = false,
    length,
    children,
    notify,
    notifyBg = "bg-blue-600",
    onSwitch = (state) => {},
  }) => {
    return (
      <DetailsNormal
        label={label || title}
        allowPopupLength={allowPopupLength}
        length={length}
        mode="accordion"
        notify={notify}
        notifyBg={notifyBg}
        onSwitch={onSwitch}
        id={uniqueId(`accordion-${random(9999, 100000)}`)}
      >
        {children}
      </DetailsNormal>
    );
  }
);
