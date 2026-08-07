import { current_project_id } from "@/constants/shared";
import { defineRoot } from "@/helpers/bridge";
import { db } from "@/helpers/db";
import {
  advancedSearchSuggestions,
  doInNormalAsync,
  doInWordpressAsync,
  getProjectData,
  getProjectId,
  restoreBlobs,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { blocksArrayType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { GridComponents } from "@/components/Protos/VirtusoGridComponent";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { SymbolsAndTemplatesHandler } from "@/components/Editor/Protos/SymbolsAndTemplatesHandler";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { For } from "million/react";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid } from "react-virtuoso";
import { useInsertPostsMutation } from "@/queries/wp.queries";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";

export const UploadBlocks = () => {
  const [uploadedBlocks, setUploadedBlocks] = useState(blocksArrayType);
  const allBlocks = useRef(blocksArrayType);
  const projectId = +localStorage.getItem(current_project_id);
  const inputRef = useRef();
  const editor = useEditorMaybe();
  const [type, setType] = useState("");
  const {
    mutate: insertPosts,
    isPending: insertPostsPending,
    isSuccess: insertPostsSuccess,
  } = useInsertPostsMutation(type);

  /**
   *
   * @param {HTMLInputElement} input
   */
  const uploadBlocksCallback = async (input) => {
    /**
     * @type {File}
     */
    const file = input.files[0];
    input.value = "";
    const getType = (arr = []) => [
      ...new Set(arr.filter((block) => block.type).map((block) => block.type)),
    ];
    const validateType = ({ types, symbolType, templateType }) =>
      types.length &&
      types.length < 2 &&
      (types[0] == symbolType || types[0] == templateType);

    await doInNormalAsync(async () => {
      const symbolsOrTemplates = await restoreBlobs(
        JSON.parse((await file.text()) || "{}"),
      );
      const types = getType(symbolsOrTemplates);
      if (
        !validateType({
          types,
          symbolType: "symbol",
          templateType: "template",
        })
      ) {
        toast.error(<ToastMsgInfo msg={"Invalid file"} />);
        input.value = "";
        return;
      }
      setType(types[0]);
      setUploadedBlocks(symbolsOrTemplates);
      allBlocks.current = symbolsOrTemplates;
    });

    await doInWordpressAsync(async () => {
      const symbolsOrTemplates = JSON.parse((await file.text()) || "{}");
      const types = getType(symbolsOrTemplates);
      console.log(
        "types :",
        types,
        validateType({
          types,
          symbolType: "inf_symbols",
          templateType: "inf_blocks",
        }),
      );

      if (
        !validateType({
          types,
          symbolType: "inf_symbols",
          templateType: "inf_blocks",
        })
      ) {
        toast.error(<ToastMsgInfo msg={"Invalid file"} />);
        return;
      }

      for (const symbOrtemp of symbolsOrTemplates) {
        symbOrtemp.name = symbOrtemp.slug;
        symbOrtemp.media = symbOrtemp?.meta?.media;
      }
      setType(types[0]);
      setUploadedBlocks(symbolsOrTemplates);
      allBlocks.current = symbolsOrTemplates;
    });
    input.value = "";
  };

  const saveBlocksToDB = async () => {
    const tid = toast.loading(<ToastMsgInfo msg={`Saving...`} />);
    const afterSave = () => {
      editor.trigger("block:add");
      editor.trigger("block:update");
      toast.done(tid);
      setUploadedBlocks([]);
      toast.success(<ToastMsgInfo msg={`All done👍`} />);
    };

    await doInNormalAsync(async () => {
      const projectData = await getProjectData();
      /**
       * @type {{[key:string]:import('@/helpers/types').InfinitelyBlock}}
       */
      const blocks = {};
      /**
       * @type {{[key:string] : import('@/helpers/types').InfinitelySymbol}}
       */
      const symbols = {};
      await Promise.all(
        uploadedBlocks.map(async (block) => {
          // const restoredBlock = restoreBlobs(block);
          console.log("restored block : ", block);
          await opfs.createFiles([
            {
              path: defineRoot(
                `editor/${block.type}s/${block.id}/${block.id}.html`,
              ),
              content: block.content,
            },
            {
              path: defineRoot(
                `editor/${block.type}s/${block.id}/${block.id}.css`,
              ),
              content: block.style,
            },
          ]);
          editor.Css.addRules(block.style);
          block.content = "";
          block.style = "";

          blocks[block.id] = block;
          if (block.type == "symbol") {
            symbols[`${block.id}`] = block;
          } else {
          }
          return block;
        }),
      );

      console.log(symbols, blocks);

      await db.projects.update(projectId, {
        blocks: {
          ...projectData.blocks,
          ...blocks,
        },
        symbols: {
          ...projectData.symbols,
          ...symbols,
        },
      });
      afterSave();
    });

    await doInWordpressAsync(async () => {
      
       await insertPosts(
        {
          projectId,
          posts: uploadedBlocks.map((block) => ({
            post: {
              post_type: block.type,
              post_title: block.name,
              post_name: block.slug,
              post_status: "publish",
            },
            meta: block.meta,
          })),
        },
        {
          // onSuccess: () => afterSave(),
        },
      );
      afterSave()
    });

    // editor.load();
  };

  const deleteUploadedBlock = (id) => {
    const newArr = uploadedBlocks.filter((block) => block.id != id);
    setUploadedBlocks(newArr);
  };

  const search = (value = "") => {
    if (!value) {
      setUploadedBlocks(allBlocks.current);
      return;
    }

    const filtered = advancedSearchSuggestions(
      allBlocks.current,
      value,
      undefined,
      "name",
    );
    setUploadedBlocks(filtered);
  };

  return (
    <section className="p-1 h-full w-full flex justify-center  flex-col overflow-hidden">
      {!uploadedBlocks.length ? (
        <section className=" flex justify-center items-center flex-col gap-2 p-5 rounded-md ">
          {/* <figure>
            {Icons.upload({ strokeColor: "white", height: 80, width: 80 })}
          </figure> */}
          <Button onClick={() => inputRef.current.click()}>
            {Icons.upload({ strokeColor: "white" })}
            Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            hidden
            onChange={(ev) => {
              uploadBlocksCallback(ev.target);
            }}
          />
        </section>
      ) : (
        <section className="h-full flex flex-col gap-2">
          <header className="flex gap-2 rounded-md">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-surface-tertiary"
              onInput={(ev) => search(ev.target.value)}
            />
            <SmallButton
              disabled={insertPostsPending}
              title={"save blocks"}
              onClick={() => {
                saveBlocksToDB();
              }}
            >
              {Icons.saveData({ fill: "white", height: 17 })}
            </SmallButton>
          </header>
          <section
            className="w-full  grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2 overflow-y-auto hideScrollBar  rounded-lg"
            style={{
              scrollbarGutter: "stable",
            }}
          >
            <For each={uploadedBlocks}>
              {(symbol, i) => (
                <section
                  key={i}
                  className="p-2 pl-[2px!important] bg-surface-tertiary h-[50px] rounded-lg flex justify-between items-center  gap-2"
                >
                  <FitTitle className="flex items-center gap-2 w-full justify-center ">
                    <figure
                      className=" h-full py-2 flex justify-center items-center rounded-lg"
                      dangerouslySetInnerHTML={{ __html: symbol.media }}
                    ></figure>
                    <span
                      style={{ textWrap: "wrap" }}
                      className="font-semibold custom-font-size  capitalize text-text-primary text-[14px]"
                    >
                      {symbol.name}
                    </span>
                  </FitTitle>

                  <section className="flex h-full gap-2">
                    <SmallButton
                      title={"delete"}
                      className="p-2 bg-surface-secondary  hover:bg-[crimson!important] transition-all"
                      tooltipClassName="bg-[crimson!important]"
                      onClick={() => {
                        deleteUploadedBlock(symbol.id);
                      }}
                    >
                      {Icons.trash("white")}
                    </SmallButton>
                  </section>
                </section>
              )}
            </For>
          </section>
        </section>
      )}
    </section>
  );
};
