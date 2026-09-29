import { wp_get } from "@/Apps/wordpress/functions";
import { current_project_id } from "@/constants/shared";
import { defineRoot } from "@/helpers/bridge";
import {
  doInNormal,
  doInNormalAsync,
  doInWordpress,
  doInWordpressAsync,
  getProjectData,
  getProjectId,
  getProjectSettings,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { assetsType, refType } from "@/helpers/jsDocs";
import { Popover } from "@/components/Editor/Popover";
import { Input } from "@/components/Editor/Protos/Input";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { BusyProvider } from "@/components/Protos/BusyProvider";
import { FileView } from "@/components/Protos/FileView";
import { NoItemsHere } from "@/components/Protos/NoItemsHere";
import { Normal } from "@/components/Protos/Normal";
import { GridComponents } from "@/components/Protos/VirtusoGridComponent";
import { Wordpress } from "@/components/Protos/wordpress/Wordpress";
import { WpFileView } from "@/components/Protos/wordpress/WpFileView";
import { useEditorMaybe } from "@grapesjs/react";
import { isArray } from "lodash";
import React, {
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid } from "react-virtuoso";
import { useWpGetInfinite } from "@/queries/wp.queries";
import { useWordpressAssets } from "@/hooks/useWordpressAssets";
import { useNormalAssets } from "@/hooks/useNormalAssets";
import { Tooltip } from "react-tooltip";
import { ShowIf } from "@/components/ShowIf";
import { OptionsButton } from "@/components/Protos/OptionsButton";

const EMPTY_FILES = [];

const defaultCallback = () => {};

const defaultOnSelect = (files = null) => {};

/**
 * Isolated media popover component.
 * Contains the hooks, loader state, media state, and heavy VirtuosoGrid.
 * It is mounted only when the OptionsButton is clicked.
 */
const MediaPopoverContent = memo(
  ({
    mediaType = "",
    ext = "",
    isCssProp = false,
    allowCheckBox = false,
    checkedFilesState = EMPTY_FILES,
    callback = defaultCallback,
    onSelect = defaultOnSelect,
    onMediaListChange = defaultCallback,
  }) => {
    const [checkedFiles, setCheckedFiles] = useState(checkedFilesState);
    const [mediaForPopover, setMediaForPopover] = useState(null);
    const [showLoader, setShowLoader] = useState(false);

    const [wpQueryParams, setWpQueryParams] = useState({
      per_page: 100,
      page: 1,
      mime_type: mediaType,
    });

    useEffect(() => {
      setWpQueryParams((old) => ({
        ...old,
        mime_type: mediaType,
      }));
    }, [mediaType]);

    const {
      mediaFilesLoading,
      mediaFilesIsFetchingNextPage,
      mediaFilesRefetching,
      mediaFilesHasNextPage,
      mediaFilesFetchNextPage,
    } = useWordpressAssets({
      params: wpQueryParams,
      deps: [mediaType, ext],
      callback(files) {
        if (!files) {
          return;
        }

        setMediaForPopover(files);
      },
    });

    const { loading: normalAssetsLoading } = useNormalAssets({
      deps: [mediaType, ext],

      async callback(files) {
        if (!files) {
          return;
        }

        let assets = files;

        console.log(assets, ext, "before");

        if (mediaType && !ext) {
          if (Array.isArray(mediaType)) {
            assets = assets.filter((file) => {
              console.log(file.type);
              return mediaType.some((type) => file.type.includes(type));
            });
          } else if (typeof mediaType == "string") {
            assets = assets.filter((file) => {
              console.log(file.type);

              return file.type.includes(mediaType);
            });
          }
        }

        if (ext) {
          if (Array.isArray(ext)) {
            assets = assets.filter((file) => {
              console.log(file.type);
              return ext.some((type) => file.name.endsWith(type));
            });
          } else if (typeof ext == "string") {
            assets = assets.filter((file) => {
              console.log(file.type);

              return file.name.endsWith(ext);
            });
          }
        }

        console.log("assets : ", assets);

        setMediaForPopover(assets);
      },
    });

    /**
     * Keep a ref in the parent for the Input lookup,
     * without forcing the parent to re-render.
     */
    useEffect(() => {
      onMediaListChange(mediaForPopover || EMPTY_FILES);
    }, [mediaForPopover, onMediaListChange]);

    useEffect(() => {
      doInNormal(() => {
        if (normalAssetsLoading) {
          setShowLoader(true);
        } else {
          setShowLoader(false);
        }
      });

      doInWordpress(() => {
        if (
          mediaFilesLoading ||
          mediaFilesIsFetchingNextPage ||
          mediaFilesRefetching
        ) {
          setShowLoader(true);
        } else {
          setShowLoader(false);
        }
      });
    }, [
      mediaFilesLoading,
      mediaFilesIsFetchingNextPage,
      mediaFilesRefetching,
      normalAssetsLoading,
    ]);

    const onScrollEnd = useCallback(async () => {
      doInWordpress(() => {
        if (mediaFilesHasNextPage) {
          mediaFilesFetchNextPage();
        }
      });
    }, [mediaFilesHasNextPage, mediaFilesFetchNextPage]);

    return (
      <section className="py-2  w-[600px] h-[500px] bg-surface-secondary rounded-lg overflow-x-hidden overflow-y-auto hideScrollBar">
        <ShowIf condition={!!mediaForPopover?.length && !showLoader}>
          <VirtuosoGrid
            components={GridComponents}
            totalCount={mediaForPopover?.length}
            listClassName="px-2 "
            className="hideScrollBar"
            endReached={onScrollEnd}
            itemContent={(i) => {
              const asset = mediaForPopover[i];

              console.log("assets for media popover", asset);

              return (
                <>
                  <FileView
                    key={i}
                    media={asset}
                    callback={callback}
                    isCssProp={isCssProp}
                    allowCheckBox={allowCheckBox}
                    checked={checkedFiles.some(
                      (item) => item.id === asset.id,
                    )}
                    onChange={(checked) => {
                      const isSelected = checkedFiles.some(
                        (item) => item.id === asset.id,
                      );

                      if (checked && !isSelected) {
                        const newSelected = [...checkedFiles, asset];
                        onSelect(newSelected);
                        setCheckedFiles(newSelected);
                      } else if ((checked && isSelected) || !checked) {
                        const newSelected = checkedFiles.filter(
                          (item) => item.id !== asset.id,
                        );
                        onSelect(newSelected);
                        setCheckedFiles(newSelected);
                      }
                    }}
                    // showOptions={false}
                  />
                </>
              );
            }}
          />
        </ShowIf>

        <ShowIf condition={showLoader}>
          <Loader />
        </ShowIf>

        <ShowIf condition={!mediaForPopover?.length && !showLoader}>
          <NoItemsHere title="No Files Founded..!" />
        </ShowIf>
      </section>
    );
  },
);

/**
 *
 * @param {{
 * placeholder:string,
 * value : string,
 * mediaType: 'audio' | 'video' | 'image',
 * ext:string;
 * isCssProp:boolean;
 * callback:(asset:File , url:string)=>void
 * allowCheckBox : boolean,
 * hideInput  : boolean,
 * checkedFilesState : (import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[],
 * onSelect : (files:(import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[]) => (import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[]
 * }} param0
 * @returns
 */
export const ChooseFile = ({
  placeholder = "",
  value = "",
  mediaType = "",
  ext = "",
  isCssProp = false,
  hideInput = false,
  allowCheckBox = false,
  checkedFilesState = EMPTY_FILES,
  callback = defaultCallback,
  onSelect = defaultOnSelect,
}) => {
  const mediaRef = useRef(refType);

  /**
   * This ref allows the Input to search media without causing re-renders.
   * It is filled by MediaPopoverContent after the popover is opened and media loads.
   */
  const mediaListRef = useRef(EMPTY_FILES);

  /**
   * Mount the heavy popover content only after first click.
   */
  const [isPopoverMounted, setIsPopoverMounted] = useState(false);

  const timeout = useRef();
  const tid = useRef();
  const projectId = getProjectId();
  const buttonId = useId();

  /**
   * Keep latest props in refs to avoid passing unstable functions
   * into the memoized isolated component.
   */
  const callbackRef = useRef(callback);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    callbackRef.current = callback;
    onSelectRef.current = onSelect;
  });

  const stableCallback = useCallback((asset, url) => {
    callbackRef.current?.(asset, url);
  }, []);

  const stableOnSelect = useCallback((files) => {
    onSelectRef.current?.(files);
  }, []);

  const handleMediaListChange = useCallback((files) => {
    mediaListRef.current = files || EMPTY_FILES;
  }, []);

  const handleOpenPopover = useCallback(() => {
    setIsPopoverMounted(true);
  }, []);

  return (
    <section ref={mediaRef} className="flex items-center gap-2 w-full auto-animate">
      <ShowIf condition={!hideInput}>
        <Input
          placeholder={placeholder}
          className="w-full bg-surface-secondary "
          value={value}
          onInput={(ev) => {
            const nextValue = ev.target.value;

            const asset = mediaListRef.current?.find((asset) =>
              nextValue.includes(asset.slug),
            );

            stableCallback(asset, nextValue);
          }}
        />
      </ShowIf>

      <OptionsButton
        className="!bg-surface-tertiary aspect-square"
        icon={<Icons.attachment fill="white" /> }
        onClick={handleOpenPopover}
      >
        {isPopoverMounted && (
          <MediaPopoverContent
            mediaType={mediaType}
            ext={ext}
            isCssProp={isCssProp}
            allowCheckBox={allowCheckBox}
            checkedFilesState={checkedFilesState}
            callback={stableCallback}
            onSelect={stableOnSelect}
            onMediaListChange={handleMediaListChange}
          />
        )}
      </OptionsButton>

      {/* <SmallButton
        // className="p-[unset]"
        id={buttonId}
        onClick={async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          // setShowLoader(true);
          setShowMediaPopover((old) => !old);
          // timeout.current && clearTimeout(timeout.current);
          // timeout.current = setTimeout(async () => {
          //   await doInNormalAsync(async () => {
          //     setMediaForPopover(assets);
          //     setShowLoader(false);
          //   });

          //   await doInWordpressAsync(async () => {
          //     await getWpMedia();
          //   });
          // }, 10);
        }}
      >
        {Icons.gallery("white")}
      </SmallButton> */}

      {/* {showMediaPopover && ( */}
      {/* <Tooltip anchorSelect={`#${buttonId}`}>
        <ShowIf condition={!!mediaForPopover?.length}>
          {() => (
            <section className="py-2  w-[600px] h-[600px]">
              <ShowIf condition={!!mediaForPopover.length && !showLoader}>
                <VirtuosoGrid
                  components={GridComponents}
                  totalCount={mediaForPopover.length}
                  listClassName="px-2"
                  endReached={onScrollEnd}
                  itemContent={(i) => {
                    const asset = mediaForPopover[i];

                    console.log("assets for media popover", asset);

                    return (
                      <>
                        <FileView
                          key={i}
                          media={asset}
                          callback={callback}
                          isCssProp={isCssProp}
                          allowCheckBox={allowCheckBox}
                          checked={checkedFiles.some(
                            (item) => item.id === asset.id,
                          )}
                          onChange={(checked) => {
                            const isSelected = checkedFiles.some(
                              (item) => item.id === asset.id,
                            );

                            if (checked && !isSelected) {
                              const newSelected = [...checkedFiles, asset];
                              onSelect(newSelected);
                              setCheckedFiles(newSelected);
                            } else if ((checked && isSelected) || !checked) {
                              const newSelected = checkedFiles.filter(
                                (item) => item.id !== asset.id,
                              );
                              onSelect(newSelected);
                              setCheckedFiles(newSelected);
                            }
                          }}
                          // showOptions={false}
                        />
                      </>
                    );
                  }}
                />
              </ShowIf>

              <ShowIf condition={showLoader}>
                <Loader />
              </ShowIf>

              <ShowIf condition={!mediaForPopover.length && !showLoader}>
                <NoItemsHere title="No Files Founded..!" />
              </ShowIf>
            </section>
          )}
        </ShowIf>
      </Tooltip> */}

      {/* <Popover
          targetRef={mediaRef}
          width={600}
          height={300}
          isOpen={showMediaPopover}
          setIsOpen={setShowMediaPopover}
          isTextarea
        >
          <section className="py-2 h-full w-full ">
            {!!mediaForPopover.length && !showLoader && (
              <VirtuosoGrid
                components={GridComponents}
                totalCount={mediaForPopover.length}
                listClassName="px-2"
                endReached={onScrollEnd}
                itemContent={(i) => {
                  const asset = mediaForPopover[i];

                  console.log("assets for media popover", asset);

                  return (
                    <>
                      <FileView
                        key={i}
                        media={asset}
                        callback={callback}
                        isCssProp={isCssProp}
                        allowCheckBox={allowCheckBox}
                        checked={checkedFiles.some((item) => item.id === asset.id)}
                        onChange={(checked) => {
                          const isSelected = checkedFiles.some((item) => item.id === asset.id);

                          if (checked && !isSelected) {
                            const newSelected = [...checkedFiles, asset];
                            onSelect(newSelected);
                            setCheckedFiles(newSelected);
                          }else if ((checked && isSelected) || !checked) {
                            const newSelected = checkedFiles.filter((item) => item.id !== asset.id);
                            onSelect(newSelected);
                            setCheckedFiles(newSelected);
                          }
                        }}
                        // showOptions={false}
                      />
                    </>
                  );
                }}
              />
            )}

            {showLoader && <Loader />}

            {!mediaForPopover.length && !showLoader && (
              <NoItemsHere title="No Files Founded..!" />
            )}
          </section>
        </Popover> */}
      {/* )} */}
    </section>
  );
};
// import { wp_get } from "@/Apps/wordpress/functions";
// import { current_project_id } from "@/constants/shared";
// import { defineRoot } from "@/helpers/bridge";
// import {
//   doInNormal,
//   doInNormalAsync,
//   doInWordpress,
//   doInWordpressAsync,
//   getProjectData,
//   getProjectId,
//   getProjectSettings,
// } from "@/helpers/functions";
// import { opfs } from "@/helpers/initOpfs";
// import { assetsType, refType } from "@/helpers/jsDocs";
// import { Popover } from "@/components/Editor/Popover";
// import { Input } from "@/components/Editor/Protos/Input";
// import { SmallButton } from "@/components/Editor/Protos/SmallButton";
// import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
// import { Icons } from "@/components/Icons/Icons";
// import { Loader } from "@/components/Loader";
// import { BusyProvider } from "@/components/Protos/BusyProvider";
// import { FileView } from "@/components/Protos/FileView";
// import { NoItemsHere } from "@/components/Protos/NoItemsHere";
// import { Normal } from "@/components/Protos/Normal";
// import { GridComponents } from "@/components/Protos/VirtusoGridComponent";
// import { Wordpress } from "@/components/Protos/wordpress/Wordpress";
// import { WpFileView } from "@/components/Protos/wordpress/WpFileView";
// import { useEditorMaybe } from "@grapesjs/react";
// import { isArray } from "lodash";
// import React, { useEffect, useId, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import { VirtuosoGrid } from "react-virtuoso";
// import { useWpGetInfinite } from "@/queries/wp.queries";
// import { useWordpressAssets } from "@/hooks/useWordpressAssets";
// import { useNormalAssets } from "@/hooks/useNormalAssets";
// import { Tooltip } from "react-tooltip";
// import { ShowIf } from "@/components/ShowIf";
// import { OptionsButton } from "@/components/Protos/OptionsButton";

