import React, { memo, useEffect, useRef, useState } from "react";
import { Button } from "../Protos/Button";
import { addClickClass, uniqueID } from "../../helpers/cocktail";
import { Icons } from "../Icons/Icons";
import { P } from "../Protos/P";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  assetTypeState,
  cssPropForAssetsManagerState,
  projectData,
  ruleState,
  selectorState,
} from "../../helpers/atoms";
import { useSetClassForCurrentEl } from "../../hooks/useSetclassForCurrentEl";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { Input } from "./Protos/Input";
import {
  createFileURL,
  getCurrentMediaDevice,
  getCurrentSelector,
  getInfinitelySymbolInfo,
  getProjectData,
} from "../../helpers/functions";
import { useLiveQuery } from "dexie-react-hooks";
import {
  current_project_id,
  inf_build_url,
  inf_css_urls,
} from "../../constants/shared";
import { db } from "../../helpers/db";
import { ViewportList } from "react-viewport-list";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../Protos/VirtusoGridComponent";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { blobToDataUrlAndClean } from "../../helpers/bridge";
import { useEditorMaybe } from "@grapesjs/react";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { Loader } from "../Loader";
import { initDBAssetsSw } from "../../serviceWorkers/initDBAssets-sw";

/**
 *
 * @param {{editor: import('grapesjs').Editor}} param0
 * @returns
 */
