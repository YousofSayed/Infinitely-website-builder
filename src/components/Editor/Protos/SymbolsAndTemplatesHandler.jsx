import React, { useEffect, useRef, useState } from "react";
import { blocksArrayType, symbolsType } from "../../../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import {
  downloadFile,
  getProjectData,
  isProjectSettingPropTrue,
  replaceBlobs,
} from "../../../helpers/functions";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import {
  current_project_id,
  inf_class_name,
  inf_symbol_Id_attribute,
} from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { useEditorMaybe } from "@grapesjs/react";
import { css } from "../../../helpers/cocktail";
import { infinitelyWorker } from "../../../helpers/infinitelyWorker";
import { Input } from "./Input";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../../Protos/VirtusoGridComponent";
import { Li } from "../../Protos/Li";
import noData from "../../../assets/images/no-data.svg";
import { FitTitle } from "./FitTitle";
import { SmallButton } from "./SmallButton";

export const SymbolsAndTemplatesHandler = ({
  type = "",
  noFilter = false,
  showHeader = true,
  showDeleteBtn = true,
  showDownloadBtn = true,
  uploadedBlocks = blocksArrayType,
  setUploadedBlock = (blocks) => {},
  children,
  btns = ({ id = "", name = "" }) => {},
}) => {
  const [symbols, setSymbols] = useState(
    noFilter ? uploadedBlocks : blocksArrayType
  );
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
  const dataRef = useRef(blocksArrayType);
  !noFilter &&
    useLiveQuery(async () => {
      const projectData = await await getProjectData();
      const blocks = Object.values(projectData.blocks);
      const symbols = noFilter
        ? blocks
        : blocks.filter(
            (block) => block.type.toLowerCase() == type.toLowerCase()
          );
      setSymbols(symbols);
      dataRef.current = symbols;
      return symbols;
    });

  console.log("type : ", type);

  const deleteSymbolsInWorker = async (ids) => {
    !noFilter && editor.trigger("block:add");
    !noFilter && editor.trigger("block:update");
    isProjectSettingPropTrue(
      "delete_symbols_after_delete_from_page",
      (settings, set) => {
        infinitelyWorker.postMessage({
          command: "deleteAllSymbolsById",
          props: {
            projectId,
            symbolId: ids,
          },
        });

        /**
         *
         * @param {MessageEvent} ev
         */
        const callback = (ev) => {
          const { command, props } = ev.data;
          console.log(`I Recived from worker well this command : ${command}`);

          if (command == "deleteAllSymbolsById") {
            props.done && editor.load();
          }
          infinitelyWorker.removeEventListener("message", callback);
        };

        infinitelyWorker.addEventListener("message", callback);
      }
    );
    toast.success(<ToastMsgInfo msg={`${name} Symbol removed successfully`} />);
  };

  const deleteSymbol = async (id = "", name = "") => {
    const projectData = await await getProjectData();
    const newBlocks = {};
    const blocks = structuredClone(projectData.blocks);
    console.log("blocks : ", blocks, id);

    delete blocks[id];
    // const filterdSymbols = symbols
    //   .filter((symbol) => symbol.id != id)
    //   .forEach((symbol) => {
    //     newBlocks[symbol.id] = symbol;
    //   });
    !noFilter &&
      (await db.projects.update(projectId, {
        blocks,
      }));
    if (noFilter) {
      const blocksArr = Object.values(blocks);
      const filterdBlock = blocksArr.filter((block) => block.id != id);

      setSymbols(filterdBlock);
    }
    deleteSymbolsInWorker(id);
  };

  const deleteAll = async () => {
    const ids = symbols.map((symbol) => symbol.id);
    const projectData = await await getProjectData();
    const blocks = structuredClone(projectData.blocks);

    ids.forEach((id) => delete blocks[id]);

    !noFilter &&
      (await db.projects.update(projectId, {
        blocks,
      })); // No need for setSymbols because it will do liveQuery update
    if (noFilter) {
      setSymbols([]);
    }

    deleteSymbolsInWorker(ids);
  };

  const exportSymbol = async (symbol) => {
    downloadFile({
      filename: `${type}s.json`,
      content: JSON.stringify(await replaceBlobs([symbol])),
      mimeType: "application/json",
    });
    toast.success(<ToastMsgInfo msg={`${type}s downloaded successfully`} />);
  };

  const exportAll = async () => {
    downloadFile({
      filename: `${type}s.json`,
      content: JSON.stringify(await replaceBlobs(symbols)),
      mimeType: "application/json",
    });
    toast.success(<ToastMsgInfo msg={`${type}s downloaded successfully`} />);
  };

  const search = (value = "") => {
    if (!value) {
      setSymbols(dataRef.current);
      return;
    }

    const newArr = dataRef.current.filter((symbol) /* Or template*/ =>
      symbol.name.includes(value));
    setSymbols(newArr);
  };

  return (
    <main className="h-full flex p-1 flex-col gap-2 ">
      {showHeader && !!symbols.length && (
        <header className="flex items-center  rounded-lg  gap-2">
          <Input
            placeholder="Search..."
            className="bg-slate-800 w-full"
            onInput={(ev) => {
              search(ev.target.value);
            }}
          />

          {/* <Button
            onClick={() => {
              deleteAll();
            }}
          >
            {Icons.trash("white")}
            Delete All
          </Button> */}

          <SmallButton
          
            onClick={() => {
              deleteAll();
            }}
            title="Delete All"
            className="flex-shrink-0  h-full hover:bg-[crimson!important] bg-slate-800"
          >
            {Icons.trash("white")}
          </SmallButton>

          <SmallButton
            onClick={() => {
              exportAll();
            }}
            title="Export All"
            className="flex-shrink-0 h-full bg-slate-800"
          >
            {Icons.export("white")}
          </SmallButton>
          {/* <Button
            onClick={() => {
              exportAll();
            }}
          >
            {Icons.export("white")}
            Download All
          </Button> */}
        </header>
      )}

      <section className="h-full w-full ">
       {!!symbols.length &&  <VirtuosoGrid
          totalCount={symbols.length}
          components={GridComponents}
          itemClassName="p-[unset!important]"
          listClassName="p-[unset!important]"
          itemContent={(i) => {
            const symbol = symbols[i];
            return (
              <section
                key={i}
                className="p-2 bg-slate-800 max-h-[200px] rounded-lg flex justify-between items-center  gap-3"
              >
                {/* <section className="bg-slate-900 flex gap-2 items-center  px-2 w-full rounded-md h-full">
                  {" "}
                 
                </section> */}

                <FitTitle className="flex gap-2 items-center w-full justify-center">
                   <figure
                    className=" h-full py-2 flex justify-center items-center rounded-lg"
                    dangerouslySetInnerHTML={{ __html: symbol.media }}
                  >
                    {/* <img src={URL.createObjectURL(symbol.media)} alt="" /> */}
                  </figure>
                  <span className="font-semibold capitalize text-slate-200 text-[14px] ">
                    {symbol.name}
                  </span>
                </FitTitle>

                {/* <section>
    </section> */}
                <section className="flex gap-2">
                  {showDeleteBtn && (
                    <SmallButton
                      title={"delete"}
                      className="p-2 bg-slate-900 hover:bg-blue-600 transition-all"
                      onClick={() => {
                        deleteSymbol(symbol.id, symbol.name);
                      }}
                    >
                      {Icons.trash("white")}
                    </SmallButton>
                  )}

                  {showDownloadBtn && (
                    <SmallButton
                      title={"export as json"}
                      className="p-2 bg-slate-900 hover:bg-blue-600 transition-all"
                      onClick={() => {
                        exportSymbol(symbol);
                      }}
                    >
                      {Icons.export("white")}
                    </SmallButton>
                  )}

                  {children}
                  {btns({ id: symbol.id, name: symbol.name })}
                </section>
              </section>
            );
          }}
        />}

        {!symbols.length && (<section className="h-full w-full flex flex-col gap-2 items-center justify-center">
          <figure>
            <img src={noData} className="max-w-[300px] max-h-[300px]" />
          </figure>
          {/* <FitTitle>No Data Here</FitTitle> */}
          <h1 className="text-slate-200 font-semibold">No Data Founded...</h1>
        </section>)}
      </section>
    </main>
  );
};
