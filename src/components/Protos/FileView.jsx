import {
  wp_delete_media_files_by_slugs,
  wp_get_blob_media_by_slug,
} from "@/Apps/wordpress/functions";
import { current_project_id } from "@/constants/shared";
import { assetsWorker, pageBuilderWorker } from "@/helpers/defineWorkers";
import {
  callWorkerCommand,
  doInNormalAsync,
  doInWordpressAsync,
  downloadFile,
  getProjectId,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { refType } from "@/helpers/jsDocs";
import { useFileViewTitleResizer } from "@/hooks/useFileViewTitleResizer";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { Icons } from "@/components/Icons/Icons";
import { useBusy } from "@/components/Protos/BusyProvider";
import { Checkbox } from "@/components/Protos/Checkbox";
import { OptionsButton } from "@/components/Protos/OptionsButton";
import { useEditorMaybe } from "@grapesjs/react";
import { isArray, isFunction } from "lodash";
import React, { useRef, useState } from "react";
import mime from "mime";
import { defineRoot, toMB } from "@/helpers/bridge";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { useBusyCallback, useTasksState } from "@/hooks/useBusyCallback";
import {
  File_View_keys,
  Media_Manager_keys,
} from "@/constants/globalTasksKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useWpGetInfinite } from "@/queries/wp.queries";
import { Wordpress } from "@/components/Protos/wordpress/Wordpress";
import { Normal } from "@/components/Protos/Normal";
import { opfs } from "@/helpers/initOpfs";

/**
 *
 * @param {{
 * media : import('@/helpers/types').InfinitelyWpMedia & import("@/helpers/types").InfinitelyNormalMedia,
 *  showOptions : boolean,
 *  callback : (media : import('@/helpers/types').InfinitelyWpMedia , url : string)=>void,
 *  checked : boolean,
 *  onChange : (checked : boolean) => void,
 *  allowCheckBox : boolean,
 *  setData : () => void,
 *  showOptions : boolean,
 *
 * }} param0
 * @returns
 */
export const FileView = ({
  media,
  showOptions = true,
  callback,
  setData,
  allowCheckBox = false,
  checked,
  onChange,
}) => {
  const mediaType =
    mime.getType(media.source_url) ||
    media.media_type ||
    "application/octet-stream";
  const fileNameRef = useRef(refType);
  const { isBusy, runWithBusy } = useBusy();
  const editor = useEditorMaybe();
  const [showFilNameTooltib, setShowFileNameTooltib] = useState(false);
  const projectId = +localStorage.getItem(current_project_id);
  const { isLoading: isMediaManagerBusy } = useTasksState(
    Object.values(Media_Manager_keys),
  );
  const qc = useQueryClient();
  const {
    // data: mediaFilesData,
    isLoading: mediaFilesLoading,
    isRefetching: mediaFilesRefetching,
    // fetchNextPage: mediaFilesFetchNextPage,
    isFetchingNextPage: mediaFilesIsFetchingNextPage,
    // hasNextPage: mediaFilesHasNextPage,
  } = useWpGetInfinite("media");

  useFileViewTitleResizer(fileNameRef, setShowFileNameTooltib);

  const onItemClicked = async(ev, asset) => {
    ev.stopPropagation();
    await callback(asset, asset.source_url);
  };

  const [deleteMedia, { isLoading: isDeleting }] = useBusyCallback(
    async (e) => {
      e.stopPropagation();
      const tid = toast.loading(
        <ToastMsgInfo msg={`Deleting ${media.slug}...`} />,
      );

      await doInNormalAsync(async () => {
        try {
          await opfs.remove({
            dirOrFile: await opfs.getFile(defineRoot(media.path)),
          });
          toast.done(tid);
          toast.success(
            <ToastMsgInfo msg={`${media.slug} deleted successfully`} />,
          );
        } catch (error) {
          toast.dismiss(tid);
          toast.error(<ToastMsgInfo msg={`Failed to delete ${media.slug}`} />);
          console.error(error);
          throw error;
        }
      });

      await doInWordpressAsync(async () => {
        const cnfrm = confirm(
          `Are you sure you want to delete ${media.slug} ?`,
        );
        if (!cnfrm) {
          return;
        }

        try {
          const res = await callWorkerCommand(
            assetsWorker,
            "wp_delete_media_files_by_slugs",
            {
              projectId,
              slugs: [media.slug],
            },
          );

          await qc.invalidateQueries({
            queryKey: ["wp_get_infinite", "media", getProjectId()],
            refetchType: "all",
          });

          if (!res.success) {
            // toast.dismiss(tid);
            // toast.error(<ToastMsgInfo msg={`Failed to delete ${media.slug}`} />);
            throw new Error(`Failed to delete ${media.slug} 😶`);
          }
          toast.done(tid);
          toast.success(
            <ToastMsgInfo msg={`${media.slug} deleted successfully`} />,
          );
        } catch (error) {
          toast.dismiss(tid);
          toast.error(<ToastMsgInfo msg={`Failed to delete ${media.slug}`} />);
          console.error(error);
          throw error;
        }
      });

      isFunction(setData) && setData(media);
    },
    { key: File_View_keys.delete },
  );

  const [downloadMedia, { isLoading: isDownloading }] = useBusyCallback(
    async (e) => {
      e.stopPropagation();
      const tid = toast.loading(
        <ToastMsgInfo msg={`Downloading ${media.slug}...`} />,
      );

      await doInNormalAsync(async () => {
        try {
          const file = await (
            await opfs.getFile(defineRoot(media.path))
          ).getOriginFile();

          downloadFile({
            filename: file.name,
            content: file,
            mimeType: file.type,
          });

          toast.dismiss(tid);
          toast.success(
            <ToastMsgInfo msg={`${media.slug} downloaded successfully`} />,
          );
        } catch (error) {
          toast.dismiss(tid);
          toast.error(
            <ToastMsgInfo msg={`Failed to download ${media.slug}`} />,
          );
          throw error;
        }
      });

      await doInWordpressAsync(async () => {
        try {
          const res = await callWorkerCommand(
            assetsWorker,
            "wp_get_blob_media_by_slug",
            {
              media,
              projectId,
            },
          );

          if (!(res instanceof Blob)) {
            toast.dismiss(tid);
            toast.error(
              <ToastMsgInfo msg={`Failed to download ${media.slug}`} />,
            );
            throw new Error(`Failed to download ${media.slug}`);
          }

          const blob = res;

          await downloadFile({
            filename: media.slug,
            content: blob,
            mimeType: blob.type,
          });
          // const url = URL.createObjectURL(blob);
          // const link = document.createElement("a");
          // link.href = url;
          // const fileName = media.source_url.split("/").pop();
          // link.download = fileName;
          // document.body.appendChild(link);
          // link.click();
          // document.body.removeChild(link);
          // URL.revokeObjectURL(url);
          toast.dismiss(tid);
          toast.success(
            <ToastMsgInfo msg={`${media.slug} downloaded successfully`} />,
          );
        } catch (error) {
          toast.dismiss(tid);
          toast.error(
            <ToastMsgInfo msg={`Failed to download ${media.slug}`} />,
          );
          throw error;
        }
      });
    },
  );

  const copyLink = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(media.source_url);
    toast.success(<ToastMsgInfo msg={`link coppied`} />);
  };

  const isDisabled =
    isDeleting ||
    isMediaManagerBusy ||
    isDownloading ||
    mediaFilesIsFetchingNextPage ||
    mediaFilesLoading ||
    mediaFilesRefetching;

  return (
    <section
      className={`group  animate-go-to relative rounded-lg p-3 bg-surface-tertiary  flex flex-col justify-center items-center gap-2`}
    >
      <FitTitle className="absolute left-0 top-0 z-[100] ">
        <Normal>{toMB(media.size, 3)}MB</Normal>
        <Wordpress>{toMB(media?.media_details?.filesize, 3)}MB</Wordpress>
      </FitTitle>
      {/* <button
                onClick={(ev) => {
                    deleteMedia(media);
                }}
                className="absolute group-hover:flex z-[200] right-0 top-0 bg-brand-primary fill-white cursor-pointer hidden justify-center items-center rounded-full w-[23px] h-[23px]"
            >
                {Icons.close("white", 1.5)}
            </button> */}
      {allowCheckBox && (
        <Checkbox
          className="absolute right-1 top-1 z-[200] py-2"
          checked={checked}
          onChange={onChange}
        />
      )}
      {/* <OptionsButton className='absolute right-1 top-1 z-[200] h-[23px] w-[23px] rotate-90' /> */}
      <figure
        onDoubleClick={(ev) => {
          ev.stopPropagation();
          onItemClicked(ev, media);
        }}
        className=" p-2 h-[150px]  cursor-pointer rounded-lg  bg-surface-tertiary"
      >
        {(mediaType.includes("video") && (
          <section>
            <video
              className="w-full  h-[140px] max-h-full max-w-full "
              onPointerEnter={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                ev.currentTarget.play();
                console.log("play");
              }}
              onPointerLeave={(ev) => {
                ev.currentTarget.pause();
              }}
              onDoubleClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                console.log("dbplay");
                onItemClicked(ev, media);
              }}
              // autoPlay={true}
              onLoadedData={(ev) => {
                // console.log('loaded ............');
                const videoEl = ev.currentTarget;
                videoEl.play();
                setTimeout(() => {
                  videoEl.pause();
                }, 10);
              }}
              preload="auto"
              muted={true}
              poster=""
              src={media.source_url}
            ></video>
          </section>
        )) ||
          (mediaType.includes("audio") && (
            <section className="h-full flex justify-between gap-2 items-center flex-col bg-surface-secondary rounded-lg overflow-hidden pt-2">
              {Icons.headphone("white", undefined, 75, 75)}
              <audio
                onClick={(ev) => onItemClicked(ev, media)}
                className="w-full"
                src={media.source_url}
                controls={true}
              ></audio>
            </section>
          )) ||
          (mediaType.includes("image") && (
            <img
              // onLoad={(ev) => {
              //   console.log("image load...");
              // }}
              // loading="lazy"
              // style={{
              //   willChange:'transform',
              //   zIndex:'-1'
              // }}
              onClick={(ev) => onItemClicked(ev, media)}
              className="w-full h-full object-contain "
              src={media.source_url}
            ></img>
          ))}

        {!/image|audio|video/gi.test(mediaType) &&
          Icons.file({ fill: "white", width: 130, height: 130 })}
      </figure>
      <p
        tooltib-id={media.slug}
        ref={fileNameRef}
        title={media.slug}
        className="text-text-primary p-2 bg-surface-secondary rounded-md text-ellipsis  max-w-full   text-nowrap overflow-hidden "
      >
        {media.slug}
      </p>
      {showFilNameTooltib && (
        <Tooltip
          anchorSelect={`[tooltib-id="${media.slug}"]`}
          place="bottom-end"
          opacity={1}
          className="shadow-sm shadow-slate-950 z-[1001]"
          positionStrategy="fixed"
        >
          {media.slug}
        </Tooltip>
      )}

      {showOptions && (
        <section className="flex items-center  gap-6 justify-between p-2  rounded-lg bg-surface-secondary w-fit">
          <SmallButton
            className="!w-[35px] !h-[35px] !bg-surface-tertiary"
            // disabled={isDisabled}
            tooltipTitle="Copy link"
            onClick={copyLink}
          >
            {Icons.copy({ fill: "white" })}
          </SmallButton>

          <SmallButton
            className="!w-[35px] !h-[35px] !bg-surface-tertiary"
            disabled={isDisabled}
            tooltipTitle="Download file"
            onClick={downloadMedia}
          >
            {Icons.export("white")}
          </SmallButton>

          <SmallButton
            className="!w-[35px] !h-[35px] !bg-surface-tertiary hover:bg-[crimson!important] "
            disabled={isDisabled}
            tooltipTitle="Delete file"
            tooltipClassName="bg-[crimson!important]"
            onClick={deleteMedia}
          >
            {Icons.trash("white")}
          </SmallButton>
        </section>
      )}
    </section>
  );
};

