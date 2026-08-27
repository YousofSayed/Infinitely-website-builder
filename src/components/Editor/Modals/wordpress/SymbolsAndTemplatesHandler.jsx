import noData from "@/assets/images/no-data.svg";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import {
  current_project_id,
  inf_class_name,
  inf_symbol_Id_attribute,
} from "@/constants/shared";
import { defineRoot } from "@/helpers/bridge";
import { css } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  doInNormalAsync,
  doInWordpressAsync,
  downloadFile,
  getProjectData,
  getProjectSettings,
  isProjectSettingPropTrue,
  replaceBlobs,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { blocksArrayType, symbolsType } from "@/helpers/jsDocs";
import { useSymbolsOrTemplates } from "@/queries/wp.queries";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Protos/Button";
import { Li } from "@/components/Protos/Li";
import { GridComponents } from "@/components/Protos/VirtusoGridComponent";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import { For } from "million/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid } from "react-virtuoso";
import { ShowIf } from "@/components/ShowIf";

export const WpSymbolsAndTemplatesHandler = ({
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
  const [symbols, setSymbols] = useState();
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
  const dataRef = useRef(blocksArrayType);
  const [animatRef] = useAutoAnimate();
  const [loading, setLoading] = useState(true);
  const { data: symbolsOrTemplates, isLoading: isSymbolsOrTemplatesLoading } =
    useSymbolsOrTemplates(type);

  useEffect(() => {
    if (symbolsOrTemplates && !isSymbolsOrTemplatesLoading) {
      console.log(`${type} response is : `, type, symbolsOrTemplates);
      setSymbols(symbolsOrTemplates?.data);
    }
  }, [isSymbolsOrTemplatesLoading, symbolsOrTemplates]);

  useEffect(() => {
    console.log("symbols is :", symbols);
  }, [symbols]);

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
   * @param {import('@/helpers/types').InfinitelySymbol |  import('@/helpers/types').InfinitelyBlock} symbol
   */
  const exportSymbol = async (symbol) => {
    symbol.content = await (
      await opfs.getFile(
        defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.html`),
      )
    ).text();
    symbol.style = await (
      await opfs.getFile(
        defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.css`),
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
    await doInNormalAsync(async () => {
      for (const symbol of symbols) {
        symbol.content = await (
          await opfs.getFile(
            defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.html`),
          )
        ).text();
        symbol.style = await (
          await opfs.getFile(
            defineRoot(`editor/${type}s/${symbol.id}/${symbol.id}.css`),
          )
        ).text();
      }

      downloadFile({
        filename: `${type}s.json`,
        content: JSON.stringify(await replaceBlobs(symbols)),
        mimeType: "application/json",
      });
    });

    await doInWordpressAsync(async () => {
       downloadFile({
        filename: `${type}s.json`,
        content: JSON.stringify(symbols),
        mimeType: "application/json",
      });
    });
    toast.success(<ToastMsgInfo msg={`${type}s downloaded successfully`} />);
  };

  const search = (value = "") => {
    if (!value) {
      setSymbols(dataRef.current);
      return;
    }

    const newArr = dataRef.current.filter((symbol) /* Or template*/ =>
      symbol.slug.includes(value),);
    setSymbols(newArr);
  };

  return (
    <main
      className="h-full flex p-1 flex-col gap-2 overflow-hidden "
      ref={animatRef}
    >
      <ShowIf condition={showHeader && Boolean(symbols?.length)}>
        <header className="flex items-center  rounded-lg  gap-2">
          <Input
            type="search"
            placeholder="Search..."
            className="bg-surface-tertiary w-full"
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
            className="shrink-0  h-full hover:bg-[crimson!important] bg-surface-tertiary"
          >
            {Icons.trash("white")}
          </SmallButton>

          <SmallButton
            onClick={() => {
              exportAll();
            }}
            title="Export All"
            className="shrink-0 h-full bg-surface-tertiary"
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
      </ShowIf>

      <ShowIf condition={Boolean(symbols?.length)}>
        <section className="w-full  grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] overflow-y-auto hideScrollBar  gap-2">
          <For each={symbols}>
            {(symbol, i) => (
              <section
                key={i}
                className="p-1  bg-surface-tertiary h-[50px] rounded-lg flex justify-between items-center  gap-3"
              >
                <FitTitle className="flex gap-2 items-center h-full  w-[calc(100%-115px)] overflow-hidden">
                  <figure
                    className=" h-full py-1 w-[35px]  bg-surface-secondary flex justify-center items-center rounded-lg"
                    dangerouslySetInnerHTML={{ __html: symbol.media }}
                  >
                    {/* <img src={URL.createObjectURL(symbol.media)} alt="" /> */}
                  </figure>
                  <span
                    title={symbol.slug}
                    className="font-semibold shrink-0 custom-font-size capitalize text-ellipsis overflow-hidden  text-text-primary text-[14px] "
                  >
                    {symbol.slug}
                  </span>
                </FitTitle>

                <section className="flex gap-2">
                  {showDeleteBtn && (
                    <SmallButton
                      title={"delete"}
                      className="p-1 bg-surface-secondary hover:bg-brand-primary transition-all"
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
                      className="p-1 bg-surface-secondary hover:bg-brand-primary transition-all"
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
      </ShowIf>

      <ShowIf condition={!symbols?.length && !isSymbolsOrTemplatesLoading}>
        <section className="h-full w-full flex flex-col gap-2 items-center justify-center">
          <>
            <figure>
              <img src={noData} className="max-w-[300px] max-h-[300px]" />
            </figure>
            {/* <FitTitle>No Data Here</FitTitle> */}
            <h1 className="text-text-primary font-semibold">
              No Data Founded...
            </h1>
          </>
        </section>
      </ShowIf>

      <ShowIf condition={isSymbolsOrTemplatesLoading}>
        <section className="h-full w-full flex flex-col gap-2 items-center justify-center">
          {loading ? <Loader /> : null}
        </section>
      </ShowIf>
    </main>
  );
};
