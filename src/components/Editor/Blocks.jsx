import { current_project_id } from "@/constants/shared";
import {
  _blocksCachedState,
  _symbolsCachedState,
  blocksCached,
  symbolsCached,
} from "@/constants/windowKeys";
import { blocksStt, editorBlocksType } from "@/helpers/atoms";
import { defineRoot } from "@/helpers/bridge";
import { html } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  offlineInstallerWorker,
  pageBuilderWorker,
} from "@/helpers/defineWorkers";
import {
  advancedSearchSuggestions,
  doInNormalAsync,
  doInWordpressAsync,
  getProjectData,
  handleCustomBlock,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { blocksType, blockType } from "@/helpers/jsDocs";
import { Loader } from "@/components/Loader";
import { Accordion } from "@/components/Protos/Accordion";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import { InfAccordion } from "@/components/Protos/InfAccordion";
import { SearchHeader } from "@/components/Protos/SearchHeader";
import { DetailsForBlocks } from "@/components/Editor/Protos/DetailsForBlocks";
import { Input } from "@/components/Editor/Protos/Input";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditorMaybe } from "@grapesjs/react";
import { isArray, isPlainObject } from "lodash";
import React, { memo, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { usePosts } from "@/queries/wp.queries";
import { useWordpress } from "@/hooks/useWordpress";
import { ShowIf } from "@/components/ShowIf";

//
//

export const Blocks = () => {
  const editor = useEditorMaybe();
  const [blocksAtom, setBlocks] = useRecoilState(blocksStt);
  const blocksRef = useRef(editorBlocksType);
  const allBlocksAsObject = useRef(blockType);
  const [loading, setLoading] = useState(false);
  const [animatedRef] = useAutoAnimate();
  const {
    data: wpSymbols,
    isLoading: isWpSymbolsLoading,
    isRefetching: isWpSymbolsFetching,
  } = usePosts("inf_symbols");

  const {
    data: wpTemplates,
    isLoading: isWpTemplatesLoading,
    isRefetching: isWpTemplatesFetching,
  } = usePosts("inf_blocks");

  useEffect(() => {
    if (!editor || !editor.Blocks) {
      console.log(editor);
      return;
    }

    editor.on("block:add", callback);
    editor.on("block:update", callback);

    return () => {
      editor.off("block:add", callback);
      editor.off("block:update", callback);
      // editor.off("block:add", callback);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    // console.log("yyyyyyyyyyyyyyyaaaaaaaaaaaaaaaaaaaaaaaa");

    callback();
  }, [editor]);

  useWordpress(() => {
    if (!wpSymbols || !wpTemplates || !editor) return;
    callback();
  }, [editor, wpSymbols, wpTemplates]);

  // useEffect(() => {
  //   if (!editor) return;

  // }, [editor]);

  const callback = async () => {
    console.log("editor from callback : ", editor);
    /**
     * @type {import('@/helpers/types').InfinitelyBlock[]}
     */
    let blocks = [];
    await doInNormalAsync(async () => {
      blocks = await Promise.all(
        Object.values(await (await getProjectData()).blocks).map(
          async (block) => {
            console.log("block : ", block);

            block.media instanceof Blob &&
              (block.media = html`
                <img src="${URL.createObjectURL(block.media)}" />
              `);
            block.content instanceof Blob &&
              (block.content = await block.content.text());

            // block.style instanceof Blob &&
            // (block.style = await block.style.text());

            // block.style && editor.Css.addRules(block.style);

            if (block?.pathes) {
              block.content = await (
                await opfs.getFile(defineRoot(block.pathes.content))
              ).text();

              // block.style = await (
              //   await opfs.getFile(defineRoot(block.pathes.style))
              // ).text();
            }
            // console.log('block style : ' , block.style);
            console.log("block : ", block);

            return block;
          },
        ),
      );
    });

    const editorBlocks = editor.Blocks.getAll().models.map(
      (block) => block.attributes,
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

    const setBlocksHandler = () => {
      const allBlocks = [...editorBlocks, ...blocks];
      const handledBlocks = handleCustomBlock(allBlocks, editor);
      setBlocks((old) => ({
        ...handledBlocks,
      }));
      blocksRef.current = handledBlocks;
    };

    //For Symbols
    await doInWordpressAsync(async () => {
      // setLoading(true);
      const projectData = await getProjectData();
      console.log("wpSymbols:", wpSymbols);

      if (wpSymbols?.data) {
        const files = [];
        let symbol_state;
        for (const block of wpSymbols.data) {
          const blockMeta = block?.meta?.inf_meta;
          // blockMeta[projectData.currentEditingPage.save_state] ||
          const current_save_state = isPlainObject(blockMeta.before_save)
            ? "before_save"
            : "saved";
          symbol_state =
            symbol_state === "before_save" ? symbol_state : current_save_state;
          const blockData = blockMeta[current_save_state] || null;
          const symbolId = block?.meta?.["inf-symbol-id"];
          if (!blockData) {
            console.warn(`Block data not founded for ${block}!`);
            continue;
          }

          blockData.content = blockData.html;
          blockData.name = block.slug;
          blockData.title = block.slug;
          blockData.label = block.slug;
          blockData.type = "symbol";
          blockData.category = blockData.category || "symbols";
          blockData.media = blockData.media || "";
          files.push(
            {
              path: defineRoot(`temp/symbols/${symbolId}/html.json`),
              content: JSON.stringify(blockData.html),
            },
            {
              path: defineRoot(`temp/symbols/${symbolId}/style.css`),
              content: blockData.css,
            },
            {
              path: defineRoot(`temp/symbols/${symbolId}/config.json`),
              content: JSON.stringify({
                ...blockData,
              }),
            },
          );

          wpWorkerCallbackMaker(
            offlineInstallerWorker,
            "writeFilesToOPFS",
            {
              files,
            },
            (props) => {
              console.log("file writing response", props);
            },
          );
          console.log(
            block,
            " blockData ",
            blockData,
            symbolId,
            "****",
            projectData.currentEditingPage.save_state,
          );
          blocks.push(blockData);
          setBlocksHandler();
        }

        console.log("symbol_state : ", symbol_state);

        symbol_state &&
          (await db.projects.update(projectData.id, {
            currentEditingPage: {
              ...projectData.currentEditingPage,
              save_state: symbol_state,
              need_publish_to_wp: true,
            },
          }));
        window[_symbolsCachedState] = true;
      }

      // if (!window[_symbolsCachedState]) {
      //   wpWorkerCallbackMaker(
      //     offlineInstallerWorker,
      //     "wp_get_symbols",
      //     {
      //       projectId: localStorage.getItem(current_project_id),
      //     },
      //     async (props) => {
      //       console.log("symbols res : ", props);
      //       const projectData = await getProjectData();
      //       if (props.done && isArray(props.res.data)) {
      //         setLoading(false);
      //         const files = [];
      //         let symbol_state;
      //         for (const block of props.res.data) {
      //           const blockMeta = block?.meta?.inf_meta;
      //           // blockMeta[projectData.currentEditingPage.save_state] ||
      //           const current_save_state = isPlainObject(blockMeta.before_save)
      //             ? "before_save"
      //             : "saved";
      //           symbol_state =
      //             symbol_state === "before_save"
      //               ? symbol_state
      //               : current_save_state;
      //           const blockData = blockMeta[current_save_state] || null;
      //           const symbolId = block?.meta?.["inf-symbol-id"];
      //           if (!blockData) {
      //             console.warn(`Block data not founded for ${block}!`);
      //             continue;
      //           }

      //           blockData.content = blockData.html;
      //           blockData.name = block.slug;
      //           blockData.title = block.slug;
      //           blockData.label = block.slug;
      //           blockData.type = "symbol";
      //           blockData.category = blockData.category || "symbols";
      //           blockData.media = blockData.media || "";

      //           if (!window[symbolsCached]) {
      //             window[symbolsCached] = new Set();
      //           }

      //           if (!window[symbolsCached].has(symbolId)) {
      //             files.push(
      //               {
      //                 path: defineRoot(`temp/symbols/${symbolId}/html.json`),
      //                 content: JSON.stringify(blockData.html),
      //               },
      //               {
      //                 path: defineRoot(`temp/symbols/${symbolId}/style.css`),
      //                 content: blockData.css,
      //               },
      //               {
      //                 path: defineRoot(`temp/symbols/${symbolId}/config.json`),
      //                 content: JSON.stringify({
      //                   ...blockData,
      //                 }),
      //               },
      //             );
      //           }

      //           window[symbolsCached].add(symbolId);

      //           wpWorkerCallbackMaker(
      //             offlineInstallerWorker,
      //             "writeFilesToOPFS",
      //             {
      //               files,
      //             },
      //             (props) => {
      //               console.log("file writing response", props);
      //             },
      //           );
      //           console.log(
      //             block,
      //             " blockData ",
      //             blockData,
      //             symbolId,
      //             "****",
      //             projectData.currentEditingPage.save_state,
      //           );
      //           blocks.push(blockData);
      //           setBlocksHandler();
      //         }

      //         console.log("symbol_state : ", symbol_state);

      //         symbol_state &&
      //           (await db.projects.update(projectData.id, {
      //             currentEditingPage: {
      //               ...projectData.currentEditingPage,
      //               save_state: symbol_state,
      //               need_publish_to_wp: true,
      //             },
      //           }));
      //         window[_symbolsCachedState] = true;
      //       }
      //     },
      //   );
      // }

      // if (window[_symbolsCachedState]) {
      //   const symbolFolders = await opfs.getAllFolders(
      //     defineRoot(`temp/symbols`),
      //   );

      //   for (const symbolFolder of symbolFolders) {
      //     console.log("folder name : ", symbolFolder.name, symbolFolder.path);
      //     const files = Object.fromEntries(
      //       await Promise.all(
      //         (await opfs.getAllFiles(symbolFolder.path)).map(async (fileH) => {
      //           return [fileH.name, await (await fileH.getOriginFile()).text()];
      //         }),
      //       ),
      //     );
      //     console.log("files : ", files);

      //     const block = {
      //       ...JSON.parse(files["config.json"]),
      //       content: JSON.parse(files["html.json"]),
      //     };

      //     blocks.push(block);
      //   }

      //   setLoading(false);
      //   setBlocksHandler();
      // }

      if (wpTemplates?.data) {
        const files = [];
        for (const block of wpTemplates.data) {
          const blockMeta = block?.meta?.inf_meta;
          // blockMeta[projectData.currentEditingPage.save_state] ||
          const current_save_state = "saved";

          const blockData = blockMeta[current_save_state] || null;
          const blocklId = block?.meta?.["inf-template-id"];
          if (!blockData) {
            console.warn(`Block data not founded for ${block}!`);
            continue;
          }

          blockData.content = blockData.html;
          blockData.name = block.slug;
          blockData.title = block.slug;
          blockData.label = block.slug;
          blockData.type = "template";
          blockData.category = blockData.category || "templates";
          blockData.media = blockData.media || "";

          files.push(
            {
              path: defineRoot(`temp/templates/${blocklId}/html.json`),
              content: JSON.stringify(blockData.html),
            },
            {
              path: defineRoot(`temp/templates/${blocklId}/style.css`),
              content: blockData.css,
            },
            {
              path: defineRoot(`temp/templates/${blocklId}/config.json`),
              content: JSON.stringify({
                ...blockData,
              }),
            },
          );

          wpWorkerCallbackMaker(
            pageBuilderWorker,
            "writeFilesToOPFS",
            {
              files,
            },
            (props) => {
              console.log("file writing response", props);
            },
          );

          console.log(
            block,
            " blockData ",
            blockData,
            blocklId,
            "****",
            projectData.currentEditingPage.save_state,
          );
          blocks.push(blockData);
          setBlocksHandler();
        }
      }
    });

    //For Blocks
    // await doInWordpressAsync(async () => {
    //   // setLoading(true);

    //   if (!window[_blocksCachedState]) {
    //     wpWorkerCallbackMaker(
    //       pageBuilderWorker,
    //       "wp_get_blocks",
    //       {
    //         projectId: +localStorage.getItem(current_project_id),
    //       },
    //       async (props) => {
    //         console.log("blocks res : ", props);
    //         const projectData = await getProjectData();
    //         if (props.done && isArray(props.res.data)) {
    //           setLoading(false);
    //           const files = [];
    //           for (const block of props.res.data) {
    //             const blockMeta = block?.meta?.inf_meta;
    //             // blockMeta[projectData.currentEditingPage.save_state] ||
    //             const current_save_state = "saved";

    //             const blockData = blockMeta[current_save_state] || null;
    //             const blocklId = block?.meta?.["inf-template-id"];
    //             if (!blockData) {
    //               console.warn(`Block data not founded for ${block}!`);
    //               continue;
    //             }

    //             // block.featured_image
    //             // instanceof Blob &&
    //             // (block.media = html`
    //             //   <img src="${URL.createObjectURL(block.featured_image
    //             //   )}" />
    //             // `);

    //             blockData.content = blockData.html;
    //             blockData.name = block.slug;
    //             blockData.title = block.slug;
    //             blockData.label = block.slug;
    //             blockData.type = "template";
    //             blockData.category = blockData.category || "templates";
    //             blockData.media = blockData.media || "";

    //             if (!window[blocksCached]) {
    //               window[blocksCached] = new Set();
    //             }

    //             if (!window[blocksCached].has(blocklId)) {
    //               files.push(
    //                 {
    //                   path: defineRoot(`temp/templates/${blocklId}/html.json`),
    //                   content: JSON.stringify(blockData.html),
    //                 },
    //                 {
    //                   path: defineRoot(`temp/templates/${blocklId}/style.css`),
    //                   content: blockData.css,
    //                 },
    //                 {
    //                   path: defineRoot(
    //                     `temp/templates/${blocklId}/config.json`,
    //                   ),
    //                   content: JSON.stringify({
    //                     ...blockData,
    //                   }),
    //                 },
    //               );
    //             }

    //             window[blocksCached].add(blocklId);

    //             wpWorkerCallbackMaker(
    //               pageBuilderWorker,
    //               "writeFilesToOPFS",
    //               {
    //                 files,
    //               },
    //               (props) => {
    //                 console.log("file writing response", props);
    //               },
    //             );
    //             console.log(
    //               block,
    //               " blockData ",
    //               blockData,
    //               blocklId,
    //               "****",
    //               projectData.currentEditingPage.save_state,
    //             );
    //             blocks.push(blockData);
    //             setBlocksHandler();
    //           }

    //           window[_blocksCachedState] = true;
    //         }
    //       },
    //     );
    //   }

    //   if (window[_blocksCachedState]) {
    //     const blocksFolders = await opfs.getAllFolders(
    //       defineRoot(`temp/templates`),
    //     );

    //     for (const blockFolder of blocksFolders) {
    //       console.log("folder name : ", blockFolder.name, blockFolder.path);
    //       const files = Object.fromEntries(
    //         await Promise.all(
    //           (await opfs.getAllFiles(blockFolder.path)).map(async (fileH) => {
    //             return [fileH.name, await (await fileH.getOriginFile()).text()];
    //           }),
    //         ),
    //       );
    //       console.log("files : ", files);

    //       const block = {
    //         ...JSON.parse(files["config.json"]),
    //         content: JSON.parse(files["html.json"]),
    //       };

    //       blocks.push(block);
    //     }

    //     setLoading(false);
    //     setBlocksHandler();
    //   }
    // });
  };

  const search = (value = "") => {
    const newBlocks = advancedSearchSuggestions(
      allBlocksAsObject.current,
      value,
      false,
      ["category", "name", "id", "label"],
    );
    setBlocks(handleCustomBlock(newBlocks, editor));
  };

  return (
    <section ref={animatedRef} className="flex flex-col gap-2 h-full w-full ">
      <SearchHeader search={search} />
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

      <ShowIf
        condition={
          loading ||
          isWpSymbolsLoading ||
          // isWpSymbolsFetching ||
          isWpTemplatesLoading 
          // || isWpTemplatesFetching
        }
      >
        <section className="mt-3">
          <Loader width={60} height={60} />
        </section>
      </ShowIf>
      {/* {(loading ||
        isWpSymbolsLoading ||
        isWpSymbolsFetching ||
        isWpTemplatesLoading ||
        isWpTemplatesFetching) && (
        <section className="mt-3">
          <Loader width={60} height={60} />
        </section>
      )} */}
    </section>
  );
};
