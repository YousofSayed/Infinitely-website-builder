import React, { memo, useEffect, useRef, useState } from "react";
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
  getCurrentPageName,
  getProjectData,
  getProjectSettings,
} from "../../helpers/functions";
import { Select } from "./Protos/Select";
import { PagesSelector } from "./PagesSelector";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { open_code_manager_modal } from "../../constants/InfinitelyCommands";
import {
  current_page_id,
  current_project_id,
  preview_url,
} from "../../constants/shared";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { db } from "../../helpers/db";
import { ScrollableToolbar } from "../Protos/ScrollableToolbar";
import { Hr } from "../Protos/Hr";
import { useNavigate } from "react-router-dom";

export const HomeHeader = memo(() => {
  const editor = useEditorMaybe();
  const widthRef = useRef("");
  const heightRef = useRef("");
  const customDevice = useRef();
  const showPreview = useRecoilValue(showPreviewState);
  const setShowPreview = useSetRecoilState(showPreviewState);
  const setPreviewContent = useSetRecoilState(previewContentState);
  const setCurrentEl = useSetRecoilState(currentElState);
  const cmds = useRecoilValue(cmdsBuildState);
  const navigate = useNavigate();
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

  return (
    <header className="w-full h-[60px] [&_svg]:w-[18px] [&_svg]:h-[18px] zoom-80 px-2 bg-slate-900  border-b-[1.5px]  border-slate-400    flex items-center justify-between gap-5">
      <ScrollableToolbar className="w-[43.5%] h-full items-center " space={3}>
        {/* <ul className="flex gap-[25px] flex-shrink  h-full  items-center"> */}
        <Li
          title="desktop size"
          className="max-lg:flex-shrink-0"
          onClick={(ev) => {
            editor.setDevice("Desktop");
            // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
            editor.trigger("device:change");
          }}
          icon={Icons.laptop}
        />
        <Li
          title="tablet size"
          className="max-lg:flex-shrink-0"
          onClick={(ev) => {
            editor.setDevice("tablet");
            // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
            editor.trigger("device:change");
          }}
          icon={Icons.taplet}
        />

        <Li
          title="mobile size"
          className="max-lg:flex-shrink-0"
          onClick={(ev) => {
            editor.setDevice("mobile");
            // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
            editor.trigger("device:change");
          }}
          icon={Icons.mopile}
        />

        <li className="flex items-center h-[65%] gap-4 max-lg:flex-shrink-0">
          <Input
            placeholder="Width"
            className="bg-slate-800 p-1 w-[70px]  h-full font-bold text-sm max-lg:flex-shrink-0"
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
            className="bg-slate-800 w-[70px] p-1   h-full font-bold text-sm max-lg:flex-shrink-0 "
            onInput={(ev) => {
              transformToNumInput(ev.target);
              setCustomDevice("height", ev.target.value);
              setDimaonsion({ ...dimansions, height: ev.target.value });
              setCurrentEl({ currentEl: editor.getSelected().getEl() });
            }}
          />
          <PagesSelector />
        </li>
        {/* </ul> */}
      </ScrollableToolbar>

      {/* <Hr/> */}
      {/* <Select
        className="p-[unset] bg-slate-800 max-w-[30%] h-[calc(100%-15px)] "
        containerClassName="bg-slate-800"
        preventInput={true}
        keywords={pages}
      /> */}
      {/* <ToolbarComponent style={{width:'50%' }} overflowMode="Popup" > */}

      {/* <section className="flex items-center  gap-2    w-[59%] px-2"> */}
      <ScrollableToolbar className=" w-[54%] h-full items-center" space={1}>
        <IframeControllers />
        <Hr />
        {/* <div className="flex items-center justify-between gap-2 h-full w-full"> */}
        <>
          <Li
            onClick={() => {
              editor.runCommand(open_code_manager_modal);
            }}
            title="Code manager"
            className="flex-shrink-0"
          >
            {Icons.code({ strokWidth: 3 })}
          </Li>
          <Li
            title="preview mode"
            icon={Icons.watch}
            onClick={(ev) => {
              // localStorage.setItem(preview_url, getCurrentPageName());
              // window.open(`/preview/${getCurrentPageName()}`, "_blank");

              setShowPreview((old) => !old);
            }}
            className="flex-shrink-0"
          />

          <Li
            title="show in frontend"
            icon={Icons.showInFrontEnd}
            isObjectParamsIcon
            onClick={(ev) => {
              localStorage.setItem(preview_url, getCurrentPageName());
              window.open(
                `/pages/${localStorage.getItem(current_page_id)}.html`,
                "_blank",
                // 'width=800,height=600,top=50,left=50,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=yes,titlebar=yes'
              );
              console.log("navigated to frontend");

              // navigate("/preview" , {});
              // setShowPreview((old) => !old);
            }}
            className="flex-shrink-0"
          />

          <Li
            icon={Icons.save}
            title="save"
            justHover={true}
            className="flex-shrink-0"
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
            title="export"
            justHover={true}
            className="flex-shrink-0"
            onClick={async () => {
              const projectId = +localStorage.getItem(current_project_id);
              const id = toast.loading(
                <ToastMsgInfo msg={`Loading files , please wait`} />
              );
              //  setTimeout(()=>{

              //   toast.done(id)
              //  },10)

              infinitelyWorker.postMessage({
                command: "exportProject",
                props: {
                  projectSetting: getProjectSettings().projectSettings,
                  projectId,
                  toastId: id,
                },
              });
            }}
          />
          <Li
            to={"/edite/styling"}
            className="flex-shrink-0"
            icon={Icons.prush}
            isObjectParamsIcon
            fillObjIcon={false}
            fillObjectIconOnHover
            title="style block"
          />
          <Li
            to={"/add-blocks"}
            className="flex-shrink-0"
            icon={Icons.plus}
            fillIcon
            fillObjIcon
            title="add blocks"
          />
        </>

        {/* <Button>Publish</Button> */}
        {/* </div> */}
      </ScrollableToolbar>
      {/* </section> */}
      {/* </ToolbarComponent> */}
    </header>
  );
});