// /**
//  *
//  * @param {{
//  * placeholder:string,
//  * value : string,
//  * mediaType: 'audio' | 'video' | 'image',
//  * ext:string;
//  * isCssProp:boolean;
//  * callback:(asset:File , url:string)=>void
//  * allowCheckBox : boolean,
//  * hideInput  : boolean,
//  * checkedFilesState : (import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[],
//  * onSelect : (files:(import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[]) => (import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[]
//  * }} param0
//  * @returns
//  */
// export const ChooseFile = ({
//   placeholder = "",
//   value = "",
//   mediaType = "",
//   ext = "",
//   isCssProp = false,
//   hideInput = false,
//   allowCheckBox = false,
//   checkedFilesState = [],
//   callback = () => {},
//   onSelect = (
//     files = /** @type {(import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[]} */ (
//       null
//     ),
//   ) => {},
// }) => {
//   const mediaRef = useRef(refType);
//   const [checkedFiles, setCheckedFiles] = useState(checkedFilesState);
//   const [showMediaPopover, setShowMediaPopover] = useState(false);
//   const [mediaForPopover, setMediaForPopover] = useState(
//     /** @type {(import("@/helpers/types").InfinitelyAsset & import("@/helpers/types").InfinitelyWpMedia)[]} */ (
//       null
//     ),
//   );
//   const [showLoader, setShowLoader] = useState(false);
//   const timeout = useRef();
//   const [wpQueryParams, setWpQueryParams] = useState({
//     per_page: 100,
//     page: 1,
//     mime_type: mediaType,
//   });
//   const tid = useRef();
//   const projectId = getProjectId();
//   // const editor = useEditorMaybe();

