import { refType } from "@/helpers/jsDocs";
import { Details } from "@/components/Editor/Protos/Details";
import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useEditorMaybe } from "@grapesjs/react";
import { cloneDeep } from "lodash";

/**
 *
 * @param {{label : string , blocks : import("@/helpers/types").InfinitelyBlock[]}} param0
 * @returns
 */
export const DetailsForBlocks = (({ label, blocks }) => {
  const [isShow, setIsShow] = useState(false);
  const blocksContainerRef = useRef();
  const editor = useEditorMaybe();

  useEffect(() => {
    if (!blocksContainerRef.current) return;
    if(!editor) return;

    blocksContainerRef.current.querySelectorAll(`*`).forEach(el=>el.remove());
    blocksContainerRef.current.innerHTML = "";

    const fragment = document.createDocumentFragment();
    for (const block of cloneDeep(blocks)) {
      const renderedBlock = editor.Blocks.render(cloneDeep(block), { external: true });
      if (renderedBlock) {
        fragment.appendChild(renderedBlock);
      }
    }

  
    blocksContainerRef.current.appendChild(fragment);
  }, [blocksContainerRef.current , blocks , editor]);



  return (
    // <AccordionItem title={label} setIsShow={setIsShow}>
    <section
      id={label}
      ref={blocksContainerRef}
      className=" grid custom-grid-col p-2 bg-surface-secondary rounded-lg"
    ></section>
    // </AccordionItem>
  );
});