export const AssetsManager = memo(() => {
  /**
   * @type {import('../../helpers/types').InfinitelyAsset[]}
   */
  const filesType = [];
  const editor = useEditorMaybe();
  const [warn, setWarn] = useState("");
  const [files, setFiles] = useState(filesType);
  const cssPropForAM = useRecoilValue(cssPropForAssetsManagerState);
  const setCssPropForAM = useSetRecoilState(cssPropForAssetsManagerState);
  const projectId = +localStorage.getItem(current_project_id);
  const selector = useRecoilValue(selectorState);
  const rule = useRecoilValue(ruleState);
  const setClass = useSetClassForCurrentEl();
  const allFilesRef = useRef(filesType);
  const assetType = useRecoilValue(assetTypeState);
  const setAssetType = useSetRecoilState(assetTypeState);
  const [showLoader, setShowLoader] = useState(true);

  // const editor = useEditorMaybe();
  /**
   * @type {{current : HTMLInputElement}}
   */
  const inputRef = useRef();
  // const selec = editor.getSelected();

  useLiveQuery(async () => {
    // const projectData = await await getProjectData();
    // setFiles(projectData.assets);

    getAssetsFromAM();
  });

  useEffect(() => {
    if (!inputRef.current) return;
  });

  useEffect(() => {
    return () => {
      if (files.length) {
        for (const file of files) {
          URL.revokeObjectURL(file.blobUrl);
        }
        console.log("revoked");
      }
    };
  }, [files]);

  const getAssetsFromAM = async () => {
    const projectData = await await getProjectData();
    const assets = cssPropForAM
      ? projectData.assets.filter((asset) =>
          asset.file.type.toLowerCase().includes("image")
        )
      : assetType
      ? projectData.assets.filter((asset) =>
          asset.file.type.toLowerCase().includes(assetType)
        )
      : projectData.assets;

    // if (assets.length) {
    //   for (const asset of assets) {
    //     asset.blobUrl = URL.createObjectURL(asset.file);
    //   }
    // }
    allFilesRef.current = assets;
    setFiles(assets);
    setShowLoader(false);
  };

  const openUploader = () => {
    inputRef.current.click();
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const onUploaderLoad = async (ev) => {
    setShowLoader(true);
    try {
      /**
       * @type {File[]}
       */
      const inputFiles = Array.from(ev.target.files).map((file) => ({
        file: file,
        id: uniqueID(),
        // blobUrl: URL.createObjectURL(file),
      }));

      const projectData = await getProjectData();
      const init = initDBAssetsSw(() => {});
      console.log("itr : ", projectData.assets);

      await db.projects.update(projectId, {
        assets: [
          ...(Array.isArray(projectData.assets) ? projectData.assets : []),
          ...inputFiles,
        ],
      });

      init.then(async (sw) => {
        sw.postMessage({
          command: "setVar",
          props: {
            obj: {
              projectId: +localStorage.getItem(current_project_id),
              projectData: await getProjectData(),
            },
          },
        });
      });
      // infinitelyWorker.postMessage({
      //   command: "keepSwLive",
      //   props: {
      //     projectId: +localStorage.getItem(current_project_id),
      //   },
      // });
    } catch (error) {
      console.error(`Assets Manager : ${error}`);

      toast.error(<ToastMsgInfo msg={`Files upload failed`} />);
    } finally {
      setShowLoader(false);
    }

    // const newFiles = [];

    // inputFiles.forEach((file) => {
    //   const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   const fileSize = +(file.size / (1024 * 1024)).toFixed(2);

    //   if (fileSize > 30) {
    //     toast.warn(<ToastMsgInfo msg={"⚠ Maximum file size in 30MB"} />);

    //     setTimeout(() => {
    //       setWarn("");
    //     }, 1500);
    //     return;
    //   }

    //   const upload = (ev) => {
    //     newFiles.push({
    //       src: ev.target.result,
    //       type: file.type.split("/")[0],
    //       name: file.name,
    //       blob: file,
    //     });
    //     console.log(newFiles);
    //     setFiles([...files, ...newFiles]);
    //     editor.Assets.add({
    //       type: file.type.split("/")[0],
    //       src: ev.target.result,
    //       name: file.name,
    //       blob: file,
    //     });

    //     editor.store();
    //     reader.removeEventListener("load", upload);
    //   };

    //   reader.addEventListener("load", upload);
    // });
  };

  /**
   *
   * @param {MouseEvent} ev
   * @param {File} file
   */
  const onItemClicked = async (ev, file) => {
    ev.stopPropagation();
    ev.preventDefault();
    addClickClass(ev.target, "click");
    const selectedEl = editor.getSelected();
    if (!selectedEl) {
      toast.warn(<ToastMsgInfo msg={`Please select element`} />);
      return;
    }
    const symbolInfo = getInfinitelySymbolInfo(selectedEl);
    console.log(cssPropForAM);

    if (cssPropForAM) {
      setClass({
        cssProp: cssPropForAM,
        value: `url("../assets/${file.name}")`, //`url("${URL.createObjectURL(file)}") , url("../assets/${file.name}") /* buildUrl: url("https://example.com/style.css"); prop: background-image */`,
      });
    } else {
      editor.getSelected().addAttributes({ src: `../assets/${file.name}` });
    }
    // const urls = JSON.parse(selectedEl.getAttributes()[inf_css_urls] || "{}");
    // selectedEl.addAttributes({
    //   [inf_css_urls]: JSON.stringify({
    //     ...urls,
    //     [cssPropForAM]: {
    //       fileName: file.name,
    //       media: getCurrentMediaDevice(editor),
    //       rule: `${getCurrentSelector(selector, selectedEl)}${
    //         rule.ruleString || ""
    //       }`,
    //     },
    //   }),
    // });

    //   if (symbolInfo.isSymbol && !symbolInfo.isChild) {
    //     const projectData = await await getProjectData();
    //     await db.projects.update(projectId, {
    //       symbols: {
    //         ...projectData.symbols,
    //         [symbolInfo.mainId]: {
    //           ...projectData.symbols[symbolInfo.mainId],
    //           content: new Blob(
    //             [
    //               symbolInfo.symbol.toHTML({
    //                 keepInlineStyle: true,
    //                 withProps: true,
    //               }),
    //             ],
    //             { type: "text/html" }
    //           ),
    //         },
    //       },
    //     });
    //   }
    // } else {
    //   selectedEl.addAttributes({
    //     src: URL.createObjectURL(file),
    //     [inf_build_url]: `infinitely/assets/${file.name}`,
    //   });
    //   editor.trigger(InfinitelyEvents.attributes.buildUrl);
    // }

    // cssPropForAM
    //   ? setClass({
    //       cssProp: cssPropForAM,
    //       value: `url("${URL.createObjectURL(file)}")`,
    //     })
    //   : selectedEl.addAttributes({ src: URL.createObjectURL(file) });

    setCssPropForAM("");
    setAssetType("");
  };

  const deleteAsset = async (id) => {
    const newAssets = files.filter((file) => file.id != id);
    await db.projects.update(projectId, {
      assets: newAssets,
    });
  };

  const deleteAll = async () => {
    db.projects.update(projectId, {
      assets: [],
    });
  };

  const search = async (value = "") => {
    const newArr = files.filter((asset) => asset.file.name.includes(value));
    if (!newArr.length || !value) {
      setFiles(allFilesRef.current);
    } else {
      setFiles(newArr);
    }
  };

  return (
    <main className="w-full h-[500px]">
      <section className=" w-full h-full m-auto  rounded-lg flex flex-col gap-2">
        <header className="h-[50px!important] flex justify-between items-center gap-5 p-2 rounded-lg rounded-tl-full rounded-tr-2xl rounded-br-2xl rounded-bl-full bg-gray-950 ">
          <figure>{Icons.logo({ width: 38 })}</figure>
          {warn && (
            <p className="font-semibold text-xl bg-red-700 p-2 rounded-lg">
              {warn}
            </p>
          )}
          <Input
            placeholder="Search..."
            className="w-full h-full bg-slate-900"
            onInput={(ev) => {
              search(ev.target.value);
            }}
          />
          <Button
            onClick={openUploader}
            // className="py-[7.5px] px-[30px]  font-bold text-lg"
          >
            {Icons.upload({ strokeColor: "white" })}
            Upload
          </Button>

          <Button
            onClick={() => {
              deleteAll();
            }}
          >
            {Icons.trash("white")}
            Delete All
          </Button>
        </header>

        {/* <section
          className={`w-full h-full  bg-gray-950 rounded-lg p-2 overflow-auto grid grid-cols-[repeat(auto-fill,minmax(25%,1fr))] grid-rows-[repeat(auto-fill,minmax(200px,200px))] justify-start gap-[15px] `}
        > */}
        {showLoader && <Loader />}
        {!!files.length && (
          <VirtuosoGrid
            totalCount={files.length}
            components={GridComponents}
            // className="h-full"
            className="p-[unset]"
            // itemClassName="p-[unset]"
            listClassName=" pr-2"
            itemContent={(index) => {
              const i = index,
                asset = files[index];

              return (
                <article
                  key={i}
                  className={`group relative rounded-lg p-3 bg-slate-800  flex flex-col justify-center items-center gap-2`}
                >
                  <button
                    onClick={(ev) => {
                      deleteAsset(asset.id);
                    }}
                    className="absolute group-hover:flex z-[200] right-0 top-0 bg-blue-600 fill-white cursor-pointer hidden justify-center items-center rounded-full w-[23px] h-[23px]"
                  >
                    {/* <Icons.close /> */}
                    {Icons.close("white", 1.5)}
                  </button>

                  <figure
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onItemClicked(ev, asset.file);
                    }}
                    className=" p-2 h-[150px]  cursor-pointer rounded-lg  "
                  >
                    {(asset.file.type.includes("video") && (
                      <>
                        <video
                          onClick={(ev) => onItemClicked(ev, asset.file)}
                          // className="w-full h-full"
                          src={asset.blobUrl}
                          // controls={true}
                        ></video>
                        <p className="mt-5 p-1 bg-blue-600 w-fit font-bold rounded-lg">
                          video
                        </p>
                      </>
                    )) ||
                      (asset.file.type.includes("audio") && (
                        <audio
                          onClick={(ev) => onItemClicked(ev, asset.file)}
                          className="w-full h-full"
                          src={asset.blobUrl}
                          controls={true}
                        ></audio>
                      )) ||
                      (asset.file.type.includes("image") && (
                        <img
                          onLoad={(ev) => {
                            console.log("image load...");
                          }}
                          onClick={(ev) => onItemClicked(ev, asset.file)}
                          className="w-full h-full object-fill"
                          src={`assets/${asset.file.name}`}
                        ></img>
                      ))}

                    {!/image|audio|video/gi.test(asset.file.type) &&
                      Icons.file({ fill: "white", width: 130, height: 130 })}
                  </figure>
                  <p
                    title={asset.file.name}
                    className="text-slate-200 p-2 bg-slate-900 rounded-md text-ellipsis max-w-[90%]   text-nowrap overflow-hidden "
                  >
                    {asset.file.name}
                  </p>
                </article>
              );
            }}
          />
        )}

        <input
          onChange={onUploaderLoad}
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={true}
        />
      </section>
    </main>
  );
});