//   const {
//     mediaFilesLoading,
//     mediaFilesIsFetchingNextPage,
//     mediaFilesRefetching,
//     mediaFilesHasNextPage,
//     mediaFilesFetchNextPage,
//   } = useWordpressAssets({
//     params: wpQueryParams,
//     deps: [mediaType, ext, showMediaPopover],
//     callback(files) {
//       if (!files) {
//         return;
//       }
//       setMediaForPopover(files);
//     },
//   });

//   const { loading: normalAssetsLoading } = useNormalAssets({
//     deps: [mediaType, ext, showMediaPopover],

//     async callback(files) {
//       if (!files) {
//         return;
//       }
//       let assets = files;
//       // const clone = [...assets];
//       console.log(assets, ext, "before");

//       if (mediaType && !ext) {
//         if (Array.isArray(mediaType)) {
//           assets = assets.filter((file) => {
//             console.log(file.type);
//             return mediaType.some((type) => file.type.includes(type));
//           });
//         } else if (typeof mediaType == "string") {
//           assets = assets.filter((file) => {
//             console.log(file.type);

//             return file.type.includes(mediaType);
//           });
//         }
//       }

//       if (ext) {
//         if (Array.isArray(ext)) {
//           assets = assets.filter((file) => {
//             console.log(file.type);
//             return ext.some((type) => file.name.endsWith(type));
//           });
//         } else if (typeof ext == "string") {
//           assets = assets.filter((file) => {
//             console.log(file.type);

