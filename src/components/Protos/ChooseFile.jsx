import { wp_get } from "@/Apps/wordpress/functions";
import { current_project_id } from "@/constants/shared";
import { defineRoot } from "@/helpers/bridge";
import { doInNormalAsync, doInWordpressAsync, getProjectData, getProjectSettings } from "@/helpers/functions";
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
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { VirtuosoGrid } from "react-virtuoso";

/**
 *
 * @param {{
 * placeholder:string,
 * value : string,
 * mediaType: 'audio' | 'video' | 'image',
 * ext:string;
 * isCssProp:boolean;
 * callback:(asset:File , url:string)=>void
 * }} param0
 * @returns
 */
export const ChooseFile = ({
  placeholder = "",
  value = "",
  mediaType = "",
  ext = "",
  isCssProp = false,
  callback = () => { },
}) => {
  const mediaRef = useRef(refType);
  const [showMediaPopover, setShowMediaPopover] = useState(false);
  const [mediaForPopover, setMediaForPopover] = useState(assetsType);
  const [showLoader, setShowLoader] = useState(false);
  const timeout = useRef();
  const wpQueryParams = useRef({
    per_page: 100,
    page: 1,
    mime_type: mediaType,
  });
  const tid = useRef();
  const projectId = +localStorage.getItem(current_project_id);
  // const editor = useEditorMaybe();

  const getWpMedia = async () => {
    const projectData = await getProjectData(projectId);
    const excludes = projectData.mainEditorScripts.footer.concat(projectData.mainEditorScripts.header).concat(projectData.globalCss).concat(projectData.globalJs).concat(projectData.mainEditorStyles);
    setShowLoader(true);
    console.log('media type : ', mediaType, mediaForPopover);
    wpQueryParams.current.page = 1;
    const res = await wp_get({
      endpoint: "media",
      params: wpQueryParams.current,
      projectId,
    });
    if (isArray(res)) {
      const filtered = res.filter(item => !excludes.some(ex => ex.id === item.id)).filter(item => item.mime_type.includes(mediaType));
      setMediaForPopover((old) => [...filtered]);
    } else {
      setMediaForPopover([]);
      console.error("Error in fetching media : ", res);
    }
    setShowLoader(false);
  }

  const onScrollEnd = async () => {
    if (mediaForPopover.length <= wpQueryParams.current.per_page) return;
    wpQueryParams.current.page++;
    tid.current = toast.loading(<ToastMsgInfo msg="Loading more media..." />)
    const res = await wp_get({
      endpoint: "media",
      params: wpQueryParams.current,
      projectId,
    });
    if (isArray(res)) {
      setMediaForPopover((old) => [...old, ...res]);
    } else {
      console.error("Error in fetching media : ", res);
    }
    toast.dismiss(tid.current);
  }

  return (
    <section ref={mediaRef} className="flex gap-2 w-full">
      <Input
        placeholder={placeholder}
        className="w-full bg-surface-secondary "
        value={value}
        onInput={(ev) => {
          const value = ev.target.value;
          const asset = mediaForPopover.find((asset) =>
            value.includes(asset.file.name)
          );
          callback(asset, ev.target.value);
        }}
      />
      <SmallButton
        // className="p-[unset]"
        onClick={async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setShowLoader(true);
          setShowMediaPopover(true);
          timeout.current && clearTimeout(timeout.current);
          timeout.current = setTimeout(async () => {

            await doInNormalAsync(async () => {
              let assets = await Promise.all(
                (
                  await opfs.getAllFiles(defineRoot("assets"))
                ).map((handle) => handle.getOriginFile())
              );
              // const clone = [...assets];
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
              setShowLoader(false);

            });

            await doInWordpressAsync(async () => {
              await getWpMedia();
            })
          }, 10);
        }}
      >
        {Icons.gallery("white")}
      </SmallButton>

      {showMediaPopover && (
        <Popover
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
                  return <>
                    <Normal>
                      <BusyProvider>
                        <FileView asset={asset} callback={callback} isCssProp={isCssProp} /></BusyProvider>
                    </Normal>

                    <Wordpress>
                      <BusyProvider>
                        <WpFileView media={asset} callback={callback} isCssProp={isCssProp} allowCheckBox={false} showOptions={false} /></BusyProvider>
                    </Wordpress>
                  </>;
                }}
              />
            )}

            {showLoader && <Loader />}

            {!mediaForPopover.length && !showLoader && (
              <NoItemsHere title="No Files Founded..!" />
            )}
          </section>
        </Popover>
      )}
    </section>
  );
};