// import {
//   current_page_id,
//   current_project_id,
//   file_deleted_success_msg,
// } from "@/constants/shared";
// import { defineRoot, getFileSize, toMB } from "@/helpers/bridge";
// import { addClickClass } from "@/helpers/cocktail";
// import { db } from "@/helpers/db";
// import {
//   getProjectData,
//   getProjectSettings,
//   isOverflowedHiddenEl,
// } from "@/helpers/functions";
// import { opfs } from "@/helpers/initOpfs";
// import { assetType, refType } from "@/helpers/jsDocs";
// import { FitTitle } from "@/components/Editor/Protos/FitTitle";
// import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
// import { Icons } from "@/components/Icons/Icons";
// import { useEditorMaybe } from "@grapesjs/react";
// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import { Tooltip } from "react-tooltip";

// export const FileView = ({
//   asset = assetType,
//   callback = (asset = assetType, url = "") => { },
//   isCssProp = false,
// }) => {
//   const editor = useEditorMaybe();
//   const projectId = +localStorage.getItem(current_project_id);
//   const fileNameRef = useRef(refType);
//   const [showFilNameTooltib, setShowFileNameTooltib] = useState(false);
//   useLayoutEffect(() => {
//     if (!fileNameRef || !fileNameRef.current) return;
//     const handler = (el) => {
//       const isOverflowHidden = isOverflowedHiddenEl(fileNameRef.current);
//       setShowFileNameTooltib(isOverflowHidden);
//     };
//     handler(fileNameRef.current);
//     const resizerObserver = new ResizeObserver((entries) => {
//       entries.forEach((entry) => handler(entry.target));
//     });