//             return file.name.endsWith(ext);
//           });
//         }
//       }
//       console.log("assets : ", assets);
//       setMediaForPopover(files);
//     },
//   });

//   useEffect(() => {
//     doInNormal(() => {
//       if (normalAssetsLoading) {
//         setShowLoader(true);
//       } else {
//         setShowLoader(false);
//       }
//     });

//     doInWordpress(() => {
//       if (
//         mediaFilesLoading ||
//         mediaFilesIsFetchingNextPage ||
//         mediaFilesRefetching
//       ) {
//         setShowLoader(true);
//       } else {
//         setShowLoader(false);
//       }
//     });
//   }, [
//     mediaFilesLoading,
//     mediaFilesIsFetchingNextPage,
//     mediaFilesRefetching,
//     normalAssetsLoading,
//   ]);

//   const onScrollEnd = async () => {
//     doInWordpress(() => {
//       if (mediaFilesHasNextPage) {
//         mediaFilesFetchNextPage();
//       }
//     });
//   };

//   const buttonId = useId();
//   return (
//     <section ref={mediaRef} className="flex gap-2 w-full auto-animate">
//       <ShowIf condition={!hideInput}>
//         <Input
//           placeholder={placeholder}
//           className="w-full bg-surface-secondary "
//           value={value}
//           onInput={(ev) => {
//             const value = ev.target.value;
//             const asset = mediaForPopover.find((asset) =>
//               value.includes(asset.slug),
//             );
//             callback(asset, ev.target.value);
//           }}
//         />
//       </ShowIf>

