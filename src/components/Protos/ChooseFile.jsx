import React, { useRef, useState } from "react";
import { assetsType, refType } from "../../helpers/jsDocs";
import { Input } from "../Editor/Protos/Input";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { getProjectData, getProjectSettings } from "../../helpers/functions";
import { Popover } from "../Editor/Popover";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "./VirtusoGridComponent";
import { FileView } from "./FileView";
import { useEditorMaybe } from "@grapesjs/react";
import { Icons } from "../Icons/Icons";
import { opfs } from "../../helpers/initOpfs";
import { defineRoot } from "../../helpers/bridge";
import { Loader } from "../Loader";

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
  callback = () => {},
}) => {
  const mediaRef = useRef(refType);
  const [showMediaPopover, setShowMediaPopover] = useState(false);
  const [mediaForPopover, setMediaForPopover] = useState(assetsType);
  const [showLoader, setShowLoader] = useState(false);
  const timeout = useRef();
  // const editor = useEditorMaybe();

  return (
    <section ref={mediaRef} className="flex gap-2 w-full">
      <Input
        placeholder={placeholder}
        className="w-full bg-slate-900 "
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
            let assets = await Promise.all(
              (
                await opfs.getAllFiles(defineRoot("assets"))
              ).map((handle) => handle.getOriginFile())
            );
            // const clone = [...assets];
            console.log(assets,ext, "before");

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
                itemContent={(i) => {
                  const asset = mediaForPopover[i];
                  return <FileView asset={asset} callback={callback} isCssProp={isCssProp} />;
                }}
              />
            )}

            {showLoader && <Loader />}

            {!mediaForPopover.length && !showLoader && (
              <section className="flex items-center justify-center h-full w-full">
                <h1 className="font-bold text-slate-300 text-xl">
                  No Files Founded..!
                </h1>
              </section>
            )}
          </section>
        </Popover>
      )}
    </section>
  );
};
