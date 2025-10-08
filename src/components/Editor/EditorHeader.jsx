import React, { memo, useEffect, useRef, useState } from "react";
import { Icons } from "../Icons/Icons";
import { Li } from "../Protos/Li";
import { IframeControllers } from "./Protos/IframeControllers";
import { useEditorMaybe } from "@grapesjs/react";
import { Input } from "./Protos/Input";
import {
  addClickClass,
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
  getComponentRules,
  getCurrentPageName,
  getProjectData,
  getProjectSettings,
  preventSelectNavigation,
  shareProject,
} from "../../helpers/functions";
import { Select } from "./Protos/Select";
import { PagesSelector } from "./PagesSelector";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { open_code_manager_modal } from "../../constants/InfinitelyCommands";
import { preview_url } from "../../constants/shared";
import { ScrollableToolbar } from "../Protos/ScrollableToolbar";
import { Hr } from "../Protos/Hr";
import { editorContainerInstance } from "../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { fetcherWorker } from "../../helpers/defineWorkers";
import { OptionsButton } from "../Protos/OptionsButton";
import { cloneDeep } from "lodash";
import { detectedType } from "../../helpers/jsDocs";
import { UlContextProvider, useUlContext } from "../Protos/UlProvider";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const HomeHeader = () => {
  const editor = useEditorMaybe();
  const widthRef = useRef("");
  const heightRef = useRef("");
  const customDevice = useRef();
  const [showPreview, setShowPreview] = useRecoilState(showPreviewState);
  const [currentEl, setCurrentEl] = useRecoilState(currentElState);
  const [zoomValue, setZoomValue] = useRecoilState(zoomValueState);
  const [mediaValue, setMediaValue] = useState("");
  const [detectedMedia, setDetectedMedia] = useState(detectedType);
  const [sizeAutoAnimate] = useAutoAnimate();
  const [widthMedia, setWidthMedia] = useState();
  const { selectedId, setSeletedId } = useUlContext();
  // const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
  //   isAnimationsChangedState
  // );
  // const [animations, setAnimations] = useRecoilState(animationsState);
  const [dimansions, setDimaonsion] = useState({
    width: "",
    height: "",
  });

  const setMediaConditon = (value) => {
    setMediaValue(value);
    editor.getConfig().mediaCondition = value;
    localStorage.setItem("media-condition", value);
  };
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
    if (!(editor && editor.getContainer())) return;
    // console.log('html editor : ' , editor.getWrapper().getInnerHTML({withProps:true , withScripts: true}));
    // getHtml({withProps:true , asDocument:false , })
    setZoomValue((editor.getContainer().style.zoom * 100).toFixed(2));
    const changeDeviceCallback = () => {
      const currentDeviceName = editor.getDevice();
      const currentDevice = editor.Devices.get(currentDeviceName);
      setDimaonsion({
        height: parseFloat(currentDevice.attributes.height) || "",
        width: parseFloat(currentDevice.attributes.widthMedia) || "",
      });
      setMediaValue(editor.config.mediaCondition);
    };
    editor.on("change:device", changeDeviceCallback);
    setMediaValue(editor.config.mediaCondition);

    return () => {
      editor.off("change:device", changeDeviceCallback);
    };
  }, [editor]);

  useEffect(() => {
    console.log("from lol");

    if (!editor) return;
    if (!currentEl.currentEl) return;
    const { rules } = getComponentRules({
      editor,
      cmp: editor.getSelected(),
      nested: true,
      cssCode: editor.getCss({
        avoidProtected: true,
        clearStyles: false,
        onlyMatched: false,
        keepUnusedStyles: true,
      }),
    });

    const newDetected = cloneDeep(detectedType);

    //       {
    //  *  id: string;
    //  * rule: string;
    //  * fullRule: string | null;
    //  * styles: {};
    //  * states: string | null;
    //  * statesAsArray: never[] | RegExpMatchArray | null;
    //  * atRuleType: string | null;
    //  * atRuleParams: string | null;
    //  * }[]
    for (const rule of rules) {
      if (!rule.atRuleParams && rule.fullRule) {
        newDetected.desktop.push(true);
      } else if (
        rule.atRuleParams &&
        rule.atRuleParams.includes("max-width") &&
        rule.atRuleParams.includes("768px")
      ) {
        newDetected.tablet.push(true);
      } else if (
        rule.atRuleParams &&
        rule.atRuleParams.includes("max-width") &&
        rule.atRuleParams.includes("360px")
      ) {
        newDetected.mobile.push(true);
      } else if (rule.atRuleParams) {
        newDetected.others.push(rule.atRuleParams.replace(/\(|\)/gi, ""));
      }
    }

    newDetected.others = [...new Set(newDetected.others)];
    setDetectedMedia(newDetected);
    console.log("ruules from header :", rules);
  }, [currentEl, editor]);

  useEffect(() => {
    if (!editor) return;
    editorContainerInstance.on(
      InfinitelyEvents.editorContainer.update,
      zoomCallback
    );

    const deviceChange = () => {
      console.log(editor.getDevice());
      if (!editor.getDevice()) return;

      const widthMedia = editor.Devices.get(editor.getDevice())
        .getWidthMedia()
        .match(/\d+/gi)[0];
      setWidthMedia(+widthMedia);
    };

    editor.on("change:device", deviceChange);
    editor.on("canvas:frame:load:body", deviceChange);

    return () => {
      editorContainerInstance.off(
        InfinitelyEvents.editorContainer.update,
        zoomCallback
      );
      editor.off("change:device", deviceChange);
      editor.off("canvas:frame:load:body", deviceChange);
    };
  }, [editor]);

  return (
    <header className="w-full h-[60px]  zoom-80 px-2 bg-slate-900  border-b-[1.5px]  border-slate-400    flex items-center justify-between gap-5">
      <ScrollableToolbar
        className="w-[37.5%] h-full items-center flex-shrink-0 max-w-[700px]"
        space={3}
      >
        {/* <ul className="flex gap-[25px] flex-shrink  h-full  items-center"> */}
        {/* <UlContextProvider> */}
        <ul
          ref={sizeAutoAnimate}
          className="flex items-center gap-2 justify-between flex-shrink-0 flex-grow bg-slate-800 shadow-2xl shadow-slate-950 rounded-lg w-[150px] p-1"
        >
          <Li
            title="Default size"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("desktop");
              if (detectedMedia.desktop.length) setMediaConditon("max-width");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            icon={Icons.desktop}
            id={"desktop-size"}
            notify={Boolean(detectedMedia.desktop.length)}
            mode={"group"}
            enableSelecting
          />
          <Li
            title="max-width: 768px"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("tablet");
              if (detectedMedia.tablet.length) setMediaConditon("max-width");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            fillObjectIconOnHover
            icon={Icons.tablet}
            notify={Boolean(detectedMedia.tablet.length)}
            id={"tablet-size"}
            mode={"group"}
            enableSelecting
          />

          <Li
            title="max-width: 360px"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("mobile");
              if (detectedMedia.mobile.length) setMediaConditon("max-width");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            fillObjectIconOnHover
            icon={Icons.mobile}
            notify={Boolean(detectedMedia.mobile.length)}
            id={"mobile-size"}
            mode={"group"}
            enableSelecting
          />
          {Boolean(detectedMedia.others.length) && (
            <UlContextProvider>
              <Li
                // title="Other sizes"
                // // className="max-xl:flex-shrink-0"
                // onClick={(ev) => {
                //   editor.setDevice("mobile");
                //   // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
                //   editor.trigger("device:change");
                // }}
                // isObjectParamsIcon
                // fillObjectIconOnHover
                // onClick={(ev) => {
                //   // ev.stopPropagation();
                //   ev.preventDefault();
                // }}
                // id={"other-sizes"}
                // mode={"group"}
                // enableSelecting
                notify={Boolean(detectedMedia.others.length)}
              >
                <OptionsButton role="div">
                  {
                    <ul
                      onMouseOver={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                      }}
                      className=" relative"
                    >
                      {detectedMedia.others.map((rule, i) => {
                        console.log(
                          "rule : ",
                          rule,
                          rule.trim() ==
                            `${editor.config.mediaCondition}: ${widthMedia}px`
                        );

                        return (
                          <li
                            key={i}
                            style={{
                              backgroundColor:
                                rule.trim() ==
                                `${editor.config.mediaCondition}: ${widthMedia}px`
                                  ? "var(--main-bg)"
                                  : "",
                            }}
                            className="p-2 w-[200px!important] flex justify-center items-center bg-slate-800 rounded-md transition-all hover:bg-blue-600"
                            onClick={(ev) => {
                              ev.preventDefault();
                              ev.stopPropagation();
                              addClickClass(ev.currentTarget, "click");
                              const widthValue = rule.match(/\d+/gi);
                              const mediaCondition = rule.split(":")[0];
                              console.log(widthValue, mediaCondition);
                              setMediaValue(mediaCondition);
                              editor.getConfig().mediaCondition =
                                mediaCondition;
                              localStorage.setItem(
                                "media-condition",
                                mediaCondition
                              );
                              const sle = editor.getSelected();
                              setCustomDevice("width", widthValue);
                              setDimaonsion({
                                ...dimansions,
                                width: widthValue,
                              });

                              editor.trigger("device:change");
                              preventSelectNavigation(editor, sle);
                            }}
                          >
                            {rule}
                          </li>
                        );
                      })}
                    </ul>
                  }
                </OptionsButton>
              </Li>
            </UlContextProvider>
          )}
        </ul>
        {/* </UlContextProvider> */}

        <li className="flex-shrink-0 w-[100px]">
          <Select
            preventInput
            keywords={["min-width", "max-width"]}
            placeholder="Media"
            value={mediaValue}
            onAll={(value) => {
              setMediaValue(value);
              editor.getConfig().mediaCondition = value;
              localStorage.setItem("media-condition", value);
              const sle = editor.getSelected();
              preventSelectNavigation(editor, sle);
            }}
          />
        </li>

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
};