//       <OptionsButton
//         className="!bg-surface-tertiary aspect-square"
//         icon={() => <Icons.attachment fill="white" />}
//       >
//         <section className="py-2  w-[600px] h-[500px] bg-surface-secondary rounded-lg overflow-x-hidden overflow-y-auto hideScrollBar">
//           <ShowIf condition={!!mediaForPopover?.length && !showLoader}>
//             <VirtuosoGrid
//               components={GridComponents}
//               totalCount={mediaForPopover?.length}
//               listClassName="px-2"
//               endReached={onScrollEnd}
//               itemContent={(i) => {
//                 const asset = mediaForPopover[i];

//                 console.log("assets for media popover", asset);

//                 return (
//                   <>
//                     <FileView
//                       key={i}
//                       media={asset}
//                       callback={callback}
//                       isCssProp={isCssProp}
//                       allowCheckBox={allowCheckBox}
//                       checked={checkedFiles.some(
//                         (item) => item.id === asset.id,
//                       )}
//                       onChange={(checked) => {
//                         const isSelected = checkedFiles.some(
//                           (item) => item.id === asset.id,
//                         );

//                         if (checked && !isSelected) {
//                           const newSelected = [...checkedFiles, asset];
//                           onSelect(newSelected);
//                           setCheckedFiles(newSelected);
//                         } else if ((checked && isSelected) || !checked) {
//                           const newSelected = checkedFiles.filter(
//                             (item) => item.id !== asset.id,
//                           );
//                           onSelect(newSelected);
//                           setCheckedFiles(newSelected);
//                         }
//                       }}
//                       // showOptions={false}
//                     />
//                   </>
//                 );
//               }}
//             />
//           </ShowIf>

