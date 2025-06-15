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

/**
 * 
 * @param {{
 * placeholder:string,
 * value : string,
 * mediaType: 'audio' | 'video' | 'image',
 * callback:(asset:import('../../helpers/types').InfinitelyAsset , url:string)=>void
 * }} param0 
 * @returns 
 */
export const ChooseFile = ({placeholder='' ,value='', mediaType = '' , callback = ()=>{}})=>{
    const mediaRef = useRef(refType);
    const [showMediaPopover, setShowMediaPopover] = useState(false);
    const [mediaForPopover, setMediaForPopover] = useState(assetsType);
    // const editor = useEditorMaybe();

  return (
    <section ref={mediaRef} className="flex gap-2 w-full">
      <Input
        placeholder={placeholder}
        className="w-full bg-slate-900"
        value={value}
      />
      <SmallButton
        onClick={async (ev) => {
          const assets = await (await getProjectData()).assets;
          const newAssets = mediaType
            ? assets.filter((asset) =>
                asset.file.type.toLowerCase().includes(mediaType)
              )
            : assets;
          setMediaForPopover(newAssets);
          setShowMediaPopover(!showMediaPopover);
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
          <section className="py-2 h-full">
            <VirtuosoGrid
              components={GridComponents}
              totalCount={mediaForPopover.length}
              listClassName="px-2"
              itemContent={(i) => {
                const asset = mediaForPopover[i];
                return (
                  <FileView
                    asset={asset}
                    callback={callback}
                     
                  />
                );
              }}
            />
          </section>
        </Popover>
      )}
    </section>
  );
};
