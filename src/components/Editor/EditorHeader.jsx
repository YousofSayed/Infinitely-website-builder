import {
  wp_connect,
  wp_get,
  wp_get_posts_with_inf_meta,
  wp_get_single,
  wp_update_media,
  wp_update_media_files,
  wp_update_meta,
  wp_update_option,
  wp_update_single,
  wp_update_symbols,
  wp_write_files,
} from "@/apps/wordpress/functions";
import { wp_get_post_id } from "@/apps/wordpress/functions_ui";
import { open_code_manager_modal } from "@/constants/InfinitelyCommands";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { editorContainerInstance } from "@/constants/InfinitelyInstances";
import { current_project_id, inf_symbol_Id_attribute, preview_url } from "@/constants/shared";
import {
  animationsState,
  asideControllersNotifiresState,
  cmdsBuildState,
  cmpRulesState,
  currentElState,
  isAnimationsChangedState,
  mediaConditionState,
  previewContentState,
  showPreviewState,
  zoomValueState,
} from "@/helpers/atoms";
import { wp_preview_bc } from "@/helpers/channels";
import {
  addClickClass,
  createBlobFileAs,
  html,
  transformToNumInput,
  uniqueID,
} from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { fetcherWorker, offlineInstallerWorker, pageBuilderWorker } from "@/helpers/defineWorkers";
import {
  buildGsapMotionsScript,
  buildScriptFromCmds,
  doInNormal,
  doInWordpress,
  doInWordpressAsync,
  exportProject,
  getComponentRules,
  getCurrentPageName,
  getProjectData,
  getProjectSettings,
  getWpPageConfig,
  getWpRestBase,
  gjsComponentsToJSON,
  isWordpress,
  preventSelectNavigation,
  reorderCss,
  shareProject,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { detectedType } from "@/helpers/jsDocs";
import { useNotifiers } from "@/hooks/useNotifiers";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Protos/Button";
import { Hr } from "@/components/Protos/Hr";
import { Li } from "@/components/Protos/Li";
import { OptionsButton } from "@/components/Protos/OptionsButton";
import { ScrollableToolbar } from "@/components/Protos/ScrollableToolbar";
import { UlContextProvider, useUlContext } from "@/components/Protos/UlProvider";
import { PagesSelector } from "@/components/Editor/PagesSelector";
import { IframeControllers } from "@/components/Editor/Protos/IframeControllers";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditorMaybe } from "@grapesjs/react";
import LLM from "@themaximalist/llm.js";
import { minify } from "csso";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep } from "lodash";
import React, { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

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
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [mediaCond, setMediaCond] = useRecoilState(mediaConditionState);
  const [publish, setPublish] = useState(false);
  const [storeLoad, setStoreLoad] = useState(false);
  const [asideControllersNotifires, setAsideControllersNotifires] =
    useRecoilState(asideControllersNotifiresState);
  const [animatedRefForPublishBtn] = useAutoAnimate();
  const projectId = +localStorage.getItem(current_project_id);

  // const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
  //   isAnimationsChangedState
  // );
  // const [animations, setAnimations] = useRecoilState(animationsState);
  const [dimansions, setDimaonsion] = useState({
    width: "",
    height: "",
  });

  useLiveQuery(async () => {
    await doInWordpressAsync(async () => {
      const projectData = await getProjectData();
      // console.log(
      //   "publish state :",
      //   Boolean(projectData.currentEditingPage?.need_publish_to_wp),
      //   Boolean(projectData?.scripts_need_to_publish),
      // );

      return setPublish(
        Boolean(projectData.currentEditingPage?.need_publish_to_wp),
        //  ||
        //   Boolean(projectData?.scripts_need_to_publish),
      );
    });
  });


  const setMediaConditon = (value) => {
    setMediaCond(value);
    setMediaValue(value);
    editor.getConfig().mediaCondition = value;
    localStorage.setItem("media-condition", value);
  };
  // const [pages, setPages] = useState([]);

  const setCustomDevice = (prop, value) => {
    prop == "width" && (widthRef.current = value);
    prop == "height" && (heightRef.current = value);
    console.log("new value", value, prop);
    const uid = uniqueID();

    if (!value) {
      editor.DeviceManager.select("desktop");
      return;
    }
    const newDevice = {
      name: uid,
      id: uid,
      width: widthRef.current + "px",
      height: heightRef.current + (heightRef.current && "px") || undefined,
      widthMedia: widthRef.current ? widthRef.current + "px" : undefined,
      // priority: +widthRef.current,
    };
    const deviceManager = editor.Devices;
    const devices = deviceManager
      .getAll()
      .toArray()
      .map((dev) => dev.attributes);

    // console.log(
    //   "new media devices :",
    //   editor.DeviceManager.getAll()
    //     .toArray()
    //     .map((dev) => dev.attributes),
    //   devices.some((dev) => +dev.priority === +newDevice.priority)
    // );

    editor.DeviceManager.remove(customDevice.current);
    // const existDevice = devices.find(
    //   (dev) =>
    //     parseFloat(dev.widthMedia || "0") === parseFloat(newDevice.widthMedia)
    // );
    // if (existDevice) {
    //   console.log("new existDevice", existDevice);
    //   editor.setDevice(existDevice?.id || existDevice?.name || 'desktop');
    //   editor.trigger("inf:rules:update");

    //   return;
    // }
    const concatedArray = devices.concat(newDevice);
    concatedArray.sort((a, b) => {
      const wa = parseFloat(a.widthMedia) || Infinity; // Desktop last
      const wb = parseFloat(b.widthMedia) || Infinity;
      return wa - wb;
    });

    // console.log("new devices : ", devices);

    const newDevices = cloneDeep(
      concatedArray.reverse().map((dev, i) => {
        dev = {
          ...dev,
          priority: i + 1,
        };
        // .set({ priority: i + 1 });
        return dev;
      }),
    );

    const newDeviceWithNewPiriority = newDevices.find(
      (dev) => dev.name === uid,
    );
    // console.log(`new deivce : `, newDeviceWithNewPiriority);

    customDevice.current = editor.DeviceManager.add(newDeviceWithNewPiriority);
    // customDevice.current = editor.DeviceManager.add(newDevice);
    // console.log(
    //   "new media devices :",
    //   editor.DeviceManager.getAll()
    //     .toArray()
    //     .map((dev) => dev.attributes),
    //   editor.getCss(),
    // );

    editor.setDevice(uid);
    editor.trigger("inf:rules:update");
  };

  const zoomCallback = (ev) => {
    const { value } = ev.detail;
    // console.log('value zoom : ' , value);

    setZoomValue((value * 100).toFixed(2));
  };

  const publishToWp = async () => {
    let tId = toast.loading(<ToastMsgInfo msg={`Publish to wordpress...✨`} />);
    const res_base = getWpRestBase();
    const wp_post = getWpPageConfig();
    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await getProjectData();
    const { projectSettings } = getProjectSettings();
    const symbols = editor.getWrapper().find(`[${inf_symbol_Id_attribute}]`).map(cmp => {
      const symbol_id = cmp.getAttributes()[inf_symbol_Id_attribute];

      if (!symbol_id) return null;

      return {
        symbol_id,
        post_meta: {
          before_save: '__DELETE__',
          saved: {
            html: gjsComponentsToJSON(cmp, true),
            css: minify(getComponentRules({
              editor,
              cmp,
              nested: true,
            }).stringRules).css
          }
        }
      }
    }).filter(Boolean);

    let steps = 0;
    const max_steps = 2 + Number(Boolean(symbols.length));
    setPublish(false);

    const afterSave = async () => {
      steps++;
      if (steps >= max_steps) {
        await db.projects.update(projectId, {
          scripts_need_to_publish: false,
          projectSetting: projectSettings,
          save_state: "saved",
          current_inf_meta: {
            before_save: {
              ...(projectData?.current_inf_meta?.before_save || {}),
            },
            saved: {
              ...(projectData?.current_inf_meta?.before_save || {}),
            },
          },
          currentEditingPage: {
            need_publish_to_wp: false,
            save_state: "saved",
          },
        });
        wp_preview_bc.postMessage({
          props: {
            url: wp_post.link,
            mode: "preview",
            save_state: "saved",
          },
        });
        toast.done(tId);
      }
    };

    // wp_update_symbols
    wpWorkerCallbackMaker(offlineInstallerWorker, 'wp_update_symbols', {
      symbols,
      projectId
    }, async (res) => {
      console.log('wp_update_symbols', res);
      if (res.done) {
        await afterSave();
        toast.success(<ToastMsgInfo msg={`Symbols updated 💙`} />);
      } else {
        toast.dismiss(tId);
        toast.error(<ToastMsgInfo msg={`Faild to update symbols 😡`} />);
        throw new Error(`Faild to update symbols 😡 , why?`);
      }
    })

    // wp_update_meta;
    wpWorkerCallbackMaker(
      fetcherWorker,
      "wp_update_meta",
      {
        projectId,
        post_id: wp_get_post_id(),
        post_type: wp_post.type,
        meta_key: "inf_meta",
        merge: true,
        meta_value: {
          before_save: null,
          saved: {
            ...(projectData?.current_inf_meta?.before_save || {}),
          },
        },
      },
      async (res) => {
        if (res.done) {
          await afterSave();
          toast.success(
            <ToastMsgInfo msg={`Your amazing edits published 💙`} />,
          );
        } else {
          toast.dismiss(tId);
          toast.error(<ToastMsgInfo msg={`Post Edits not published 😡`} />);
          throw new Error(`User Edits not published 😡 , why?`);
        }
      },
    );

    // wp_update_option;
    wpWorkerCallbackMaker(
      infinitelyWorker,
      "wp_update_option",
      {
        optionName: "inf_config",
        value: { ...projectData, currentEditingPage: {}, current_inf_meta: {} },
        projectId,
        merge: true,
      },
      async (res) => {
        if (res.done) {
          await afterSave();
          toast.success(<ToastMsgInfo msg={`Config merged 💙`} />);
        } else {
          toast.dismiss(tId);
          toast.error(<ToastMsgInfo msg={`Config not published 😡`} />);
          throw new Error(`User Config not published 😡 , why?`);
        }
      },
    );



    // wpWorkerCallbackMaker(
    //   pageBuilderWorker,
    //   "wp_update_main_global_files",
    //   {
    //     data: {
    //       id: projectId,
    //       projectSetting: projectSettings,
    //       projectData,
    //       global: {
    //         css: "",
    //         js: "",
    //       },
    //     },
    //   },
    //   async (res) => {
    //     if (res.done) {
    //       await afterSave();
    //       toast.success(<ToastMsgInfo msg={`Editor scripts updated 💙`} />);
    //     } else {
    //       toast.dismiss(tId);
    //       toast.error(
    //         <ToastMsgInfo msg={`Faild to update editor scripts 😡`} />,
    //       );
    //       throw new Error(`Editor scripts not updated 😡 , why?`);
    //     }
    //   },
    // );
  };

  // useEffect(() => {
  //   (async () => {
  //     const llm = new LLM();
  //     llm.model = 'qwen2.5-coder:1.5b';
  //     llm.system(`You are an Infinitely Stduio Ai Assaistant , you created by team of Infinitely Studio , you are expert in ai and machine learning , who created infinitely studio is yousef sayed , infinitely studio is website builder can build frontend headless websites and it is website builder for wordpress , your role is to generate code for website builder , user will give you prompts to generate code , your job is to only give user the code (only code) no more . `)
  //     const res = await llm.chat(
  //       " generate hero section by HTML & CSS code for a coffee website and make design soo fancy and modern and make it responsive and make it look like a coffee shop website",
  //       { stream: false, max_thinking_tokens: 30000000 }
  //     );
  //     console.log(`hiiiiiiiiiiiiiiiiiiiiiiiiii`)

  //     console.log("Final response:", res);
  //   })()
  // }, [])

  useEffect(() => {
    if (!editor) return;
    const saveStart = () => {
      setPublish(false);
      setStoreLoad(true);
    };

    const saveEnd = () => {
      setStoreLoad(false);
    };


    editor.on(InfinitelyEvents.storage.storeStart, saveStart);
    editor.on(InfinitelyEvents.storage.storeEnd, saveEnd);

    return () => {
      editor.off(InfinitelyEvents.storage.storeStart, saveStart);
      editor.off(InfinitelyEvents.storage.storeEnd, saveEnd);
    };
  }, [editor]);

  useEffect(() => {
    if (!(editor && editor.getContainer())) return;
    // console.log('html editor : ' , editor.getWrapper().getInnerHTML({withProps:true , withScripts: true}));
    // getHtml({withProps:true , asDocument:false , })
    setZoomValue((editor.getContainer().style.zoom * 100).toFixed(2));

    const changeDeviceCallback = () => {
      const currentDeviceName = editor.getDevice();

      const currentDevice = editor.Devices.get(currentDeviceName);
      console.log("currentDeviceName", currentDevice);
      setDimaonsion({
        height: parseFloat(currentDevice.attributes.height) || "",
        width: parseFloat(currentDevice.attributes.widthMedia) || "",
      });
      setMediaValue(editor.config.mediaCondition);
      reorderCss(editor);
      // setInterval(() => {
      //   editor.refresh({ tools: true });
      //   editor.Canvas.refresh({ all: true, spots: true });
      //   editor.Canvas.refreshSpots();
      // }, 500)
      // alert('wowow')
    };
    editor.on("change:device", changeDeviceCallback);
    editor.on(InfinitelyEvents.devices.update, changeDeviceCallback);
    setMediaValue(editor.config.mediaCondition);

    return () => {
      editor.off("change:device", changeDeviceCallback);
      editor.off(InfinitelyEvents.devices.update, changeDeviceCallback);
    };
  }, [editor]);

  useEffect(() => {


    if (!editor) return;
    if (!currentEl.currentEl) return;
    // if (!cmpRules.length) return;
    if (!cmpRules.length) {
      setDetectedMedia(cloneDeep(detectedType));
      return;
    }

    // const rules = cmpRules;

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
    for (const rule of cmpRules) {
      console.log("full rule", rule);
      if (!rule.atRuleParams && rule.rule) {
        newDetected.desktop.push(true);
      } else if (
        rule.atRuleParams &&
        rule.atRuleParams.includes("max-width") &&
        rule.atRuleParams.includes("900px")
      ) {
        newDetected.tablet.push(true);
      } else if (
        rule.atRuleParams &&
        rule.atRuleParams.includes("max-width") &&
        rule.atRuleParams.includes("480px")
      ) {
        newDetected.mobile.push(true);
      } else if (rule.atRuleParams) {
        newDetected.others.push(rule.atRuleParams.replace(/\(|\)/gi, ""));
      }
    }

    newDetected.others = [...new Set(newDetected.others)];
    setDetectedMedia(newDetected);
    console.log("ruules from header :", cmpRules);
  }, [currentEl, editor, cmpRules]);

  useEffect(() => {
    if (!editor) return;
    editorContainerInstance.on(
      InfinitelyEvents.editorContainer.update,
      zoomCallback,
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
        zoomCallback,
      );
      editor.off("change:device", deviceChange);
      editor.off("canvas:frame:load:body", deviceChange);
    };
  }, [editor]);

  useNotifiers();

  return (
    <header className="w-full h-[55px]  zoom-80 px-2 bg-surface-secondary  border-b-[1.5px]  border-slate-400    flex items-center justify-between gap-5">
      <ScrollableToolbar
        className="w-[37.5%] h-full items-center flex-shrink-0 max-w-[700px]"
        space={3}
      >
        {/* <ul className="flex gap-[25px] flex-shrink  h-full  items-center"> */}
        {/* <UlContextProvider> */}
        <ul
          ref={sizeAutoAnimate}
          className="flex items-center gap-2 justify-between flex-shrink-0 flex-grow bg-surface-tertiary shadow-2xl shadow-slate-950 rounded-lg w-[150px] p-1"
        >
          <Li
            title="Default size"
            className="flex-shrink-0"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("desktop");
              setMediaConditon("");
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
            title="max-width: 900px"
            className="flex-shrink-0"
            // className="max-xl:flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("tablet");
              setMediaConditon("max-width");
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
            className="flex-shrink-0"
            onClick={(ev) => {
              editor.setDevice("mobile");
              setMediaConditon("max-width");
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
            // <UlContextProvider>
            // <Li
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
            // notify={Boolean(detectedMedia.others.length)}
            // >
            // <div className="flex-shrink flex-grow-0  w-[35px] flex justify-center items-center">
            <OptionsButton
              className="hover:bg-brand-primary w-[30px!important] h-[30px]"
              notify={Boolean(detectedMedia.others.length)}
            >
              {
                <ul
                  onMouseOver={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  className=" relative flex flex-col gap-2"
                >
                  {detectedMedia.others.map((rule, i) => {
                    console.log(
                      "rule : ",
                      rule,
                      rule.trim() ==
                      `${editor.config.mediaCondition}: ${widthMedia}px`,
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
                        className="p-2 bg-slate-700 w-[200px!important] flex justify-center items-center  rounded-md  transition-all hover:bg-brand-primary"
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          addClickClass(ev.currentTarget, "click");
                          const widthValue = rule.match(/\d+/gi);
                          const mediaCondition = rule.split(":")[0];
                          // console.log("widthValue" , widthValue, mediaCondition);
                          setMediaValue(mediaCondition);
                          setMediaCond(mediaCondition);

                          editor.getConfig().mediaCondition = mediaCondition;
                          localStorage.setItem(
                            "media-condition",
                            mediaCondition,
                          );
                          const sle = editor.getSelected();
                          setDimaonsion({
                            ...dimansions,
                            width: +widthValue[0],
                          });
                          setCustomDevice("width", +widthValue[0]);

                          editor.trigger("device:change");
                          // preventSelectNavigation(editor, sle);
                        }}
                      >
                        {rule}
                      </li>
                    );
                  })}
                </ul>
              }
            </OptionsButton>
            // </div>
            // </Li>
            // </UlContextProvider>
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
            className="bg-surface-tertiary p-1 w-[70px] text-center  h-full font-bold text-sm max-lg:flex-shrink-0"
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
            className="bg-surface-tertiary w-[70px] p-1  text-center  h-full font-bold text-sm max-lg:flex-shrink-0 "
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
            className="bg-surface-tertiary w-[70px] p-1  text-center  h-full font-bold text-sm max-lg:flex-shrink-0 "
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
        className="p-[unset] bg-surface-tertiary max-w-[30%] h-[calc(100%-15px)] "
        containerClassName="bg-surface-tertiary"
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
              doInNormal(() => {
                localStorage.setItem(preview_url, getCurrentPageName());
                window.open(
                  `/${getCurrentPageName()}`,
                  "infinitely-preview",
                  // 'width=800,height=600,top=50,left=50,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=yes,titlebar=yes'
                );
              });

              doInWordpress(async () => {
                localStorage.setItem(preview_url, getCurrentPageName());
                const wp_post = getWpPageConfig();
                const projectData = await getProjectData();
                window.open(
                  `/wordpress/preview?url=${wp_post.link}&save_state=${projectData.currentEditingPage.save_state}&mode=preview`,
                  "infinitely-preview",
                  // 'width=800,height=600,top=50,left=50,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=yes,titlebar=yes'
                );
              });
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
                        "https://tmpfiles.org/dl/",
                      );
                      await navigator.clipboard.writeText(
                        `${window.origin}/workspace?file=${btoa(fileUrl)}`,
                      );
                      toast.info(
                        <ToastMsgInfo
                          msg={`Share URL is copied , so you can share now💙`}
                        />,
                        { progressClassName: "bg-brand-primary" },
                      );
                    }
                    fetcherWorker.removeEventListener("message", callback);
                  }
                };
                fetcherWorker.addEventListener("message", callback);
              }}
            />

            {/* <p className="absolute top-[100%] left-[-150px] w-[300px] p-2 bg-surface-tertiary rounded-lg z-[500]">dadsadadl dlas,dlsadlklsakdlaksldksalkdlsalkd</p> */}
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
            notify={Object.values(asideControllersNotifires).some(
              (val) => val === true,
            )}
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

        {isWordpress() && (
          <section className="ml-2 w-[calc(100%+25px)]">
            <Button
              refForward={animatedRefForPublishBtn}
              disabled={storeLoad || !publish}
              onClick={(ev) => {
                publishToWp();
              }}
              className="font-bold capitalize flex items-center justify-center gap-2 w-full"
            >
              {storeLoad && (
                <section>
                  <Loader
                    width={20}
                    height={20}
                    loaderClassName={"border-white"}
                  />
                </section>
              )}
              {storeLoad ? <p>Process</p> : <p>Publish</p>}
            </Button>
          </section>
        )}

        {/* <Button>Publish</Button> */}
        {/* </div> */}
      </ScrollableToolbar>
      {/* </section> */}
      {/* </ToolbarComponent> */}
    </header>
  );
};
