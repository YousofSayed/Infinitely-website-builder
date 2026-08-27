import noData from "@/assets/images/no-data.svg";
import { config } from "@/config/brand";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import {
  current_page_id,
  current_project_id,
  inf_build_url,
  inf_css_urls,
  MAX_UPLOAD_SIZE,
} from "@/constants/shared";
import {
  assetTypeState,
  cssPropForAssetsManagerState,
  projectData,
  ruleState,
  selectorState,
} from "@/helpers/atoms";
import {
  blobToDataUrlAndClean,
  cleanMotions,
  defineRoot,
  getFileSize,
  getFilesSize,
  getStorageDetails,
} from "@/helpers/bridge";
import { addClickClass, uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { assetsWorker } from "@/helpers/defineWorkers";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { storageDetailsType } from "@/helpers/jsDocs";
import { useSetClassForCurrentEl } from "@/hooks/useSetclassForCurrentEl";
import { initDBAssetsSw } from "@/serviceWorkers/initDBAssets-sw";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Protos/Button";
import { FileView } from "@/components/Protos/FileView";
import { Hr } from "@/components/Protos/Hr";
import { NoItemsHere } from "@/components/Protos/NoItemsHere";
import { P } from "@/components/Protos/P";
import { GridComponents } from "@/components/Protos/VirtusoGridComponent";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import React, { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid } from "react-virtuoso";
import { useRecoilValue, useSetRecoilState } from "recoil";

/**
 *
 * @param {{editor: import('grapesjs').Editor}} param0
 * @returns
 */
export const AssetsManager = () => {
  /**
   * @type {import('@/helpers/types').InfinitelyAsset[]}
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
            className="h-full shrink-0 bg-surface-secondary hover:bg-[crimson!important]"
            onClick={() => {
              deleteAll();
            }}
          >
            {Icons.trash("white")}
          </SmallButton>

          <SmallButton
            className="h-full shrink-0 bg-surface-secondary"
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
