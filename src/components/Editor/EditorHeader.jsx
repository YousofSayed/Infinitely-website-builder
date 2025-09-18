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
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  animationsState,
  cmdsBuildState,
  currentElState,
  isAnimationsChangedState,
  previewContentState,
  showPreviewState,
  zoomValueState,
} from "../../helpers/atoms";
import {
  buildGsapMotionsScript,
  buildScriptFromCmds,
  exportProject,
  getCurrentPageName,
  getProjectData,
  getProjectSettings,
  shareProject,
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
import { animationsSavingMsg } from "../../constants/confirms";
import { editorContainerInstance } from "../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { fetcherWorker } from "../../helpers/defineWorkers";

export const HomeHeader = memo(() => {
  const editor = useEditorMaybe();
  const widthRef = useRef("");
  const heightRef = useRef("");
  const customDevice = useRef();
  const [showPreview, setShowPreview] = useRecoilState(showPreviewState);
  const [currentEl, setCurrentEl] = useRecoilState(currentElState);
  const [zoomValue, setZoomValue] = useRecoilState(zoomValueState);
  // const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
  //   isAnimationsChangedState
  // );
  // const [animations, setAnimations] = useRecoilState(animationsState);
  const [dimansions, setDimaonsion] = useState({
    width: "",
    height: "",
  });
  // const [pages, setPages] = useState([]);

  const setCustomDevice = (prop, value) => {
    prop == "width" && (widthRef.current = value);
    prop == "height" && (heightRef.current = value);
    // console.log(prop, value, !value);

    const uid = uniqueID();

    editor.DeviceManager.remove(customDevice.current);
    if (!value) {
      editor.DeviceManager.select("desktop");
      return;
    }
    customDevice.current = editor.DeviceManager.add({
      name: uid,
      id: uid,
      // width: widthRef.current + (widthRef.current && "px") || "100%",
      height: heightRef.current + (heightRef.current && "px") || undefined,
      widthMedia: widthRef.current ? widthRef.current + "px" : undefined,
    });

    editor.DeviceManager.select(customDevice.current);
  };

  const zoomCallback = (ev) => {
    const { value } = ev.detail;
    // console.log('value zoom : ' , value);

    setZoomValue((value * 100).toFixed(2));
  };

 

  useEffect(() => {
    if (!editor) return;
    // console.log('html editor : ' , editor.getWrapper().getInnerHTML({withProps:true , withScripts: true}));
    // getHtml({withProps:true , asDocument:false , })
    setZoomValue((editor.getContainer().style.zoom * 100).toFixed(2));
    const changeDeviceCallback = () => {
      const currentDeviceName = editor.getDevice();
      const currentDevice = editor.Devices.get(currentDeviceName);
      setDimaonsion({
        height: parseFloat(currentDevice.attributes.height) || '',
        width: parseFloat(currentDevice.attributes.widthMedia) || '',
      });
    };
    editor.on("change:device", changeDeviceCallback);
    
    return ()=>{
      editor.off("change:device", changeDeviceCallback);

    }
  }, [editor]);

  useEffect(() => {
    editorContainerInstance.on(
      InfinitelyEvents.editorContainer.update,
      zoomCallback
    );

    return () => {
      editorContainerInstance.off(
        InfinitelyEvents.editorContainer.update,
        zoomCallback
      );
    };
  }, []);

  return (
    <header className="w-full h-[60px]  zoom-80 px-2 bg-slate-900  border-b-[1.5px]  border-slate-400    flex items-center justify-between gap-5">
      <ScrollableToolbar
        className="w-[37.5%] h-full items-center flex-shrink-0 max-w-[600px]"
        space={3}
      >
        {/* <ul className="flex gap-[25px] flex-shrink  h-full  items-center"> */}
        <ul className="flex items-center gap-2 justify-between flex-shrink-0 flex-grow bg-slate-800 shadow-2xl shadow-slate-950 rounded-lg w-[120px] p-1">
          <Li
            title="desktop size"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("desktop");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            icon={Icons.desktop}
          />
          <Li
            title="tablet size"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("tablet");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            fillObjectIconOnHover
            icon={Icons.tablet}
          />

          <Li
            title="mobile size"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("mobile");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            fillObjectIconOnHover
            icon={Icons.mobile}
          />
        </ul>

        <li className="flex  items-center h-[65%] gap-4 max-lg:flex-shrink-0">
          <Input
            type="number"
            placeholder="Width"
            className="bg-slate-800 p-1 w-[70px] text-center  h-full font-bold text-sm max-lg:flex-shrink-0"
            value={dimansions.width}
            onInput={(ev) => {
              // transformToNumInput(ev.target);
              setCustomDevice("width", ev.target.value);
              setDimaonsion({ ...dimansions, width: ev.target.value });
              setCurrentEl({ currentEl: JSON.stringify(editor.getSelected()) });
            }}
          />

          <Input
            type="number"
            value={dimansions.height}
            placeholder="Height"
            className="bg-slate-800 w-[70px] p-1  text-center  h-full font-bold text-sm max-lg:flex-shrink-0 "
            onInput={(ev) => {
              // transformToNumInput(ev.target);
              setCustomDevice("height", ev.target.value);
              setDimaonsion({ ...dimansions, height: ev.target.value });
              setCurrentEl({ currentEl: editor.getSelected().getEl() });
            }}
          />

          <Input
            value={zoomValue}
            placeholder="Zoom"
            className="bg-slate-800 w-[70px] p-1  text-center  h-full font-bold text-sm max-lg:flex-shrink-0 "
            type="number"
            onInput={(ev) => {
              // transformToNumInput(ev.target);
              editor.getContainer().style.zoom = ev.target.value / 100;
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
      <ScrollableToolbar
        className=" w-[61%] h-full items-center [&_svg]:w-[20px] [&_svg]:h-[18px] tools"
        space={1}
      >
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
                `/${getCurrentPageName()}`,
                "infinitely-preview"
                // 'width=800,height=600,top=50,left=50,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=yes,titlebar=yes'
              );
              // console.log("navigated to frontend");

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
              editor.store();
            }}
          />

          <section className="relative">
            <Li
              icon={Icons.share}
              title="share"
              isObjectParamsIcon
              className="flex-shrink-0"
              // justHover
              fillObjIconStroke
              fillObjectIconOnHover
              onClick={() => {
                // editor.store();
                shareProject();
                /**
                 *
                 * @param {MessageEvent} ev
                 */
                const callback = async (ev) => {
                  if (ev.data.command == "shareProject") {
                    console.log(ev);
                    const { response } = ev.data;
                    if (response.status == "success") {
                      // "http://tmpfiles.org/11276583/dasd.zip"
                      const fileUrl = response.data.url.replace(
                        "http://tmpfiles.org/",
                        "https://tmpfiles.org/dl/"
                      );
                      await navigator.clipboard.writeText(
                        `${window.origin}/workspace?file=${btoa(fileUrl)}`
                      );
                      toast.info(
                        <ToastMsgInfo
                          msg={`Share URL is copied , so you can share now💙`}
                        />,
                        { progressClassName: "bg-blue-600" }
                      );
                    }
                    fetcherWorker.removeEventListener("message", callback);
                  }
                };
                fetcherWorker.addEventListener("message", callback);
              }}
            />

            {/* <p className="absolute top-[100%] left-[-150px] w-[300px] p-2 bg-slate-800 rounded-lg z-[500]">dadsadadl dlas,dlsadlklsakdlaksldksalkdlsalkd</p> */}
          </section>

          <Li
            icon={Icons.export}
            title="export"
            justHover={true}
            className="flex-shrink-0"
            onClick={async () => {
              // const projectId = +localStorage.getItem(current_project_id);

              // infinitelyWorker.postMessage({
              //   command: "exportProject",
              //   props: {
              //     projectSetting: getProjectSettings().projectSettings,
              //     projectId,
              //     toastId: id,
              //   },
              // });
              exportProject();
            }}
          />
          <Li
            to={"/edite/styling"}
            className="flex-shrink-0"
            icon={Icons.prush}
            isObjectParamsIcon
            fillObjIcon={false}
            fillObjectIconOnHover
            title="edite component"
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
