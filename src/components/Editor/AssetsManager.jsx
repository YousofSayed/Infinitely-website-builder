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
import { useLiveQuery } from "dexie-react-hooks";
import {
  current_page_id,
  current_project_id,
  inf_build_url,
  inf_css_urls,
  MAX_UPLOAD_SIZE,
} from "../../constants/shared";
import { db } from "../../helpers/db";
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
import { config } from "../../brand";
import { NoItemsHere } from "../Protos/NoItemsHere";

/**
 *
 * @param {{editor: import('grapesjs').Editor}} param0
 * @returns
 */
export const AssetsManager = () => {
  /**
   * @type {import('../../helpers/types').InfinitelyAsset[]}
   */
  const filesType = [];
  const editor = useEditorMaybe();
  const [warn, setWarn] = useState("");
  const [files, setFiles] = useState(filesType);

  const projectId = +localStorage.getItem(current_project_id);
  const allFilesRef = useRef(filesType);

  const [showLoader, setShowLoader] = useState(true);
  const [storageDetails, setStorageDetails] = useState(storageDetailsType);
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
        const init = initDBAssetsSw(() => { });
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


      setFiles(assets);
    };

    const cleaner1 = opfs.on("all", getFilesCb);

    const cleaner2 = opfs.onBroadcast("all", getFilesCb);

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



      const filesSize = getFilesSize(files);
      console.log(filesSize.MB, filesSize.GB);

      assetsWorker.postMessage({
        command: "uploadAssets",
        props: {
          projectId,
          // toastId: id,
          assets: files,
        },
      });

    } catch (error) {
      console.error(`Assets Manager : ${error}`);

      toast.error(<ToastMsgInfo msg={`Files upload failed`} />);
    } finally {
      // setShowLoader(false);
      ev.target.value = "";
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
      command: "removeOPFSEntry",
      props: {
        path: defineRoot(`assets`),
        toastMsg: `Deleting Files...`,
      },
    });
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
    <main className="w-full h-full">
      <section className=" w-full h-full m-auto  rounded-lg overflow-hidden flex flex-col gap-2">
        <header className="h-[50px!important] flex justify-between items-center gap-2 p-2  overflow-hidden  rounded-lg  bg-surface-tertiary ">
          <figure>
            {/* {Icons.logo({ width: 38 })} */}
            <img src={config.logo} alt="logo" />
          </figure>
          {warn && (
            <p className="font-semibold text-xl bg-red-700 p-2 rounded-lg">
              {warn}
            </p>
          )}
          <Input
            placeholder="Search..."
            className="w-full h-full bg-surface-secondary"
            onInput={(ev) => {
              search(ev.target.value);
            }}
          />

          <SmallButton
            title="Delete All"
            className="h-full flex-shrink-0 bg-surface-secondary hover:bg-[crimson!important]"
            onClick={() => {
              deleteAll();
            }}
          >
            {Icons.trash("white")}
          </SmallButton>

          <SmallButton
            className="h-full flex-shrink-0 bg-surface-secondary"
            title={"Upload"}
            onClick={openUploader}
          // className="py-[7.5px] px-[30px]  font-bold text-lg"
          >
            {Icons.upload({ strokeColor: "white" })}
          </SmallButton>
        </header>

        {!!files.length && (
          <section className=" flex items-center justify-between p-2 rounded-lg bg-surface-tertiary">
            <article className="font-semibold text-[14px] text-text-primary flex items-center gap-2">
              <FitTitle className="custom-font-size">Files count</FitTitle>
              <p className="h-full py-1 px-2 bg-surface-secondary rounded-lg custom-font-size">
                {files.length}
              </p>
            </article>
            <Hr />
            <article className="font-semibold text-[14px] text-text-primary flex items-center gap-2">
              <FitTitle className="custom-font-size">Available Space</FitTitle>{" "}
              <p className="h-full py-1 px-2 bg-surface-secondary rounded-lg custom-font-size">
                {storageDetails.availableSpaceInMB}
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

            <article className="font-semibold text-[14px] text-text-primary flex items-center gap-2">
              <FitTitle className="custom-font-size">Used Space</FitTitle>{" "}
              <p className="h-full py-1 px-2 bg-surface-secondary rounded-lg custom-font-size">
                {storageDetails.usedSpace}MB
              </p>{" "}
            </article>

            <Hr />

            <article className="font-semibold text-[14px] text-text-primary flex items-center gap-2">
              <FitTitle className="custom-font-size">Total Space</FitTitle>{" "}
              <p className="h-full py-1 px-2 bg-surface-secondary rounded-lg custom-font-size">
                {storageDetails.projectSpace}
                MB
              </p>{" "}
            </article>
          </section>
        )}

        {/* <section
          className={`w-full h-full  bg-gray-950 rounded-lg p-2 overflow-auto grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]  justify-start gap-[15px] `}
        >
          {Boolean(files.length) && (
            <For each={files} memo>
              {(asset, i) => {
                console.log("files from virtuso : ", asset);

                return <FileView key={i} asset={asset} />;
              }}
            </For>
          )}
        </section> */}
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
            listClassName={`${files.length > 3 ? " pr-2" : ""}`}
            itemContent={(index) => {
              const i = index,
                asset = files[index];
              console.log("files from virtuso : ", asset);

              return <FileView asset={asset} />;
            }}
          />
        )}

        {!files.length && !showLoader && (
          <NoItemsHere title={`No assets found`} />
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
};

// console.log(encodeURI(`WhatsApp Vido 2025-04-09 at 6.37.02 AM.mp4`) == 'whatsapp%20video%202025-04-09%20at%206.37.02%20am.mp4');
