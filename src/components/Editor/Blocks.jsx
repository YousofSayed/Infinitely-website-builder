import { current_project_id } from "@/constants/shared";
import {
  _blocksCachedState,
  _symbolsCachedState,
  blocksCached,
  symbolsCached,
} from "@/constants/windowKeys";
import { blocksStt, editorBlocksType } from "@/helpers/atoms";
import { defineRoot } from "@/helpers/bridge";
import { addClickClass, html } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  offlineInstallerWorker,
  pageBuilderWorker,
} from "@/helpers/defineWorkers";
import {
  advancedSearchSuggestions,
  doInNormal,
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
import { cloneDeep, isArray, isPlainObject } from "lodash";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { usePosts } from "@/queries/wp.queries";
import { useWordpress } from "@/hooks/useWordpress";
import { ShowIf } from "@/components/ShowIf";
import { useQueryClient } from "@tanstack/react-query";
import { useNormal } from "@/hooks/useNormal";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { Icons } from "../Icons/Icons";
import { Wordpress } from "../Protos/wordpress/Wordpress";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";

export const Blocks = () => {
  const editor = useEditorMaybe();
  const [blocksAtom, setBlocks] = useRecoilState(blocksStt);
  const blocksRef = useRef(editorBlocksType);
  const allBlocksAsObject = useRef(blockType);
  const [loading, setLoading] = useState(false);
  const [animatedRef] = useAutoAnimate();
  const qc = useQueryClient();
  const [isSymbolsNeedReload, setIsSymbolsNeedReload] = useState(false);
  const [animatedRefForHeader] = useAutoAnimate();

  const {
    data: wpSymbols,
    isPending: isWpSymbolsLoading,
    isFetching: isWpSymbolsFetching,
  } = usePosts("inf_symbols");

  const {
    data: wpTemplates,
    isPending: isWpTemplatesLoading,
    isFetching: isWpTemplatesFetching,
  } = usePosts("inf_blocks");

  // 1. MOVED UP: Define callback early so it can be used synchronously in useRef/useEffect
  const callback = useCallback(async () => {
    console.log("editor from callback : ", editor);
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

            if (block?.pathes) {
              block.content = await (
                await opfs.getFile(defineRoot(block.pathes.content))
              ).text();
            }
            console.log("block : ", block);

            return block;
          },
        ),
      );
    });

    const editorBlocks = editor.Blocks.getAll().models.map((block) => {
      const attrs = block.attributes;
      return cloneDeep({
        ...attrs,
        category:
          attrs.category && typeof attrs.category === "object"
            ? attrs.category.id
            : attrs.category,
      });
    });

    await doInWordpressAsync(async () => {
      const projectData = await getProjectData();
      console.log("wpSymbols:", wpSymbols);
      const files = [];

      if (wpSymbols?.data) {
        let symbol_state;
        for (const block of wpSymbols.data) {
          const blockMeta = block?.meta?.inf_meta;
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

          blocks.push(blockData);
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

      if (wpTemplates?.data) {
        for (const block of wpTemplates.data) {
          const blockMeta = block?.meta?.inf_meta;
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

          console.log(
            block,
            " blockData ",
            blockData,
            blocklId,
            "****",
            projectData.currentEditingPage.save_state,
          );
          blocks.push(blockData);
        }
      }

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
    });

    const allBlocks = [...editorBlocks, ...blocks];
    const blocksByCategory = {};
    for (const block of cloneDeep(allBlocks)) {
      const ctg = block?.category?.id || block.category || "uncategorized";
      if (!blocksByCategory[ctg]) blocksByCategory[ctg] = [];
      blocksByCategory[ctg].push(block);
    }

    allBlocksAsObject.current = blocksByCategory;
    setBlocks(cloneDeep(blocksByCategory));
    blocksRef.current = cloneDeep(blocksByCategory);
  }, [editor, wpSymbols, wpTemplates]);

  // 2. FIX: Keep a mutable ref to the latest callback to solve stale closures
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 3. FIX: Use callbackRef so GrapesJS events always process the newest data
  useNormal(() => {
    if (!editor || !editor.Blocks) {
      console.log(editor);
      return;
    }

    const stableCallback = (...args) => callbackRef.current(...args);

    stableCallback();

    editor.on("block:add", stableCallback);
    editor.on("block:update", stableCallback);

    return () => {
      editor.off("block:add", stableCallback);
      editor.off("block:update", stableCallback);
    };
  }, [editor]);

  // 4. FIX: Added wpTemplates dependencies to ensure it triggers when templates finish loading
  useWordpress(() => {
    if (!editor) return;
    if (
      isWpSymbolsLoading ||
      isWpSymbolsFetching ||
      isWpTemplatesLoading ||
      isWpTemplatesFetching
    ) {
      editor.trigger(InfinitelyEvents.blocks.remove_wp_symbols);
    } else {
      editor.trigger(InfinitelyEvents.blocks.restore_wp_symbols);
    }
  }, [
    editor,
    wpSymbols,
    wpTemplates,
    isWpSymbolsLoading,
    isWpSymbolsFetching,
    isWpTemplatesLoading,
    isWpTemplatesFetching,
  ]);

  // 5. FIX: Use callbackRef and REMOVE data dependencies to prevent effect race conditions
  useWordpress(() => {
    if (!editor) return;
    const hideSymbolsNow = () => {
      setBlocks((old) => {
        const clone = cloneDeep(old);
        delete clone.symbols;
        return clone;
      });
      setLoading(true); 
    };

    const restoreSymbolsNow = async () => {
      console.log("Restoring Symbols Blocks 🍕");
      await callbackRef.current();
      setLoading(false);
      setIsSymbolsNeedReload(false);
    };

    const symbolReloadHandler = ({ state }) => {
      setIsSymbolsNeedReload(state);
    };

    editor.on(InfinitelyEvents.blocks.remove_wp_symbols, hideSymbolsNow);
    editor.on(InfinitelyEvents.blocks.restore_wp_symbols, restoreSymbolsNow);
    editor.on(InfinitelyEvents.blocks.symbols_need_reload, symbolReloadHandler);

    return () => {
      editor.off(InfinitelyEvents.blocks.remove_wp_symbols, hideSymbolsNow);
      editor.off(InfinitelyEvents.blocks.restore_wp_symbols, restoreSymbolsNow);
      editor.off(
        InfinitelyEvents.blocks.symbols_need_reload,
        symbolReloadHandler,
      );
    };
  }, [editor]); // Only depends on editor now, eliminating the race condition

  const reloadSymbols = async () => {
    const tid = toast.loading(<ToastMsgInfo msg={`Reloading blocks...`} />);
    try {
      await doInWordpressAsync(async () => {
        await qc.invalidateQueries({
          queryKey: ["inf_symbols"],
          refetchType: "all",
        });
      });

      setIsSymbolsNeedReload(false);
      toast.done(tid);
      toast.success(<ToastMsgInfo msg={`Blocks reloaded successfully 💙`} />);
    } catch (error) {
      toast.dismiss(tid);
      toast.error(<ToastMsgInfo msg={`Faild to reload blocks 😥`} />);
      setIsSymbolsNeedReload(true);
      throw error;
    }
  };

  const search = (value = "") => {
    const newBlocks = advancedSearchSuggestions(
      allBlocksAsObject.current,
      value,
      false,
      ["category", "name", "id", "label"],
    );
    setBlocks(newBlocks);
  };

  return (
    <section ref={animatedRef} className="flex flex-col gap-2 h-full w-full ">
      <header className="w-full relative" ref={animatedRefForHeader}>
        <SearchHeader search={search} />
        <Wordpress>
          <i
            role="button"
            style={{
              opacity: isSymbolsNeedReload ? "1" : ".6",
              pointerEvents: isSymbolsNeedReload ? "auto" : "none",
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 [&_path]:stroke-[2.5px] [&_svg]:w-5 [&_svg]:h-5 cursor-pointer"
            onClick={async (e) => {
              addClickClass(e.currentTarget, "click");
              await reloadSymbols();
            }}
          >
            <Icons.refresh />
            {isSymbolsNeedReload && (
              <span className="block absolute -right-1 -top-1  w-3 h-3 bg-[crimson] rounded-full"></span>
            )}
          </i>
        </Wordpress>
      </header>

      <Accordion>
        <ShowIf condition={Object.keys(blocksAtom).length}>
          {Object.keys(blocksAtom).map((ctg, i) => {
            return (
              <AccordionItem title={ctg} key={i}>
                <ShowIf condition={blocksAtom[ctg]?.length}>
                  <DetailsForBlocks blocks={blocksAtom[ctg]} />
                </ShowIf>
              </AccordionItem>
            );
          })}
        </ShowIf>
      </Accordion>

      <ShowIf
        condition={
          loading ||
          isWpSymbolsLoading ||
          isWpSymbolsFetching ||
          isWpTemplatesLoading ||
          isWpTemplatesFetching
        }
      >
        <section className="mt-3">
          <Loader width={30} height={30} />
        </section>
      </ShowIf>
    </section>
  );
};
