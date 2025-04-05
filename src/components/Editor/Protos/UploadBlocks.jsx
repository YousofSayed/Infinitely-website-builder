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
    const reader = new FileReader();
    reader.readAsText(input.files[0]);
    reader.onloadend = async () => {
      console.log(
        "uploaded : ",
        await restoreBlobs(JSON.parse(reader.result || "{}"))
      );

      !reader.result && toast.warn(<ToastMsgInfo msg={`Files is empty`} />);
      setUploadedBlocks(await restoreBlobs(JSON.parse(reader.result || "{}")));
    };
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

        blocks[block.id] = block;
        if (block.type == "symbol") {
          symbols[`${block.id}`] = block;
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
    <section className="p-1 h-full flex justify-center items-center flex-col">
      {!uploadedBlocks.length ? (
        <section className=" flex justify-center items-center flex-col gap-2 p-5 rounded-md ">
          <figure>
            {Icons.upload({ strokeColor: "white", height: 80, width: 80 })}
          </figure>
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
          <header className="flex gap-2 p-2 bg-slate-800 rounded-md">
            <Input placeholder="Search..." className="w-full bg-slate-950" />
            <Button
              title={"save blocks"}
              onClick={() => {
                saveBlocksToDB();
              }}
            >
              {Icons.saveData({ fill: "white" })}
              Save
            </Button>
          </header>
          <section className="h-full w-full grid grid-cols-4 gap-2 ">
            {uploadedBlocks.map((symbol, i) => {
              return (
                <section
                  key={i}
                  className="p-2 bg-slate-800 max-h-[200px] rounded-lg flex flex-col gap-3"
                >
                  <h1 className="font-semibold capitalize text-slate-200 text-lg custom-font-size first-letter:text-blue-400">
                    {symbol.name}
                  </h1>
                  <figure className="w-full p-1 bg-slate-900 max-h-[50%] h-[50%] grid place-content-center rounded-lg">
                    <img src={URL.createObjectURL(symbol.media)} alt="" />
                  </figure>

                  {/* <section>
                            </section> */}
                  <section className="flex gap-2">
                    <Button
                      title={"delete"}
                      className="p-2 bg-slate-900 hover:bg-blue-600 transition-all"
                      onClick={() => {
                        deleteUploadedBlock(symbol.id);
                      }}
                    >
                      {Icons.trash("white")}
                    </Button>
                  </section>
                </section>
              );
            })}
          </section>
          {/* <SymbolsAndTemplatesHandler
            noFilter
            uploadedBlocks={uploadedBlocks}
            showHeader={false}
            showDownloadBtn={false}
            showDeleteBtn={false}
            setUploadedBlock={setUploadedBlocks}
            btns={({ id }) => {
              return (
                <Button
                  className="p-2 bg-slate-900 hover:bg-blue-600 transition-all"
                  onClick={() => {
                    console.log("delter : id", id);

                   
                  }}
                >
                  {Icons.trash("white")}
                </Button>
              );
            }}
          ></SymbolsAndTemplatesHandler> */}
        </section>
      )}
    </section>
  );
};
