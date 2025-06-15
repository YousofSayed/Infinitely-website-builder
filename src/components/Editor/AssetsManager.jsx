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
  getProjectSettings,
} from "../../helpers/functions";
import { useLiveQuery } from "dexie-react-hooks";
import {
  current_page_id,
  current_project_id,
  inf_build_url,
  inf_css_urls,
  MAX_UPLOAD_SIZE,
} from "../../constants/shared";
import { db } from "../../helpers/db";
import { ViewportList } from "react-viewport-list";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../Protos/VirtusoGridComponent";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import {
  blobToDataUrlAndClean,
  cleanMotions,
  getFileSize,
  getFilesSize,
  getStorageDetails,
} from "../../helpers/bridge";
import { useEditorMaybe } from "@grapesjs/react";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { Loader } from "../Loader";
import { initDBAssetsSw } from "../../serviceWorkers/initDBAssets-sw";
import { SmallButton } from "./Protos/SmallButton";
import noData from "../../assets/images/no-data.svg";
import { FitTitle } from "./Protos/FitTitle";
import { storageDetailsType } from "../../helpers/jsDocs";
import { Hr } from "../Protos/Hr";
import { FileView } from "../Protos/FileView";

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
  const [storageDetails, setStorageDetails] = useState(storageDetailsType);
  // const editor = useEditorMaybe();
  /**
   * @type {{current : HTMLInputElement}}
   */
  const inputRef = useRef();
  // const selec = editor.getSelected();

  useLiveQuery(async () => {
    getAssetsFromAM();
  });


  useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const cb = (ev) => {
      if (ev.data.command == "setVar") {
        const init = initDBAssetsSw(() => {});
        init.then((sw) => {
          sw.postMessage(ev.data);
        });
        setShowLoader(false);
        console.log("data : ", ev.data);
      }
    };
    infinitelyWorker.addEventListener("message", cb);
    getAndSetStorageDetails();
    return () => {
      infinitelyWorker.removeEventListener("message", cb);
    };
  }, []);

  const getAndSetStorageDetails = async () => {
    // console.log('current_project_id : ', +localStorage.getItem(current_project_id));
    
    setStorageDetails(
      await getStorageDetails(+localStorage.getItem(current_project_id))
    );
  };

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
    // setShowLoader(true);
    try {
      /**
       * @type {File[]}
       */
      const files = [...ev.target.files];
      const inputFiles = files.map((file) => ({
        file: file,
        id: uniqueID(),
        // blobUrl: URL.createObjectURL(file),
      }));
      // const projectData = await getProjectData();

      const filesSize = getFilesSize(files);
      console.log(filesSize.MB, filesSize.GB);

      // return

      // if (filesSize.MB > 10) {
      //   toast.warn(<ToastMsgInfo msg={`Files Size Is Too Large!!`} />);
      //   setShowLoader(false);
      //   return;
      // }

      // const projectData = await getProjectData();
      // console.log("itr : ", projectData.assets);

      // await db.projects.update(projectId, {
      // assets: [
      //   ...(Array.isArray(projectData.assets) ? projectData.assets : []),
      //   ...inputFiles,
      // ],
      // });
      const id = toast.loading(<ToastMsgInfo msg={`Uploading...`} />);
      infinitelyWorker.postMessage({
        command: "uploadAssets",
        props: {
          projectId,
          toastId: id,
          assets: [
            // ...(Array.isArray(projectData.assets) ? projectData.assets : []),
            ...inputFiles,
          ],
        },
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
      // setShowLoader(false);
    }

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
    // const symbolInfo = getInfinitelySymbolInfo(selectedEl);
    console.log(cssPropForAM);

    if (cssPropForAM) {
      setClass({
        cssProp: cssPropForAM,
        value: `url("../assets/${file.name}")`, //`url("${URL.createObjectURL(file)}") , url("../assets/${file.name}") /* buildUrl: url("https://example.com/style.css"); prop: background-image */`,
      });
    } else {
      const el = editor.getSelected().getEl();
      const tagName = el.tagName.toLowerCase();
      console.log(
        tagName,
        editor.getSelected().getEl(),
        editor.getSelected().getEl() instanceof HTMLDivElement
      );
      const pageName = localStorage.getItem(current_page_id);
      const isIndex = pageName.toLowerCase() == "index";
      const src = `${isIndex ? "." : ".."}/assets/${file.name}`;
      editor.getSelected().addAttributes({ src });
      const projectSettings = getProjectSettings();
      const navigateValue =
        projectSettings.projectSettings.navigate_to_style_when_Select;
      // editor.getSelected().getView().render();
      // editor.getSelected().updateView()
      if (!("src" in el)) {
        // el.querySelector(`[src]`).setAttribute("src", src);
        projectSettings.set({
          navigate_to_style_when_Select: false,
        });
        const newSle = editor
          .getSelected()
          .replaceWith(editor.getSelected().clone())[0];
        editor.select(newSle);
        projectSettings.set({
          navigate_to_style_when_Select: navigateValue,
        });
      }
      // console.log("nooo", !("src" in el));
    }

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
    await db.projects.update(projectId, {
      assets: [],
    });

    toast.success(<ToastMsgInfo msg={`All assets deleted successfully`} />);
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
      <section className=" w-full h-full m-auto  rounded-lg overflow-hidden flex flex-col gap-2">
        <header className="h-[50px!important] flex justify-between items-center gap-2 p-2  rounded-tl-full rounded-tr-2xl rounded-br-2xl rounded-bl-full bg-slate-800 ">
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

          <SmallButton
            title="Delete All"
            className="h-full flex-shrink-0 bg-slate-900 hover:bg-[crimson!important]"
            onClick={() => {
              deleteAll();
            }}
          >
            {Icons.trash("white")}
          </SmallButton>

          <SmallButton
            className="h-full flex-shrink-0 bg-slate-900"
            title={"Upload"}
            onClick={openUploader}
            // className="py-[7.5px] px-[30px]  font-bold text-lg"
          >
            {Icons.upload({ strokeColor: "white" })}
          </SmallButton>
        </header>

        {!!files.length && (
          <section className=" flex items-center justify-between p-2 rounded-lg bg-slate-800">
            <article className="font-semibold text-[14px] text-slate-200 flex items-center gap-2">
              <FitTitle>Available Space</FitTitle>{" "}
              <p className="h-full p-1 bg-slate-900 rounded-lg">
                {storageDetails.availableSpaceInMB >= MAX_UPLOAD_SIZE
                  ? (
                      MAX_UPLOAD_SIZE -
                      getFilesSize(files.map((file) => file.file)).MB
                    ).toFixed(2)
                  : (
                      storageDetails.availableSpaceInMB -
                      getFilesSize(files.map((file) => file.file)).MB
                    ).toFixed(2)}
                MB
              </p>{" "}
            </article>

            <Hr/>

            <article className="font-semibold text-[14px] text-slate-200 flex items-center gap-2">
              <FitTitle>Used Space</FitTitle>{" "}
              <p className="h-full p-1 bg-slate-900 rounded-lg">
                {getFilesSize(files.map((file) => file.file)).MB.toFixed(2)}MB
              </p>{" "}
            </article>

            <Hr/>

            <article className="font-semibold text-[14px] text-slate-200 flex items-center gap-2">
              <FitTitle>Total Space</FitTitle>{" "}
              <p className="h-full p-1 bg-slate-900 rounded-lg">
                {storageDetails.availableSpaceInMB >= MAX_UPLOAD_SIZE
                  ? MAX_UPLOAD_SIZE
                  : storageDetails.availableSpaceInMB}
                MB
              </p>{" "}
            </article>
          </section>
        )}

        {/* <section
          className={`w-full h-full  bg-gray-950 rounded-lg p-2 overflow-auto grid grid-cols-[repeat(auto-fill,minmax(25%,1fr))] grid-rows-[repeat(auto-fill,minmax(200px,200px))] justify-start gap-[15px] `}
        > */}
        {showLoader && <Loader />} 
        {!!files.length && (
          <VirtuosoGrid
            totalCount={files.length}
            components={GridComponents}
            style={{
              height: "100%",
            }}
            // className="h-full"
            className="p-[unset] h-full"
            // itemClassName="p-[unset]"
            listClassName=" pr-2"
            itemContent={(index) => {
              const i = index,
                asset = files[index];

              return (
             
                <FileView asset={asset}   />
              );
            }}
          />
        )}

        {!files.length && !showLoader && (
          <section className="w-full h-full flex flex-col gap-2 justify-center items-center">
            <figure>
              <img src={noData} className="max-w-full max-h-[300px]" />
            </figure>
            <p className="text-slate-300 font-semibold text-2xl">
              No assets found
            </p>
          </section>
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

// console.log(encodeURI(`WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4`) == 'whatsapp%20video%202025-04-09%20at%206.37.02%20am.mp4');
