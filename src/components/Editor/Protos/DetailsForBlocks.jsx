import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Details } from "./Details";
import { refType } from "../../../helpers/jsDocs";

/**
 *
 * @param {{label : string , HTMLChildren : HTMLElement[]}} param0
 * @returns
 */
export const DetailsForBlocks = (({ label, HTMLChildren }) => {
  const [isShow, setIsShow] = useState(false);
  const blocksContainerRef = useRef(refType);

  useLayoutEffect(() => {
    if (!blocksContainerRef.current) return;
    blocksContainerRef.current.querySelectorAll(`*`).forEach(el=>el.remove());
    blocksContainerRef.current.innerHTML = "";
    if (!isShow) {
      blocksContainerRef.current.querySelectorAll(`*`).forEach(el=>el.remove());
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
      className=" grid custom-grid-col p-2 bg-slate-900 rounded-lg"
    ></section>
    // </AccordionItem>
  );
});
