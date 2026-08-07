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
  callWorkerCommand,
  doInNormalAsync,
  doInWordpressAsync,
  downloadFile,
  getProjectData,
  getProjectId,
  getProjectSettings,
  isProjectSettingPropTrue,
  preventSelectNavigation,
  replaceBlobs,
  workerCallbackMaker,
  workerCallbackMakerWithProps,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { blocksArrayType, symbolsType } from "@/helpers/jsDocs";
import {
  useDeletePostsMutation,
  useInsertPostsMutation,
  usePosts,
  useUnlinkSymbolsMutation,
} from "@/queries/wp.queries";
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
import { isArray } from "lodash";

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
    noFilter ? uploadedBlocks : blocksArrayType,
  );
  const projectId = getProjectId();
  const editor = useEditorMaybe();
  const dataRef = useRef(blocksArrayType);
  const [animatRef] = useAutoAnimate();
  const [loading, setLoading] = useState(true);
  const wp_type =
    type === "symbol" ? "inf_symbols" : type === "template" ? "inf_blocks" : "";
  const {
    data: symbolsOrTemplates,
    isLoading: isSymbolsOrTemplatesLoading,
    isFetching: isSymbolsOrTemplatesRefetching,
  } = usePosts(wp_type);

  const {
    mutateAsync: insertPosts,
    isPending: isInserting,
    isSuccess: isInsertingSuccess,
  } = useInsertPostsMutation(wp_type);

  const {
    mutateAsync: deletePosts,
    isPending: isDeleting,
    isSuccess: isDeletingSuccess,
  } = useDeletePostsMutation(wp_type);

  const { mutateAsync: unlinkSymbols, isPending: isUnlinking } =
    useUnlinkSymbolsMutation(wp_type);

  useEffect(() => {
    doInWordpressAsync(async () => {
      if (symbolsOrTemplates) {
        console.log(`${type} response is : `, type, symbolsOrTemplates);
        const newSymbols = symbolsOrTemplates?.data.map((item) => {
          item.name = item.slug;
          item.media = item?.meta?.media;
          return item;
        });
        dataRef.current = newSymbols;
        setSymbols(newSymbols);
      }
    });
  }, [ symbolsOrTemplates]);

  !noFilter &&
    useLiveQuery(async () => {
      return doInNormalAsync(async () => {
        setLoading(true);
        const projectData = await await getProjectData();
        const blocks = Object.values(projectData.blocks);
        const symbols = noFilter
          ? blocks
          : blocks.filter(
              (block) => block.type.toLowerCase() == type.toLowerCase(),
            );
        setSymbols(symbols);
        setLoading(false);
        dataRef.current = symbols;
        return symbols;
      });
    });

  const refreshCurrentPage = (ids) => {
    editor
      .getWrapper()
      .find(
        `${isArray(ids) ? `${ids.map((id) => `[${inf_symbol_Id_attribute}="${id}"]`).join(" , ")}` : ` [${inf_symbol_Id_attribute}="${ids}"]`}`,
      )
      .forEach((symbol) =>
        symbol.removeAttributes([inf_symbol_Id_attribute], {
          // avoidStore: true,
        }),
      );

    preventSelectNavigation(editor, editor.getSelected());
  };

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
    // unlinkSymbol(ids);

    workerCallbackMakerWithProps(
      infinitelyWorker,
      "deleteAllSymbolsById",
      {
        projectId,
        symbolId: ids,
        unlink: true,
        deleteAll: prjStng.delete_symbols_after_delete_from_page,
      },
      (props) => {
        if (props.done && type == "symbol") {
          // reloadRequiredInstance.emit(InfinitelyEvents.editor.require, {
          //   state: true,
          // });
          // editor
          //   .getWrapper()
          //   .find(
          //     `${isArray(ids) ? `${ids.map((id) => `[${inf_symbol_Id_attribute}="${id}"]`).join(" , ")}` : ` [${inf_symbol_Id_attribute}="${ids}"]`}`,
          //   )
          //   .forEach((symbol) =>
          //     symbol.removeAttributes([inf_symbol_Id_attribute], {
          //       // avoidStore: true,
          //     }),
          //   );

          // preventSelectNavigation(editor, editor.getSelected());
          refreshCurrentPage();
        } else if (props.done && type == "template") {
          editor.trigger("block:add");
          editor.trigger("block:update");
        }
      },
    );

    toast.success(<ToastMsgInfo msg={`${name} Symbol removed successfully`} />);
  };

  const deleteSymbol = async (id = "", name = "") => {
    const cnfrm = confirm(
      `Are you sure that you want to delete this symbol (All symbols in all pages will be unlinked) ? 🤔`,
    );
    if (!cnfrm) return;

    const projectData = await await getProjectData();
    // const newBlocks = {};
    // const blocks = structuredClone(projectData.blocks);
    const tid = toast.loading(
      <ToastMsgInfo msg={`Deleting ${name} Symbol...`} />,
    );
    await doInNormalAsync(async () => {
      console.log("blocks : ", projectData.blocks, id);
      await opfs.remove({
        dirOrFile: await opfs.getFolders([
          defineRoot(`editor/${type}s/${id}`),
          // defineRoot(`editor/templates/${id}`),
        ]),
      });

      delete projectData.blocks[id];
      delete projectData.symbols[id];
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
    });

    await doInWordpressAsync(async () => {
      await deletePosts({
        projectId,
        ids: [id],
      });

      await unlinkSymbols({
        projectId,
        symbol_ids: [id],
      });
    });

    toast.done(tid);
    toast.success(
      <ToastMsgInfo msg={`${name} Symbol removed successfully😍`} />,
    );
  };

  const deleteAll = async () => {
    const cnfrm = confirm(
      `Are you sure that you want to delete those symbols (every symbol in all pages will be unlinked) ? 🤔`,
    );
    if (!cnfrm) return;
    const ids = symbols.map((symbol) => symbol.id);
    const tid = toast.loading(<ToastMsgInfo msg={`Deleting ${type}s...`} />);
    await doInNormalAsync(async () => {
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
    });

    await doInWordpressAsync(async () => {
      await deletePosts({
        projectId,
        ids,
      });
      if (type == "symbol") {
        await unlinkSymbols({
          projectId,
          symbol_ids: ids,
        });

        refreshCurrentPage();
      }
    });
    toast.done(tid);
    toast.success(<ToastMsgInfo msg={`${type}s removed successfully💙`} />);
  };

  /**
   *
   * @param {import('@/helpers/types').InfinitelySymbol |  import('@/helpers/types').InfinitelyBlock} symbol
   */
  const exportSymbol = async (symbol) => {
    await doInNormalAsync(async () => {
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
    });

    await doInWordpressAsync(async () => {
      await downloadFile({
        filename: `${type}.json`,
        content: JSON.stringify([symbol]),
        mimeType: "application/json",
      });
    });
    toast.success(<ToastMsgInfo msg={`${type}s downloaded successfully`} />);
  };

  const exportAll = async () => {
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
    toast.success(<ToastMsgInfo msg={`${type}s downloaded successfully`} />);
  };

  const search = (value = "") => {
    if (!value) {
      setSymbols(dataRef.current);
      return;
    }

    const newArr = dataRef.current.filter((symbol) /* Or template*/ =>
      symbol.name.includes(value),);
    setSymbols(newArr);
  };

  return (
    <main
      className="h-full flex p-1 flex-col gap-2 overflow-hidden "
      ref={animatRef}
    >
      <ShowIf
        condition={
          showHeader &&
          !isSymbolsOrTemplatesLoading &&
          !isSymbolsOrTemplatesRefetching &&
          Boolean(symbols?.length) &&
          Boolean(dataRef.current.length)
        }
      >
        <header className="flex items-center  rounded-lg  gap-2">
          <Input
            type="search"
            placeholder="Search..."
            className="bg-surface-tertiary w-full"
            onInput={(ev) => {
              search(ev.target.value);
            }}
          />

          <SmallButton
            disabled={isDeleting}
            onClick={() => {
              deleteAll();
            }}
            title="Delete All"
            className="flex-shrink-0  h-full hover:bg-[crimson!important] bg-surface-tertiary"
          >
            {Icons.trash("white")}
          </SmallButton>

          <SmallButton
            onClick={() => {
              exportAll();
            }}
            title="Export All"
            className="flex-shrink-0 h-full bg-surface-tertiary"
          >
            {Icons.export("white")}
          </SmallButton>
        </header>
      </ShowIf>

      <ShowIf
        condition={
          Boolean(symbols?.length) && !isSymbolsOrTemplatesLoading
          &&
          !isSymbolsOrTemplatesRefetching
        }
      >
        <section className="w-full   grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] overflow-y-auto hideScrollBar  gap-2">
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
                    title={symbol.name}
                    className="font-semibold shrink-0 custom-font-size capitalize text-ellipsis overflow-hidden  text-text-primary text-[14px] "
                  >
                    {symbol.name}
                  </span>
                </FitTitle>

                <section className="flex gap-2">
                  {showDeleteBtn && (
                    <SmallButton
                      disabled={isDeleting}
                      title={"delete"}
                      tooltipClassName="bg-[crimson!important]"
                      className="p-1 bg-surface-secondary hover:bg-[crimson!important] transition-all"
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

      <ShowIf
        condition={
          !symbols?.length && !isSymbolsOrTemplatesLoading
           &&
          !isSymbolsOrTemplatesRefetching
        }
      >
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
