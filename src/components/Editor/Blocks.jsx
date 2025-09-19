import React, { memo, useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { blocksStt, editorBlocksType } from "../../helpers/atoms";
import { DetailsForBlocks } from "./Protos/DetailsForBlocks";
import { useEditorMaybe } from "@grapesjs/react";
import {
  advancedSearchSuggestions,
  getProjectData,
  handleCustomBlock,
} from "../../helpers/functions";
import { html } from "../../helpers/cocktail";
// import { InfAccordion } from "../Protos/InfAccordion";
// import { AccordionItem } from "@heroui/accordion";
import { Input } from "./Protos/Input";
import { SearchHeader } from "../Protos/SearchHeader";
import { blocksType, blockType } from "../../helpers/jsDocs";
import { opfs } from "../../helpers/initOpfs";
import { defineRoot } from "../../helpers/bridge";
import { Accordion } from "../Protos/Accordion";
import { AccordionItem } from "../Protos/AccordionItem";

export const Blocks = memo(() => {
  const editor = useEditorMaybe();
  const blocksAtom = useRecoilValue(blocksStt);
  const setBlocks = useSetRecoilState(blocksStt);
  const blocksRef = useRef(editorBlocksType);
  const allBlocksAsObject = useRef(blockType);

  useEffect(() => {
    if (!editor || !editor.Blocks) {
      console.log(editor);
      return;
    }

    editor.on("block:add", callback);
    // editor.on("block:add", callback);

    return () => {
      editor.off("block:add", callback);
      // editor.off("block:add", callback);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    console.log("yyyyyyyyyyyyyyyaaaaaaaaaaaaaaaaaaaaaaaa");

    callback();
  }, [editor]);

  const callback = async () => {
    console.log("editor from callback : ", editor);

    const blocks = await Promise.all(
      Object.values(await (await getProjectData()).blocks).map(
        async (block) => {
          console.log("block : ", block);

          block.media instanceof Blob &&
            (block.media = html`
              <img src="${URL.createObjectURL(block.media)}" />
            `);
          block.content instanceof Blob &&
            (block.content = await block.content.text());

          if (block?.pathes) {
            block.content = await (
              await opfs.getFile(defineRoot(block.pathes.content))
            ).text();

            
            // block.style = await (
              //   await opfs.getFile(defineRoot(block.pathes.style))
              // ).text();
            } 
            // console.log('block style : ' , block.style);
            console.log('block : ' , block);
          
          return block; 
        }
      )
    );
    const editorBlocks = editor.Blocks.getAll().models.map(
      (block) => block.attributes
    );
    const allBlocks = [...editorBlocks, ...blocks];
    allBlocksAsObject.current = allBlocks;
    const handledBlocks = handleCustomBlock(allBlocks, editor);
    console.log("update blocks : ", handledBlocks);
    // editor.BlockManager.add('sda',{
      
    // })
    setBlocks((old) => ({
      ...handledBlocks,
    }));
    blocksRef.current = handledBlocks;
  };

  const search = (value = "") => {
    const newBlocks = advancedSearchSuggestions(
      allBlocksAsObject.current,
      value,
      false,
      ["category", "name", "id", "label"]
    );
    setBlocks(handleCustomBlock(newBlocks, editor));
    // console.log();

    // const targetedBlocks = Object.fromEntries(
    //   Object.entries(blocksAtom).filter(([key, blocks]) => {
    //     return (
    //       key.includes(value) || blocks.some((block) => block.name.includes)
    //     );
    //   })
    // );
  };

  return (
    <section className="flex flex-col gap-2 h-full w-full">
      <SearchHeader search={search}  />
      <Accordion>
        {Object.keys(blocksAtom).map((ctg, i) => {
          return (
            <AccordionItem title={ctg} key={i}>
              <DetailsForBlocks
                // key={i}
                // label={ctg}
                HTMLChildren={blocksAtom[ctg]}
              />
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
});