//           <ShowIf condition={showLoader}>
//             <Loader />
//           </ShowIf>

//           <ShowIf condition={!mediaForPopover?.length && !showLoader}>
//             <NoItemsHere title="No Files Founded..!" />
//           </ShowIf>
//         </section>
//       </OptionsButton>

//       {/* <SmallButton
//         // className="p-[unset]"
//         id={buttonId}
//         onClick={async (ev) => {
//           ev.preventDefault();
//           ev.stopPropagation();
//           // setShowLoader(true);
//           setShowMediaPopover((old) => !old);
//           // timeout.current && clearTimeout(timeout.current);
//           // timeout.current = setTimeout(async () => {
//           //   await doInNormalAsync(async () => {
//           //     setMediaForPopover(assets);
//           //     setShowLoader(false);
//           //   });

//           //   await doInWordpressAsync(async () => {
//           //     await getWpMedia();
//           //   });
//           // }, 10);
//         }}
//       >
//         {Icons.gallery("white")}
//       </SmallButton> */}

//       {/* {showMediaPopover && ( */}
//       {/* <Tooltip anchorSelect={`#${buttonId}`}>
//         <ShowIf condition={!!mediaForPopover?.length}>
//           {() => (
//             <section className="py-2  w-[600px] h-[600px]">
//               <ShowIf condition={!!mediaForPopover.length && !showLoader}>
//                 <VirtuosoGrid
//                   components={GridComponents}
//                   totalCount={mediaForPopover.length}
//                   listClassName="px-2"
//                   endReached={onScrollEnd}
//                   itemContent={(i) => {
//                     const asset = mediaForPopover[i];

