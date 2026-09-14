import {
  wp_delete_media_files_by_slugs,
  wp_get,
  wp_upload_multiple_files,
} from "@/Apps/wordpress/functions";
import { current_project_id } from "@/constants/shared";
import { defineRoot, toMB } from "@/helpers/bridge";
import { assetsWorker, pageBuilderWorker } from "@/helpers/defineWorkers";
import {
  callWorkerCommand,
  doInNormal,
  doInNormalAsync,
  doInWordpress,
  doInWordpressAsync,
  getCurrentPageName,
  getProjectData,
  getProjectId,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { BusyProvider, useBusy } from "@/components/Protos/BusyProvider";
import { NoItemsHere } from "@/components/Protos/NoItemsHere";
import { GridComponents } from "@/components/Protos/VirtusoGridComponent";
import { WpFileView } from "@/components/Protos/wordpress/WpFileView";
import { Input } from "@/components/Editor/Protos/Input";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { isArray, set, uniqueId } from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { config } from "@/config/brand";
import { toast } from "react-toastify";
import { VirtuosoGrid } from "react-virtuoso";
import { useWpGetInfinite } from "@/queries/wp.queries";
import { useBusyCallback, useTasksState } from "@/hooks/useBusyCallback";
import { useQueryClient } from "@tanstack/react-query";
import { useWordpress } from "@/hooks/useWordpress";
import {
  File_View_keys,
  Media_Manager_keys,
} from "@/constants/globalTasksKeys";
import { useNormal } from "@/hooks/useNormal";
import { opfs } from "@/helpers/initOpfs";
import Fuse from "fuse.js";
import { FileView } from "@/components/Protos/FileView";

export const MediaManager = () => {
  /**
   * @type {[import('@/helpers/types').InfinitelyWpMedia[] , React.Dispatch<React.SetStateAction<import('@/helpers/types').InfinitelyWpMedia[]>>]}
   */
  const [mediaFiles, setMediaFiles] = useState([]);
  /**
   * @type {[import('@/helpers/types').InfinitelyWpMedia[] , React.Dispatch<React.SetStateAction<import('@/helpers/types').InfinitelyWpMedia[]>>]}
   */
  const [mediaSelected, setMediaSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isBusy, runWithBusy } = useBusy();
  const [animateRef] = useAutoAnimate();
  const [queryParams, setQueryParams] = useState({
    // page: 1,
    // per_page: 100,
    search: "",
    mime_type: "",
    orderby: "date",
    order: "desc",
  });

  const {
    data: mediaFilesData,
    isLoading: mediaFilesLoading,
    isRefetching: mediaFilesRefetching,
    fetchNextPage: mediaFilesFetchNextPage,
    isFetchingNextPage: mediaFilesIsFetchingNextPage,
    hasNextPage: mediaFilesHasNextPage,
  } = useWpGetInfinite("media", queryParams);

  const { isLoading: isFileViewBusy } = useTasksState(
    Object.values(File_View_keys),
  );
  const [mediaFilesInitialized, setMediaFilesInitialized] = useState(false);

  const qc = useQueryClient();

  const searchTimer = useRef();
  /**
   * @type {{current : HTMLInputElement}}
   */
  const inputRef = useRef();

  const allMediaRef = useRef(); //for normal mode

  const projectId = getProjectId();

  useWordpress(async () => {
    // if (
    //   mediaFilesIsFetchingNextPage ||
    //   mediaFilesRefetching ||
    //   mediaFilesLoading
    // )
    //   return;
    if (!mediaFilesData?.pages?.length) return;
    const projectData = await getProjectData(projectId);
    const excludes = projectData.mainEditorScripts.footer
      .concat(projectData.mainEditorScripts.header)
      .concat(projectData.jsHeaderLibs)
      .concat(projectData.jsFooterLibs)
      .concat(projectData.cssLibs)
      .concat(projectData.globalCss)
      .concat(projectData.globalJs)
      .concat(projectData.mainEditorStyles);

    const mFilesDataFlat = mediaFilesData.pages.flat();

    if (isArray(mediaFilesData.pages)) {
      const willBe = mFilesDataFlat
        .flat()
        .filter((item) => !excludes.some((ex) => ex.id === item.id));

      console.log("files is :", willBe, excludes);

      setMediaFiles((old) => [...willBe]);
      setMediaFilesInitialized(true);
    }
  }, [
    mediaFilesData,
    mediaFilesLoading,
    mediaFilesRefetching,
    mediaFilesIsFetchingNextPage,
  ]);

  useNormal(async () => {
    const getAndSet = async () => {
      setLoading(true);
      const currentPageName = getCurrentPageName();

      const filesHandlers = await opfs.getAllFiles(defineRoot(`/assets`));

      console.log("filesHandlers", filesHandlers);

      const files = await Promise.all(
        filesHandlers.map(async (handle) => {
          const file = await handle.getOriginFile();
          const link = currentPageName.includes(`index.html`)
            ? `./assets/${file.name}`
            : `../assets/${file.name}`;

          const output =
            /** @type {import('@/helpers/types').InfinitelyNormalMedia} */ ({
              file,
              name: file.name,
              slug: file.name,
              path: handle.path,
              id: uniqueId(`${file.name}-${file.path}-`),
              type: file.type,
              size: file.size,
              link,
              source_url: link,
            });
          return output;
        }),
      );

      console.log("normal mode files", files);

      unSelectAll();
      setMediaFiles((old) => [...files]);
      setMediaFilesInitialized(true);
      allMediaRef.current = files;
      setLoading(false);
    };

    await getAndSet();

    const evCleaner = opfs.on("all", getAndSet);
    const brCleaner = opfs.onBroadcast("all", getAndSet);

    return () => {
      evCleaner();
      brCleaner();
    };
  }, []);

  const isLoading = loading || mediaFilesLoading; //|| mediaFilesRefetching;
  const isRefetching = mediaFilesRefetching || mediaFilesIsFetchingNextPage;

  const openUploader = () => {
    inputRef.current.click();
  };

  const [onUploaderLoad, { isLoading: isUploading }] = useBusyCallback(
    async (ev) => {
      const files = [...ev.target.files];
      if (!files.length) return;
      ev.target.value = "";

      await doInNormalAsync(async () => {
        const res = await callWorkerCommand(assetsWorker, "uploadAssets", {
          assets: files,
          projectId,
          // toastId: tid,
        });
      });

      await doInWordpressAsync(async () => {
        const tid = toast.loading(<ToastMsgInfo msg="Uploading files..." />);

        try {
          if (files.length > 50) {
            toast.dismiss(tid);
            toast.warn(
              <ToastMsgInfo msg="You can only upload 50 files at a time" />,
            );
            return;
          }

          const totalSize = files.reduce((acc, file) => acc + file.size, 0);
          if (totalSize > 100 * 1024 * 1024) {
            toast.dismiss(tid);
            toast.warn(
              <ToastMsgInfo msg="Total file size should not exceed 100MB" />,
            );
            return;
          }

          if (files.some((file) => toMB(file.size) > 10)) {
            toast.dismiss(tid);
            toast.warn(
              <ToastMsgInfo msg="Individual file size should not exceed 10MB" />,
            );
            return;
          }

          setLoading(true);
          const res = await callWorkerCommand(
            assetsWorker,
            "wp_upload_multiple_files",
            {
              projectId,
              files,
            },
          );

          if (!res.success) {
            throw new Error(`Failed to upload files 😑`);
          }
          // queryParams.current.page = 1;
          // setMediaFiles([]);
          // await getMediaFiles();
          await qc.invalidateQueries({
            queryKey: ["wp_get_infinite", "media", projectId],
            refetchType: "all",
          });
          setLoading(false);
          toast.done(tid);
          toast.success(<ToastMsgInfo msg="Files uploaded successfully 🎉" />);
        } catch (error) {
          toast.dismiss(tid);
          toast.error(error.message);
          setLoading(false);
        }
      });
    },
    {
      key: Media_Manager_keys.upload,
    },
  );

  const [deleteAll, { isLoading: isDeleting }] = useBusyCallback(
    async () => {
      const cnfrm = confirm(
        `Are you sure to delete ${mediaFiles.length} files?`,
      );
      if (!cnfrm) return;

      const tid = toast.loading(<ToastMsgInfo msg="Deleting files..." />);

      await doInNormalAsync(async () => {
        try {
          await opfs.removeFiles(mediaFiles.map((file) => file.path));
          unSelectAll();
          toast.dismiss(tid);
          toast.success(<ToastMsgInfo msg="Files deleted successfully 🎉" />);
        } catch (error) {
          toast.dismiss(tid);
          toast.error(
            <ToastMsgInfo
              msg={error?.message || `Failed to delete files 😑`}
            />,
          );
          throw error;
        }
      });

      await doInWordpressAsync(async () => {
        try {
          if (mediaSelected.length) {
            await deleteSelected();
            return;
          }
          setLoading(true);

          const res = await callWorkerCommand(
            assetsWorker,
            "wp_delete_media_files_by_slugs",
            {
              projectId,
              slugs: mediaFiles.map((file) => file.slug),
            },
          );

          if (!res.success) {
            throw new Error(`Failed to delete files 😑`);
          }

          await qc.invalidateQueries({
            queryKey: ["wp_get_infinite", "media", projectId],
            refetchType: "all",
          });
          unSelectAll();
          setLoading(false);
          toast.dismiss(tid);
          toast.success(<ToastMsgInfo msg="Files deleted successfully 🎉" />);
        } catch (error) {
          toast.dismiss(tid);
          toast.error(
            <ToastMsgInfo
              msg={error?.message || `Failed to delete files 😑`}
            />,
          );
          setLoading(false);
          throw error;
        }
      });
    },
    {
      key: Media_Manager_keys.deleteAll,
    },
  );

  const [deleteSelected, { isLoading: isDeletingSelected }] = useBusyCallback(
    async () => {
      const cnfrm = confirm(
        `Are you sure to delete ${mediaSelected.length} files?`,
      );
      if (!cnfrm) return;
      const tid = toast.loading(<ToastMsgInfo msg="Deleting files..." />);

      await doInNormalAsync(async () => {
        try {
          const willRemoved = mediaSelected.map((file) => file.path);
          await opfs.removeFiles(willRemoved);
          setMediaSelected(
            mediaSelected.filter((file) => !willRemoved.includes(file.path)),
          );
          toast.dismiss(tid);
          toast.success(<ToastMsgInfo msg="Files deleted successfully 🎉" />);
        } catch (error) {
          toast.dismiss(tid);
          toast.error(error.message);
          throw error;
        }
      });

      await doInWordpressAsync(async () => {
        try {
          const willRemoved = mediaSelected.map((file) => file.slug);
          const res = await callWorkerCommand(
            assetsWorker,
            "wp_delete_media_files_by_slugs",
            {
              projectId,
              slugs:willRemoved,
            },
          );

          if (!res.success) {
            throw new Error(`Failed to delete files 😑`);
          }

          
          await qc.invalidateQueries({
            queryKey: ["wp_get_infinite", "media", projectId],
            refetchType: "all",
          });
          setMediaSelected(mediaSelected.filter((file) => !willRemoved.includes(file.slug)));
          // setLoading(false);
          toast.dismiss(tid);
          toast.success(<ToastMsgInfo msg="Files deleted successfully 🎉" />);
        } catch (error) {
          toast.dismiss(tid);
          toast.error(error.message);
          rej(error);
        }
      });
    },
    {
      key: Media_Manager_keys.deleteSelected,
    },
  );

  const deleteSelectedAfterSingleDelete = async (media) => {
    //complete from here 12/9/2026
    setMediaSelected((old) => old.filter((item) => item.id !== media.id));
  };

  const selectMedia = (media) => {
    const isSelected = mediaSelected.some((item) => item.id === media.id);
    if (isSelected) {
      setMediaSelected((prev) => prev.filter((item) => item.id !== media.id));
    } else {
      setMediaSelected((prev) => [...prev, media]);
    }
  };

  const unSelectAll = () => {
    if (!mediaSelected.length) return;
    setMediaSelected([]);
  };

  const search = (value) => {
    unSelectAll();
    mediaSelected.length && setMediaFiles([]);

    doInNormal(() => {
      if (!value) {
        setMediaFiles(allMediaRef.current);
        return;
      }
      const fuse = new Fuse(allMediaRef.current, {
        keys: ["name", "slug"],
      });
      const result = fuse.search(value);
      setMediaFiles((old) => [...result.map((item) => item.item)]);
    });

    doInWordpress(() => {
      setQueryParams((old) => ({
        ...old,
        search: value,
      }));
    });
  };

  const isDisabled =
    isUploading || isDeleting || isDeletingSelected || isFileViewBusy;

  // useEffect(() => {
  //   getMediaFiles();
  // }, []);

  return (
    <section className=" h-full w-full flex flex-col gap-2 overflow-hidden">
      <header className="h-[50px!important] flex justify-between items-center gap-2 p-2 overflow-hidden  rounded-lg bg-surface-tertiary ">
        {/* {Icons.logo({ width: 38 })} */}
        <section className="w-[35px] h-[35px] auto-animate">
          <Loader isLoading={isRefetching} width={37.5} height={37.5}>
            <figure className="border-1 rounded-full border-transparent">
              <img src={config.logo} alt="logo" />
            </figure>
          </Loader>
        </section>

        <Input
          placeholder="Search..."
          className="w-full h-full bg-surface-secondary"
          onInput={(ev) => {
            search(ev.target.value);
          }}
        />

        <SmallButton
          disabled={isLoading || isDisabled || isRefetching}
          title={mediaSelected.length ? "Delete Selected" : "Delete All"}
          className="h-full shrink-0 bg-surface-secondary hover:bg-[crimson!important]"
          tooltipClassName="!bg-[crimson]"
          onClick={async () => {
          mediaSelected.length ? await deleteSelected() :  await deleteAll();
          }}
        >
          {Icons.trash("white")}
        </SmallButton>

        <SmallButton
          disabled={isLoading || isDisabled || isRefetching}
          title={mediaSelected.length ? "Unselect current" : "Unselect All"}
          className="h-full shrink-0 bg-surface-secondary "
          onClick={async () => {
            unSelectAll();
          }}
        >
          {Icons.unselect({ stroke: "white", width: 18, height: 18 })}
        </SmallButton>

        <SmallButton
          disabled={isLoading || isDisabled || isRefetching}
          className="h-full shrink-0 bg-surface-secondary"
          title={"Upload"}
          onClick={openUploader}
          // className="py-[7.5px] px-[30px]  font-bold text-lg"
        >
          {Icons.upload({ strokeColor: "white" })}
        </SmallButton>
      </header>

      <main
        className="w-full h-[calc(100%-50px)] overflow-hidden  rounded-lg"
        // ref={animateRef}
      >
        {isLoading && <Loader />}
        {!!mediaFiles.length && !isLoading && (
          <VirtuosoGrid
            totalCount={mediaFiles.length}
            components={GridComponents}
            style={{
              height: "100%",
            }}
            // className="h-full"
            className="!p-[unset] h-full hideScrollBar"
            // itemClassName="p-[unset]"
            endReached={async () => {
              if (mediaFilesHasNextPage && !mediaFilesIsFetchingNextPage)
                mediaFilesFetchNextPage();
            }}
            // listClassName={`${mediaFiles.length > 3 ? " pr-2" : ""}`}
            itemContent={(index) => {
              const i = index,
                media = mediaFiles[index];
              // console.log("files from virtuso : ", media);

              return (
                  <FileView
                    key={media.id}
                    media={media}
                    setData={deleteSelectedAfterSingleDelete}
                    allowCheckBox
                    checked={mediaSelected.some((item) => item.id === media.id)}
                    onChange={() => {
                      selectMedia(media);
                    }}
                  />
              );
            }}
          />
        )}

        {mediaFilesInitialized &&
          !mediaFiles.length &&
          !isLoading &&
          !isRefetching && <NoItemsHere title={`No media files found 😪`} />}

        <input
          onChange={onUploaderLoad}
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={true}
        />
      </main>
    </section>
  );
};
