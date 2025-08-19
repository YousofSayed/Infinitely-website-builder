import React, { useRef, useState } from "react";
import { blocksArrayType } from "../../../helpers/jsDocs";
import { Icons } from "../../Icons/Icons";
import { Button } from "../../Protos/Button";
import { SymbolsAndTemplatesHandler } from "./SymbolsAndTemplatesHandler";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { getProjectData, restoreBlobs } from "../../../helpers/functions";
import { Input } from "./Input";
import { db } from "../../../helpers/db";
import { current_project_id } from "../../../constants/shared";
import { useEditorMaybe } from "@grapesjs/react";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../../Protos/VirtusoGridComponent";
import { FitTitle } from "./FitTitle";
import { SmallButton } from "./SmallButton";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot } from "../../../helpers/bridge";

export const UploadBlocks = () => {
  const [uploadedBlocks, setUploadedBlocks] = useState(blocksArrayType);
  const projectId = +localStorage.getItem(current_project_id);
  const inputRef = useRef();
  const editor = useEditorMaybe();

  /**
   *
   * @param {HTMLInputElement} input
   */
  const uploadBlocksCallback = async (input) => {
    /**
     * @type {File}
     */
    const file = input.files[0];
    ev.target.value = '';
    const symbolsOrTemplates = await restoreBlobs(
      JSON.parse((await file.text()) || "{}")
    );
    if (
      !symbolsOrTemplates?.[0]?.type &&
      (symbolsOrTemplates[0].type != "symbol" ||
        symbolsOrTemplates[0].type != "template")
    ) {
      toast.error(
        <ToastMsgInfo
          msg={"Invalid file"}
          description={
            "The file you uploaded is not a valid file. Please upload a valid file."
          }
        />
      );
      return;
    }
    setUploadedBlocks(symbolsOrTemplates);
    ev.target.value = '';
  };

  const saveBlocksToDB = async () => {
    const projectData = await getProjectData();
    /**
     * @type {{[key:string]:import('../../../helpers/types').InfinitelyBlock}}
     */
    const blocks = {};
    /**
     * @type {{[key:string] : import('../../../helpers/types').InfinitelySymbol}}
     */
    const symbols = {};
    await Promise.all(
      uploadedBlocks.map(async (block) => {
        // const restoredBlock = restoreBlobs(block);
        console.log("restored block : ", block);
        await opfs.createFiles([
          {
            path: defineRoot(
              `editor/${block.type}s/${block.id}/${block.id}.html`
            ),
            content: block.content,
          },
          {
            path: defineRoot(
              `editor/${block.type}s/${block.id}/${block.id}.css`
            ),
            content: block.style,
          },
        ]);

        block.content = '';
        block.style = '';

        blocks[block.id] = block;
        if (block.type == "symbol") {
          symbols[`${block.id}`] = block;
        } else {
        }
        return block;
      })
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

    editor.load();
    editor.trigger("block:add");
    editor.trigger("block:update");
  };

  const deleteUploadedBlock = (id) => {
    const newArr = uploadedBlocks.filter((block) => block.id != id);
    setUploadedBlocks(newArr);
  };

  return (
    <section className="p-1 h-full w-full flex justify-center  flex-col">
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
            <Input placeholder="Search..." className="w-full bg-slate-800" />
            <SmallButton
              title={"save blocks"}
              onClick={() => {
                saveBlocksToDB();
              }}
            >
              {Icons.saveData({ fill: "white", height: 17 })}
            </SmallButton>
          </header>
          <section className="h-full w-full ">
            <VirtuosoGrid
              totalCount={uploadedBlocks.length}
              components={GridComponents}
              listClassName="p-[unset!important]"
              itemContent={(i) => {
                const symbol = uploadedBlocks[i];
                return (
                  <section
                    key={i}
                    className="p-2 bg-slate-800 max-h-[200px] rounded-lg flex justify-between items-center  gap-2"
                  >
                    {/* <section className="bg-slate-900 flex gap-2 items-center  px-2 w-full rounded-md h-full">
                      {" "}
                      <figure
                        className=" h-full py-2 flex justify-center items-center rounded-lg"
                        dangerouslySetInnerHTML={{ __html: symbol.media }}
                      ></figure>
                      <h1 className="font-semibold capitalize text-slate-200 text-lg custom-font-size first-letter:text-blue-400">
                        {symbol.name}
                      </h1>
                    </section> */}

                    <FitTitle className="flex items-center gap-2 w-full justify-center">
                      <figure
                        className=" h-full py-2 flex justify-center items-center rounded-lg"
                        dangerouslySetInnerHTML={{ __html: symbol.media }}
                      ></figure>
                      <span className="font-semibold capitalize text-slate-200 text-[14px]">
                        {symbol.name}
                      </span>
                    </FitTitle>

                    <section className="flex h-full gap-2">
                      <SmallButton
                        title={"delete"}
                        className="p-2 bg-slate-900  hover:bg-[crimson!important] transition-all"
                        onClick={() => {
                          deleteUploadedBlock(symbol.id);
                        }}
                      >
                        {Icons.trash("white")}
                      </SmallButton>
                    </section>
                  </section>
                );
              }}
            />
          </section>
        </section>
      )}
    </section>
  );
};
