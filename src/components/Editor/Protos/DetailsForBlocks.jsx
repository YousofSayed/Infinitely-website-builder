import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Details } from "./Details";
import { refType } from "../../../helpers/jsDocs";
import { InfAccordion } from "../../Protos/InfAccordion";
import { Accordion, AccordionItem } from "@heroui/accordion";

/**
 *
 * @param {{label : string , HTMLChildren : HTMLElement[]}} param0
 * @returns
 */
export const DetailsForBlocks = memo(({ label, HTMLChildren }) => {
  const [isShow, setIsShow] = useState(false);
  const blocksContainerRef = useRef(refType);

  useLayoutEffect(() => {
    if (!blocksContainerRef.current) return;

    blocksContainerRef.current.innerHTML = "";
    if (!isShow) {
      blocksContainerRef.current.innerHTML = "";
    } else {
    }
    const fragment = document.createDocumentFragment();

    HTMLChildren.forEach((HTMLChild) => {
      fragment.appendChild(HTMLChild);
    });
    blocksContainerRef.current.appendChild(fragment);
    console.log("should blocks done : ", blocksContainerRef.current, fragment);
  }, [isShow, HTMLChildren]);

  return (
    // <AccordionItem title={label} setIsShow={setIsShow}>
    <section
      id={label}
      ref={blocksContainerRef}
      className="mt-3 grid custom-grid-col p-2 "
    ></section>
    // </AccordionItem>
  );
});