//                     console.log("assets for media popover", asset);

//                     return (
//                       <>
//                         <FileView
//                           key={i}
//                           media={asset}
//                           callback={callback}
//                           isCssProp={isCssProp}
//                           allowCheckBox={allowCheckBox}
//                           checked={checkedFiles.some(
//                             (item) => item.id === asset.id,
//                           )}
//                           onChange={(checked) => {
//                             const isSelected = checkedFiles.some(
//                               (item) => item.id === asset.id,
//                             );

//                             if (checked && !isSelected) {
//                               const newSelected = [...checkedFiles, asset];
//                               onSelect(newSelected);
//                               setCheckedFiles(newSelected);
//                             } else if ((checked && isSelected) || !checked) {
//                               const newSelected = checkedFiles.filter(
//                                 (item) => item.id !== asset.id,
//                               );
//                               onSelect(newSelected);
//                               setCheckedFiles(newSelected);
//                             }
//                           }}
//                           // showOptions={false}
//                         />
//                       </>
//                     );
//                   }}
//                 />
//               </ShowIf>

//               <ShowIf condition={showLoader}>
//                 <Loader />
//               </ShowIf>

//               <ShowIf condition={!mediaForPopover.length && !showLoader}>
//                 <NoItemsHere title="No Files Founded..!" />
//               </ShowIf>
//             </section>
//           )}
//         </ShowIf>
//       </Tooltip> */}
//       {/* <Popover
//           targetRef={mediaRef}
//           width={600}
//           height={300}
//           isOpen={showMediaPopover}
//           setIsOpen={setShowMediaPopover}
//           isTextarea
//         >
//           <section className="py-2 h-full w-full ">
//             {!!mediaForPopover.length && !showLoader && (
//               <VirtuosoGrid
//                 components={GridComponents}
//                 totalCount={mediaForPopover.length}
//                 listClassName="px-2"
//                 endReached={onScrollEnd}
//                 itemContent={(i) => {
//                   const asset = mediaForPopover[i];

//                   console.log("assets for media popover", asset);

//                   return (
//                     <>
//                       <FileView
//                         key={i}
//                         media={asset}
//                         callback={callback}
//                         isCssProp={isCssProp}
//                         allowCheckBox={allowCheckBox}
//                         checked={checkedFiles.some((item) => item.id === asset.id)}
//                         onChange={(checked) => {
//                           const isSelected = checkedFiles.some((item) => item.id === asset.id);

//                           if (checked && !isSelected) {
//                             const newSelected = [...checkedFiles, asset];
//                             onSelect(newSelected);
//                             setCheckedFiles(newSelected);
//                           }else if ((checked && isSelected) || !checked) {
//                             const newSelected = checkedFiles.filter((item) => item.id !== asset.id);
//                             onSelect(newSelected);
//                             setCheckedFiles(newSelected);
//                           }
//                         }}
//                         // showOptions={false}
//                       />
//                     </>
//                   );
//                 }}
//               />
//             )}

//             {showLoader && <Loader />}

//             {!mediaForPopover.length && !showLoader && (
//               <NoItemsHere title="No Files Founded..!" />
//             )}
//           </section>
//         </Popover> */}
//       {/* )} */}
//     </section>
//   );
// };
