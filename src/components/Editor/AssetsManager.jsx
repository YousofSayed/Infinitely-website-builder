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
  defineRoot,
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
import { opfs } from "../../helpers/initOpfs";
import { assetsWorker } from "../../helpers/defineWorkers";

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

    const getFilesCb = async (data) => {
      console.log("Files created in OPFS : ", data);
      // if (!data.folderName.includes("assets")) return;
      const assets = await Promise.all(
        (
          await opfs.getAllFiles(defineRoot(`assets`))
        ).map(async (handle) => await handle.getOriginFile())
      );

      // const files = await Promise.all(
      //   (
      //     await opfs.getAllFiles(
      //       assetFolder,
      //       {recursive:false}
      //     )
      //   ).map(async (file) => await file.getFile())
      // );
      setFiles(assets);
    };

    // const opfsCreateCleaner = opfs.on("all",async (data) => {
    // console.log("Files created in OPFS : ", data);
    // // if (data?.currentRoot?.name && !data.currentRoot.name.includes("assets")) return;
    // const files = await Promise.all(
    //   (
    //     await opfs.getAllFiles(
    //       await opfs.root,
    //       `projects/project-${projectId}/assets`
    //     )
    //   ).map(async (file) => await file.getFile())
    // );
    // console.log("Files created in OPFS After : ", files);

    // setFiles(
    //  files
    // );
    // });

    const cleaner1 = opfs.on("all", getFilesCb);

    const cleaner2 = opfs.onBroadcast("all", getFilesCb);
    // const opfsRemovedCleaner = opfs.on("entriesRemoved",getFilesCb);
    // const opfsRemovedCleaner = opfs.on("entriesRemoved",getFilesCb);

    assetsWorker.addEventListener("message", cb);

    getAndSetStorageDetails();
    return () => {
      assetsWorker.removeEventListener("message", cb);
      // opfsCreateCleaner();
      cleaner1();
      cleaner2();
    };
  }, []);

  const getAndSetStorageDetails = async () => {
    // console.log('current_project_id : ', +localStorage.getItem(current_project_id));

    setStorageDetails(
      await getStorageDetails(+localStorage.getItem(current_project_id))
    );
  };

  const getAssetsFromAM = async () => {
    // const projectData = await await getProjectData();
    // const assets = cssPropForAM
    //   ? projectData.assets.filter((asset) =>
    //       asset.file.type.toLowerCase().includes("image")
    //     )
    //   : assetType
    //   ? projectData.assets.filter((asset) =>
    //       asset.file.type.toLowerCase().includes(assetType)
    //     )
    //   : projectData.assets;
    // console.log("folders : ", await opfs.getAllFolders(await opfs.root));
    // opfs.getAllFiles
    // const assetsRoot = await opfs.getFolder(
    //   defineRoot(`assets`)
    // );

    // const assets = await Promise.all((await assetsRoot.children()).filter(handle=>handle.kind =='file').map(handle => handle.getOriginFile()))
    // const files = await opfs.getAllFiles(assetsRoot, { recursive: false });
    const assetsRoot = await opfs.getAllFiles(defineRoot(`assets`));
    const assets = (
      await Promise.all(
        assetsRoot.map((file) => {
          return file.getOriginFile();
        })
      )
    ).filter((file) => file != undefined);
    allFilesRef.current = assets;
    console.log("files or assets : ", assets);

    // if (assets.length) {
    //   for (const asset of assets) {
    //     asset.blobUrl = URL.createObjectURL(asset.file);
    //   }
    // }
    // allFilesRef.current = assets;
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
      // const inputFiles = files.map((file) => ({
      //   file: file,
      //   id: uniqueID(),
      //   // blobUrl: URL.createObjectURL(file),
      // }));
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
      // const id = toast.loading(<ToastMsgInfo msg={`Uploading...`} />);
      assetsWorker.postMessage({
        command: "uploadAssets",
        props: {
          projectId,
          // toastId: id,
          assets: files,
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

  const deleteAll = async () => {
    // await db.projects.update(projectId, {
    //   assets: [],
    // });
    
    // const toastId = toast.loading(<ToastMsgInfo msg={`Deleting Files...`} />);
    // await opfs.remove({
    //   dirOrFile: await opfs.getFolder(defineRoot(`assets`)),
    // });
    // toast.done(toastId);
    // toast.success(<ToastMsgInfo msg={`All assets deleted successfully`} />);
    assetsWorker.postMessage({
      command:'removeOPFSEntry',
      props:{
        path : defineRoot(`assets`),
        toastMsg : `Deleting Files...`,
      }
    })
  };

  const search = async (value = "") => {
    const newArr = files.filter((asset) => asset.name.includes(value));
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
              <FitTitle className="custom-font-size">Files count</FitTitle>
              <p className="h-full py-1 px-2 bg-slate-900 rounded-lg custom-font-size">
                {files.length}
              </p>
            </article>
            <Hr />
            <article className="font-semibold text-[14px] text-slate-200 flex items-center gap-2">
              <FitTitle className="custom-font-size">Available Space</FitTitle>{" "}
              <p className="h-full py-1 px-2 bg-slate-900 rounded-lg custom-font-size">
                {storageDetails.availableSpaceInMB }
                MB
              </p>{" "}
            </article>
{/* >= MAX_UPLOAD_SIZE
                  ? (
                      MAX_UPLOAD_SIZE -
                      getFilesSize(files.map((file) => file)).MB
                    ).toFixed(2)
                  : (
                      storageDetails.availableSpaceInMB -
                      getFilesSize(files.map((file) => file)).MB
                    ).toFixed(2) */}
            <Hr />

            <article className="font-semibold text-[14px] text-slate-200 flex items-center gap-2">
              <FitTitle className="custom-font-size">Used Space</FitTitle>{" "}
              <p className="h-full py-1 px-2 bg-slate-900 rounded-lg custom-font-size">
                {storageDetails.usedSpace}MB
              </p>{" "}
            </article>

            <Hr />

            <article className="font-semibold text-[14px] text-slate-200 flex items-center gap-2">
              <FitTitle className="custom-font-size">Total Space</FitTitle>{" "}
              <p className="h-full py-1 px-2 bg-slate-900 rounded-lg custom-font-size">
                {storageDetails.projectSpace}
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
              console.log("files from virtuso : ", asset);

              return <FileView asset={asset} />;
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
