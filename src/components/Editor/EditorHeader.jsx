import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../Icons/Icons";
import { Li } from "../Protos/Li";
import { IframeControllers } from "./Protos/IframeControllers";
import { useEditorMaybe } from "@grapesjs/react";
import { Input } from "./Protos/Input";
import {
  createBlobFileAs,
  html,
  transformToNumInput,
  uniqueID,
} from "../../helpers/cocktail";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  cmdsBuildState,
  currentElState,
  previewContentState,
  showPreviewState,
} from "../../helpers/atoms";
import {
  buildScriptFromCmds,
  getProjectData,
  getProjectSettings,
} from "../../helpers/functions";
import { Select } from "./Protos/Select";
import { PagesSelector } from "./PagesSelector";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { open_code_manager_modal } from "../../constants/InfinitelyCommands";
import { current_project_id } from "../../constants/shared";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { db } from "../../helpers/db";

export const HomeHeader = () => {
  const editor = useEditorMaybe();
  const widthRef = useRef("");
  const heightRef = useRef("");
  const customDevice = useRef();
  const showPreview = useRecoilValue(showPreviewState);
  const setShowPreview = useSetRecoilState(showPreviewState);
  const setPreviewContent = useSetRecoilState(previewContentState);
  const setCurrentEl = useSetRecoilState(currentElState);
  const cmds = useRecoilValue(cmdsBuildState);
  const [dimansions, setDimaonsion] = useState({
    width: "",
    height: "",
  });
  // const [pages, setPages] = useState([]);

  const setCustomDevice = (prop, value) => {
    prop == "width" && (widthRef.current = value);
    prop == "height" && (heightRef.current = value);
    const uid = uniqueID();

    editor.DeviceManager.remove(customDevice.current);

    customDevice.current = editor.DeviceManager.add({
      name: uid,
      id: uid,
      width: widthRef.current + (widthRef.current && "px") || "100%",
      height: heightRef.current + (heightRef.current && "px") || undefined,
      widthMedia: widthRef.current ? widthRef.current + "px" : undefined,
    });

    editor.DeviceManager.select(customDevice.current);
  };

  const test = async () => {
    const projectData = await getProjectData();
    const res = await await fetch("Frame 4(1).png");

    const blob = res.blob();

    // async function findMatchingBlob(blobsArray, target) {
    //   const targetText = await target.text();
    //   for (const blob of blobsArray) {
    //     if (await blob.text() === targetText) return blob;
    //   }
    //   return null;
    // }
    console.log(
      "File is : ",
      res,
      await blob,
      new URL("https://infinitely/Frame 4(1).png").pathname.toLowerCase(),
      encodeURIComponent("Frame 4(1).png")
      //  await findMatchingBlob(projectData.assets.map(asset=>asset.file) , file)
      // await Promise.all(

      // )
    );
  };

  return (
    <header className="w-full h-[60px] zoom-80 bg-slate-900 border-b-[1.5px]  border-slate-400  px-3  flex items-center justify-between gap-5">
      <ul className="flex gap-[25px] w-full h-full flex-grow items-center">
        <Li
          title="desktop size"
          className="flex-shrink-0"
          onClick={(ev) => {
            editor.setDevice("Desktop");
            // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
            editor.trigger("device:change");
          }}
          icon={Icons.laptop}
        />
        <Li
          title="tablet size"
          className="flex-shrink-0"
          onClick={(ev) => {
            editor.setDevice("tablet");
            // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
            editor.trigger("device:change");
          }}
          icon={Icons.taplet}
        />

        <Li
          title="mobile size"
          className="flex-shrink-0"
          onClick={(ev) => {
            editor.setDevice("mobile");
            // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
            editor.trigger("device:change");
          }}
          icon={Icons.mopile}
        />

        <li className="flex items-center h-[70%] gap-4">
          <Input
            placeholder="Width"
            className="bg-slate-800 p-1 w-[100px]  h-full font-bold text-sm"
            value={dimansions.width}
            onInput={(ev) => {
              transformToNumInput(ev.target);
              setCustomDevice("width", ev.target.value);
              setDimaonsion({ ...dimansions, width: ev.target.value });
              setCurrentEl({ currentEl: editor.getSelected().getEl() });
            }}
          />

          <Input
            value={dimansions.height}
            placeholder="Height"
            className="bg-slate-800 w-[100px] p-1   h-full font-bold text-sm"
            onInput={(ev) => {
              transformToNumInput(ev.target);
              setCustomDevice("height", ev.target.value);
              setDimaonsion({ ...dimansions, height: ev.target.value });
              setCurrentEl({ currentEl: editor.getSelected().getEl() });
            }}
          />
          <PagesSelector />
        </li>
      </ul>

      {/* <Select
        className="p-[unset] bg-slate-800 max-w-[30%] h-[calc(100%-15px)] "
        containerClassName="bg-slate-800"
        preventInput={true}
        keywords={pages}
      /> */}

      <section className="flex items-center justify-between gap-[10px] overflow-auto hideScrollBar flex-shrink w-full px-2">
        <IframeControllers />

        {/* <div className="flex items-center justify-between gap-2 h-full w-full"> */}
        <ul className="flex justify-between w-[40%]  items-center gap-2">
          <Li
            onClick={() => {
              editor.runCommand(open_code_manager_modal);
            }}
          >
            {Icons.code({ strokWidth: 3 })}
          </Li>
          <Li
            title="preview mode"
            icon={Icons.watch}
            onClick={(ev) => {
              setShowPreview((old) => !old);
            }}
          />
          <Li
            icon={Icons.save}
            title="save"
            justHover={true}
            onClick={() => {
              try {
                editor.store();
                toast.success(
                  <ToastMsgInfo msg={`Project Saved Successfully`} />
                );
              } catch (error) {}
            }}
          />
          <Li
            icon={Icons.export}
            title="download"
            justHover={true}
            onClick={async () => {
              const projectId = +localStorage.getItem(current_project_id);
              infinitelyWorker.postMessage({
                command: "exportProject",
                props: {
                  projectSetting: getProjectSettings().projectSettings,
                  projectId,
                },
              });
            }}
          />
          <Li to={"/add-blocks"} icon={Icons.plus} title="add blocks" />
        </ul>

        {/* <Button>Publish</Button> */}
        {/* </div> */}
      </section>
    </header>
  );
};
