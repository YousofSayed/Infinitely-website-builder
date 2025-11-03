import React, { useEffect, useRef, useState } from "react";
import { blocksArrayType, symbolsType } from "../../../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import {
  downloadFile,
  getProjectData,
  getProjectSettings,
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
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot } from "../../../helpers/bridge";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Loader } from "../../Loader";
import { reloadRequiredInstance } from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";
import { For } from "million/react";

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
  const [animatRef] = useAutoAnimate();
  const [loading, setLoading] = useState(true);
  !noFilter &&
    useLiveQuery(async () => {
      setLoading(true);
      const projectData = await await getProjectData();
      const blocks = Object.values(projectData.blocks);
      const symbols = noFilter
        ? blocks
        : blocks.filter(
            (block) => block.type.toLowerCase() == type.toLowerCase()
          );
      setSymbols(symbols);
      setLoading(false);
      dataRef.current = symbols;
      return symbols;
    });

  // console.log("type : ", type);

  /**
   *
   * @param {string[]} symbols
   */
  const unlinkSymbol = (ids) => {
    for (const id of ids) {
      const symbols = editor
        .getWrapper()
        .find(`[${inf_symbol_Id_attribute}="${id}"]`);
      symbols.forEach((symbol) => {
        symbol.removeAttributes([inf_symbol_Id_attribute], {
          avoidStore: true,
        });
      });
    }
  };

  const deleteSymbolsInWorker = async (ids) => {
    !noFilter && editor.trigger("block:add");
    !noFilter && editor.trigger("block:update");
    const prjStng = getProjectSettings().projectSettings;
    unlinkSymbol(ids);

    infinitelyWorker.postMessage({
      command: "deleteAllSymbolsById",
      props: {
        projectId,
        symbolId: ids,
        unlink: true,
        deleteAll: prjStng.delete_symbols_after_delete_from_page,
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
        if (props.done && type == "symbol") {
          reloadRequiredInstance.emit(InfinitelyEvents.editor.require, {
            state: true,
          });
        } else if (props.done && type == "template") {
          editor.trigger("block:add");
          editor.trigger("block:update");
        }
      }
      infinitelyWorker.removeEventListener("message", callback);
    };

    infinitelyWorker.addEventListener("message", callback);

    // isProjectSettingPropTrue(
    //   "delete_symbols_after_delete_from_page",
    //   (settings, set) => {
    //     infinitelyWorker.postMessage({
    //       command: "deleteAllSymbolsById",
    //       props: {
    //         projectId,
    //         symbolId: ids,
    //       },
    //     });

    //     /**
    //      *
    //      * @param {MessageEvent} ev
    //      */
    //     const callback = (ev) => {
    //       const { command, props } = ev.data;
    //       console.log(`I Recived from worker well this command : ${command}`);

    //       if (command == "deleteAllSymbolsById") {
    //         props.done && editor.load();
    //       }
    //       infinitelyWorker.removeEventListener("message", callback);
    //     };

    //     infinitelyWorker.addEventListener("message", callback);
    //   }
    // );
    toast.success(<ToastMsgInfo msg={`${name} Symbol removed successfully`} />);
  };

  const deleteSymbol = async (id = "", name = "") => {
    const projectData = await await getProjectData();
    // const newBlocks = {};
    // const blocks = structuredClone(projectData.blocks);

    console.log("blocks : ", projectData.blocks, id);
    await opfs.remove({
      dirOrFile: await opfs.getFolders([
        defineRoot(`editor/${type}s/${id}`),
        // defineRoot(`editor/templates/${id}`),
      ]),
    });

    delete projectData.blocks[id];
    delete projectData.symbols[id];
    // const filterdSymbols = symbols
    //   .filter((symbol) => symbol.id != id)
    //   .forEach((symbol) => {
    //     newBlocks[symbol.id] = symbol;
    //   });
    !noFilter &&
      (await db.projects.update(projectId, {
        blocks: projectData.blocks,
        symbols: projectData.symbols,
      }));
    if (noFilter) {
      const blocksArr = Object.values(projectData.blocks);
      const filterdBlock = blocksArr.filter((block) => block.id != id);

      setSymbols(filterdBlock);
    }
    deleteSymbolsInWorker(id);
  };

  const deleteAll = async () => {
    const ids = symbols.map((symbol) => symbol.id);
    const projectData = await await getProjectData();
    const blocks = structuredClone(projectData.blocks);
    for (const id of ids) {
      await opfs.remove({
        dirOrFile: await opfs.getFolders([
          defineRoot(`editor/${type}s/${id}`),
          // defineRoot(`editor/templates/${id}`),
        ]),
      });
      delete blocks[id];
    }
    // ids.forEach((id) => {});

    !noFilter &&
      (await db.projects.update(projectId, {
        blocks,
      })); // No need for setSymbols because it will do liveQuery update
    if (noFilter) {
      setSymbols([]);
    }

    deleteSymbolsInWorker(ids);
  };

  /**
   *
   * @param {import('../../../helpers/types').InfinitelySymbol |  import('../../../helpers/types').InfinitelyBlock} symbol
   */
  const exportSymbol = async (symbol) => {
    symbol.content = await (
      await opfs.getFile(
        defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.html`)
      )
    ).text();
    symbol.style = await (
      await opfs.getFile(
        defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.css`)
      )
    ).text();
    downloadFile({
      filename: `${type}.json`,
      content: JSON.stringify(await replaceBlobs([symbol])),
      mimeType: "application/json",
    });
    toast.success(<ToastMsgInfo msg={`${type}s downloaded successfully`} />);
  };

  const exportAll = async () => {
    for (const symbol of symbols) {
      symbol.content = await (
        await opfs.getFile(
          defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.html`)
        )
      ).text();
      symbol.style = await (
        await opfs.getFile(
          defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.css`)
        )
      ).text();
    }

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
    <main
      className="h-full flex p-1 flex-col gap-2 overflow-hidden "
      ref={animatRef}
    >
      {showHeader && !!symbols.length && (
        <header className="flex items-center  rounded-lg  gap-2">
          <Input
          type="search"
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

      {Boolean(symbols.length) && (
        <section className="w-full  grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] overflow-y-auto hideScrollBar  gap-2">
          <For each={symbols}>
            {(symbol, i) => (
              <section
                key={i}
                className="p-1 bg-slate-800 h-[50px] rounded-lg flex justify-between items-center  gap-3"
              >
                {/* <section className="bg-slate-900 flex gap-2 items-center  px-2 w-full rounded-md h-full">
                  {" "}
                 
                </section> */}

                <FitTitle className="flex gap-2 items-center h-full  w-[calc(100%-115px)] overflow-hidden">
                  <figure
                    className=" h-full py-1 w-[35px]  bg-slate-900 flex justify-center items-center rounded-lg"
                    dangerouslySetInnerHTML={{ __html: symbol.media }}
                  >
                    {/* <img src={URL.createObjectURL(symbol.media)} alt="" /> */}
                  </figure>
                  <span
                    title={symbol.name}
                    className="font-semibold custom-font-size capitalize text-ellipsis overflow-hidden  text-slate-200 text-[14px] "
                  >
                    {symbol.name}
                  </span>
                </FitTitle>

                {/* <section>
    </section> */}
                <section className="flex gap-2">
                  {showDeleteBtn && (
                    <SmallButton
                      title={"delete"}
                      className="p-1 bg-slate-900 hover:bg-blue-600 transition-all"
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
                      className="p-1 bg-slate-900 hover:bg-blue-600 transition-all"
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
            )}
          </For>
        </section>
      )}

    {!symbols.length && !loading && (
          <section className="h-full w-full flex flex-col gap-2 items-center justify-center">
            {!symbols.length && !loading ? (
              <>
                <figure>
                  <img src={noData} className="max-w-[300px] max-h-[300px]" />
                </figure>
                {/* <FitTitle>No Data Here</FitTitle> */}
                <h1 className="text-slate-200 font-semibold">
                  No Data Founded...
                </h1>
              </>
            ) : loading ? (
              <Loader />
            ) : null}
          </section>
        )}
    </main>
  );
};