//     return () => {
//       resizerObserver.disconnect();
//     };
//   }, [fileNameRef, fileNameRef.current]);

//   /**
//    *
//    * @param {MouseEvent} ev
//    * @param {File} asset
//    */
//   const onItemClicked = async (ev, asset) => {
//     ev.stopPropagation();
//     ev.preventDefault();
//     addClickClass(ev.target, "click");
//     const selectedEl = editor.getSelected();
//     if (!selectedEl) {
//       toast.warn(<ToastMsgInfo msg={`Please select element`} />);
//       return;
//     }

//     const el = editor.getSelected().getEl();
//     const tagName = el.tagName.toLowerCase();

//     const pageName = localStorage.getItem(current_page_id);
//     const isIndex = pageName.toLowerCase() == "index";
//     const src = isCssProp
//       ? `../assets/${asset.name}`
//       : `${isIndex ? "." : ".."}/assets/${asset.name}`;

//     callback(asset, src);
//   };

//   const deleteAsset = async () => {

//     await opfs.removeFiles([defineRoot(`assets/${asset.name}`)]);
//     toast.success(<ToastMsgInfo msg={file_deleted_success_msg} />);
//   };


//   return (
//     <section

//       className={`group   relative rounded-lg p-3 bg-surface-tertiary  flex flex-col justify-center items-center gap-2`}
//     >
//       <FitTitle className="absolute left-0 top-0 z-[100] ">
//         {toMB(asset.size, 3)}MB
//       </FitTitle>
//       <button
//         onClick={(ev) => {
//           deleteAsset(asset);
//         }}
//         className="absolute group-hover:flex z-[200] right-0 top-0 bg-brand-primary fill-white cursor-pointer hidden justify-center items-center rounded-full w-[23px] h-[23px]"
//       >
//         {/* <Icons.close /> */}
//         {Icons.close("white", 1.5)}
//       </button>
//       <figure
//         onDoubleClick={(ev) => {
//           ev.stopPropagation();
//           onItemClicked(ev, asset);
//         }}
//         className=" p-2 h-[150px]  cursor-pointer rounded-lg  bg-surface-tertiary"
//       >
//         {(asset.type.includes("video") && (
//           <section>
//             <video
//               className="w-full  h-[140px] max-h-full max-w-full "
//               onPointerEnter={(ev) => {
//                 ev.stopPropagation();
//                 ev.preventDefault();
//                 ev.currentTarget.play();
//                 console.log("play");
//               }}
//               onPointerLeave={(ev) => {
//                 ev.currentTarget.pause();
//               }}
//               onDoubleClick={(ev) => {
//                 ev.preventDefault();
//                 ev.stopPropagation();
//                 console.log("dbplay");
//                 onItemClicked(ev, asset);
//               }}
//               // autoPlay={true}
//               preload="none"
//               muted={true}
//               poster=""
//               src={`/assets/${asset.name}`}
//             ></video>
//           </section>
//         )) ||
//           (asset.type.includes("audio") && (
//             <section className="h-full flex justify-between gap-2 items-center flex-col bg-surface-secondary rounded-lg overflow-hidden pt-2">
//               {Icons.headphone("white", undefined, 75, 75)}
//               <audio
//                 onClick={(ev) => onItemClicked(ev, asset)}
//                 className="w-full"
//                 src={`/assets/${asset.name}`}
//                 controls={true}
//               ></audio>
//             </section>
//           )) ||
//           (asset.type.includes("image") && (
//             <img
//               // onLoad={(ev) => {
//               //   console.log("image load...");
//               // }}
//               loading="lazy"
//               // style={{
//               //   willChange:'transform',
//               //   zIndex:'-1'
//               // }}
//               onClick={(ev) => onItemClicked(ev, asset)}
//               className="w-full h-full object-contain "
//               src={`/assets/${asset.name}`}
//             ></img>
//           ))}

//         {!/image|audio|video/gi.test(asset.type) &&
//           Icons.file({ fill: "white", width: 130, height: 130 })}
//       </figure>
//       <p
//         tooltib-id={asset.name}
//         ref={fileNameRef}
//         title={asset.name}
//         className="text-text-primary p-2 bg-surface-secondary rounded-md text-ellipsis  max-w-full   text-nowrap overflow-hidden "
//       >
//         {asset.name}
//       </p>
//       {showFilNameTooltib && (
//         <Tooltip
//           anchorSelect={`[tooltib-id="${asset.name}"]`}
//           place="bottom-end"
//           opacity={1}
//           className="shadow-sm shadow-slate-950 z-[1001]"
//           positionStrategy="fixed"
//         >
//           {asset.name}
//         </Tooltip>
//       )}
//     </section>
//   );
// };
