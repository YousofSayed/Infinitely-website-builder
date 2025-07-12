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
 * callback:(asset:File , url:string)=>void
 * }} param0
 * @returns
 */
export const ChooseFile = ({
  placeholder = "",
  value = "",
  mediaType = "",
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
        className="w-full bg-slate-900"
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

            if (mediaType) {
              assets = assets.filter(file=>file.type.includes(mediaType))
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
                  return <FileView asset={asset} callback={callback} />;
                }}
              />
            )}

            {showLoader && <Loader />}

            {!mediaForPopover.length && !showLoader &&  <section className="flex items-center justify-center h-full w-full"><h1 className="font-bold text-slate-300 text-xl">No Files Founded..!</h1></section>}
          </section>
        </Popover>
)}
    </section>
  );
};
