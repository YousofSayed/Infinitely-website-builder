import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { assetType, refType } from "../../helpers/jsDocs";
import { useEditorMaybe } from "@grapesjs/react";
import { current_page_id } from "../../constants/shared";
import {
  getProjectData,
  getProjectSettings,
  isOverflowedHiddenEl,
} from "../../helpers/functions";
import { ToastMsgInfo } from "../Editor/Protos/ToastMsgInfo";
import { toast } from "react-toastify";
import { addClickClass } from "../../helpers/cocktail";
import { getFileSize } from "../../helpers/bridge";
import { FitTitle } from "../Editor/Protos/FitTitle";
import { Icons } from "../Icons/Icons";
import { Tooltip } from "react-tooltip";

export const FileView = ({
  asset = assetType,
  callback = (asset = assetType, url = "") => {},
}) => {
  const editor = useEditorMaybe();
  const fileNameRef = useRef(refType);
  const [showFilNameTooltib, setShowFileNameTooltib] = useState(false);

  useLayoutEffect(() => {
    if (!fileNameRef || !fileNameRef.current) return;
    const handler = (el) => {
      const isOverflowHidden = isOverflowedHiddenEl(fileNameRef.current);
      setShowFileNameTooltib(isOverflowHidden);
    };
    handler(fileNameRef.current);
    const resizerObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => handler(entry.target));
    });

    return () => {
      resizerObserver.disconnect();
    };
  }, [fileNameRef, fileNameRef.current]);

  /**
   *
   * @param {MouseEvent} ev
   * @param {import('../../helpers/types').InfinitelyAsset} asset
   */
  const onItemClicked = async (ev, asset) => {
    ev.stopPropagation();
    ev.preventDefault();
    addClickClass(ev.target, "click");
    const selectedEl = editor.getSelected();
    if (!selectedEl) {
      toast.warn(<ToastMsgInfo msg={`Please select element`} />);
      return;
    }
    // const symbolInfo = getInfinitelySymbolInfo(selectedEl);
    // console.log(cssPropForAM);

    // if (cssPropForAM) {
    //   setClass({
    //     cssProp: cssPropForAM,
    //     value: `url("../assets/${file.name}")`, //`url("${URL.createObjectURL(file)}") , url("../assets/${file.name}") /* buildUrl: url("https://example.com/style.css"); prop: background-image */`,
    //   });
    // } else {
    const el = editor.getSelected().getEl();
    const tagName = el.tagName.toLowerCase();
    console.log(
      tagName,
      editor.getSelected().getEl(),
      editor.getSelected().getEl() instanceof HTMLDivElement
    );
    const pageName = localStorage.getItem(current_page_id);
    const isIndex = pageName.toLowerCase() == "index";
    const src = `${isIndex ? "." : ".."}/assets/${asset.file.name}`;

    callback(asset, src);
  };

  const deleteAsset = async (id) => {
    const newAssets = await (
      await getProjectData()
    ).assets.filter((asset) => asset.id != id);
    await db.projects.update(projectId, {
      assets: newAssets,
    });
  };

  return (
    <section
      className={`group relative rounded-lg p-3 bg-slate-800  flex flex-col justify-center items-center gap-2`}
    >
      <FitTitle className="absolute left-0 top-0">
        {getFileSize(asset.file).MB.toFixed(2)}MB
      </FitTitle>
      <button
        onClick={(ev) => {
          deleteAsset(asset.id);
        }}
        className="absolute group-hover:flex z-[200] right-0 top-0 bg-blue-600 fill-white cursor-pointer hidden justify-center items-center rounded-full w-[23px] h-[23px]"
      >
        {/* <Icons.close /> */}
        {Icons.close("white", 1.5)}
      </button>
      <figure
        onDoubleClick={(ev) => {
          ev.stopPropagation();
          onItemClicked(ev, asset);
        }}
        className=" p-2 h-[150px]  cursor-pointer rounded-lg  bg-slate-800"
      >
        {(asset.file.type.includes("video") && (
          <section>
            <video
              className="w-full  h-[140px] max-h-full max-w-full "
              onClick={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                ev.currentTarget.play();
                console.log("play");
              }}
              onDoubleClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                console.log("dbplay");
                onItemClicked(ev, asset);
              }}
              autoPlay={true}
              muted={true}
              poster=""
              src={`assets/${asset.file.name}`}
            ></video>
          </section>
        )) ||
          (asset.file.type.includes("audio") && (
            <section className="h-full flex justify-between gap-2 items-center flex-col bg-slate-900 rounded-lg overflow-hidden pt-2">
              {Icons.headphone('white' , undefined , 75 , 75)}
              <audio
                onClick={(ev) => onItemClicked(ev, asset)}
                className="w-full"
                src={`assets/${asset.file.name}`}
                controls={true}
              ></audio>
            </section>
          )) ||
          (asset.file.type.includes("image") && (
            <img
              // onLoad={(ev) => {
              //   console.log("image load...");
              // }}
              onClick={(ev) => onItemClicked(ev, asset)}
              className="w-full h-full object-contain"
              src={`assets/${asset.file.name}`}
            ></img>
          ))}

        {!/image|audio|video/gi.test(asset.file.type) &&
          Icons.file({ fill: "white", width: 130, height: 130 })}
      </figure>
      <p
        tooltib-id={asset.id}
        ref={fileNameRef}
        title={asset.file.name}
        className="text-slate-200 p-2 bg-slate-900 rounded-md text-ellipsis  max-w-full   text-nowrap overflow-hidden "
      >
        {asset.file.name}
      </p>
      {showFilNameTooltib && (
        <Tooltip
          anchorSelect={`[tooltib-id="${asset.id}"]`}
          place="bottom-end"
          opacity={1}
          className="shadow-sm shadow-slate-950 z-10"
          positionStrategy="fixed"
        >
          {asset.file.name}
        </Tooltip>
      )}
    </section>
  );
};
