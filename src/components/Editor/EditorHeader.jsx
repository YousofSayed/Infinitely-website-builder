import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { wp_get_post_id } from "@/Apps/wordpress/functions_ui";
import { open_code_manager_modal } from "@/constants/InfinitelyCommands";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { editorContainerInstance } from "@/constants/InfinitelyInstances";
import {
  current_project_id,
  inf_symbol_Id_attribute,
  preview_url,
} from "@/constants/shared";
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
import {
  AIWorker,
  fetcherWorker,
  offlineInstallerWorker,
  pageBuilderWorker,
} from "@/helpers/defineWorkers";
import {
  buildGsapMotionsScript,
  buildScriptFromCmds,
  callWorkerCommand,
  doInNormal,
  doInWordpress,
  doInWordpressAsync,
  exportProject,
  getComponentRules,
  getCurrentPageName,
  getProjectData,
  getProjectId,
  getProjectSettings,
  getWpPageConfig,
  getWpRestBase,
  gjsComponentsToJSON,
  isNormal,
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
import {
  UlContextProvider,
  useUlContext,
} from "@/components/Protos/UlProvider";
import { PagesSelector } from "@/components/Editor/PagesSelector";
import { IframeControllers } from "@/components/Editor/Protos/IframeControllers";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditorMaybe } from "@grapesjs/react";
import { minify } from "csso";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep } from "lodash";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Wordpress } from "../Protos/wordpress/Wordpress";
import { OverflowList } from "react-responsive-overflow-list";
import { wp_get_media_files_by_slugs } from "@/Apps/wordpress/functions";

// export const HomeHeader = () => <h1>helo</h1>
export const HomeHeader = memo(() => {
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

    editor.DeviceManager.remove(customDevice.current);

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
    const symbols = editor
      .getWrapper()
      .find(`[${inf_symbol_Id_attribute}]`)
      .map((cmp) => {
        const symbol_id = cmp.getAttributes()[inf_symbol_Id_attribute];

        if (!symbol_id) return null;

        return {
          symbol_id,
          post_meta: {
            before_save: "__DELETE__",
            saved: {
              html: gjsComponentsToJSON(cmp, true),
              css: minify(
                getComponentRules({
                  editor,
                  cmp,
                  nested: true,
                }).stringRules,
              ).css,
            },
          },
        };
      })
      .filter(Boolean);

    console.log("symbols before publish ", symbols);

    let steps = 0;
    const max_steps = 2 + Number(Boolean(symbols.length));
    setPublish(false);

    const afterSave = async () => {
      steps++;
      if (steps >= max_steps) {
        await db.projects.update(projectId, {
          scripts_need_to_publish: false,
          scripts_need_arranged: false,
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
    symbols.length &&
      wpWorkerCallbackMaker(
        offlineInstallerWorker,
        "wp_update_symbols",
        {
          symbols,
          projectId,
        },
        async (res) => {
          console.log("wp_update_symbols", res);
          if (res.done) {
            await afterSave();
            toast.success(<ToastMsgInfo msg={`Symbols updated 💙`} />);
          } else {
            toast.dismiss(tId);
            toast.error(<ToastMsgInfo msg={`Faild to update symbols 😡`} />);
            throw new Error(`Faild to update symbols 😡 , why?`);
          }
        },
      );

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
  };

  useMemo(() => {
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

  useMemo(() => {
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
        width:
          currentDevice.getName().toLowerCase() === "desktop"
            ? ""
            : parseFloat(currentDevice.attributes.widthMedia) || "",
      });
      setMediaValue(
        currentDevice.getName().toLowerCase() === "desktop"
          ? ""
          : editor.config.mediaCondition,
      );
      reorderCss(editor);
    };
    editor.on("change:device", changeDeviceCallback);
    editor.on(InfinitelyEvents.devices.update, changeDeviceCallback);
    editor.onReady(changeDeviceCallback);
    // setMediaValue(editor.config.mediaCondition);

    return () => {
      editor.off("change:device", changeDeviceCallback);
      editor.off(InfinitelyEvents.devices.update, changeDeviceCallback);
    };
  }, [editor]);

  useMemo(() => {
    if (!editor) return;
    if (!currentEl.currentEl) return;
    // if (!cmpRules.length) return;
    if (!cmpRules.length) {
      setDetectedMedia(cloneDeep(detectedType));
      return;
    }

    // const rules = cmpRules;

    const newDetected = cloneDeep(detectedType);

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

  useMemo(() => {
    if (!editor) return;
    editorContainerInstance.on(
      InfinitelyEvents.editorContainer.update,
      zoomCallback,
    );

    const deviceChange = () => {
      console.log(editor.getDevice());
      if (!editor.getDevice()) return;

      const widthMedia = editor.Devices.get(editor.getDevice())
        ?.getWidthMedia?.()
        ?.match?.(/\d+/gi)?.[0];

      // console.log('widthMedia : ' , widthMedia);

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

  const tools = useMemo(() => {
    return [
      <IframeControllers />,
      // <Hr />,
      <Li
        onClick={() => {
          editor.runCommand(open_code_manager_modal);
        }}
        title="Code manager"
        className="shrink-0"
      >
        {Icons.code({ strokWidth: 3 })}
      </Li>,

      <Li
        title="preview mode"
        icon={Icons.watch}
        onClick={(ev) => {
          // localStorage.setItem(preview_url, getCurrentPageName());
          // window.open(`/preview/${getCurrentPageName()}`, "_blank");

          setShowPreview((old) => !old);
        }}
        className="shrink-0"
      />,

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
        className="shrink-0"
      />,

      <Li
        icon={Icons.save}
        title="save"
        justHover={true}
        className="shrink-0"
        onClick={() => {
          editor.store();
        }}
      />,

      <Li
        icon={Icons.share}
        title="share"
        isObjectParamsIcon
        className="shrink-0"
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
      />,

      <Li
        icon={Icons.export}
        title="export"
        justHover={true}
        className="shrink-0"
        onClick={async () => {
          exportProject();
        }}
      />,
      <Li
        to={"/edite/styling"}
        className="shrink-0"
        icon={Icons.prush}
        isObjectParamsIcon
        fillObjIcon={false}
        fillObjectIconOnHover
        notify={Object.values(asideControllersNotifires).some(
          (val) => val === true,
        )}
        title="edite component"
      />,
      <Li
        to={"/add-blocks"}
        className="shrink-0"
        icon={Icons.plus}
        fillIcon
        fillObjIcon
        title="add blocks"
      />,
    ];
  }, [editor, asideControllersNotifires, currentEl, cmpRules, showPreview]);

  useEffect(() => {
    (async ()=>{
      const projectData = await getProjectData();
      console.log( 'jsFooterLibs' , await wp_get_media_files_by_slugs({
        slugs:projectData.jsFooterLibs.map(item=>item.slug),
        projectId:getProjectId()
      }));
      
    })()
  } , [])

  return (
    <header
      className={
        `
        disable-when-load
      grid
      ${isNormal() ? `grid-cols-[minmax(0,1fr)_minmax(0,1fr)]`  : `grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]`}
      items-center
      gap-1
      w-full
      h-[55px]
      z-[999]
      zoom-80
      px-2
      bg-surface-secondary
      overflow-hidden
      border-b-[1.5px]
      border-slate-600
      auto-animate
      animate-go-to
        `
      }
    >
      {/* =========================================================
        LEFT / DEVICE CONTROLS
        ========================================================= */}
      <ScrollableToolbar className="h-[calc(100%-8px)] ">
       
          {/* Device buttons */}
          <ul
            ref={sizeAutoAnimate}
            className="
          flex
          items-center
          w-[150px]
          min-w-[150px]
          h-full
          gap-
          justify-between
          shrink-0
          bg-surface-tertiary
          shadow-2xl
          shadow-slate-950
          rounded-lg
          p-1
        "
          >
            <Li
              title="Default size"
              className="shrink-0"
              onClick={() => {
                editor.setDevice("desktop");
                setMediaConditon("");
                editor.trigger("device:change");
              }}
              isObjectParamsIcon
              icon={Icons.desktop}
              id="desktop-size"
              notify={Boolean(detectedMedia.desktop.length)}
              mode="group"
              enableSelecting
            />

            <Li
              title="max-width 900px"
              className="shrink-0"
              onClick={() => {
                editor.setDevice("tablet");
                setMediaConditon("max-width");
                editor.trigger("device:change");
              }}
              isObjectParamsIcon
              fillObjectIconOnHover
              icon={Icons.tablet}
              notify={Boolean(detectedMedia.tablet.length)}
              id="tablet-size"
              mode="group"
              enableSelecting
            />

            <Li
              title="max-width 360px"
              className="shrink-0 relative"
              onClick={() => {
                editor.setDevice("mobile");
                setMediaConditon("max-width");
                editor.trigger("device:change");
              }}
              isObjectParamsIcon
              fillObjectIconOnHover
              icon={Icons.mobile}
              notify={Boolean(detectedMedia.mobile.length)}
              id="mobile-size"
              mode="group"
              enableSelecting
            />

            {Boolean(detectedMedia.others.length) && (
              <OptionsButton
                className="
              hover:bg-brand-primary
              !w-[30px]
              !h-[30px]
              shrink-0
            "
                notify={Boolean(detectedMedia.others.length)}
              >
                <ul
                  onMouseOver={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  className="relative flex flex-col gap-2"
                >
                  {detectedMedia.others.map((rule, i) => {
                    const widthValue = rule.match(/\d+/gi);
                    const mediaCondition = rule.split(":")[0];

                    return (
                      <li
                        key={i}
                        style={{
                          backgroundColor:
                            rule.trim() ===
                            `${editor.config.mediaCondition}: ${widthMedia}px`
                              ? "var(--main-bg)"
                              : "",
                        }}
                        className="
                      p-2
                      bg-slate-700
                      !w-[200px]
                      flex
                      justify-center
                      items-center
                      rounded-md
                      transition-all
                      hover:bg-brand-primary
                    "
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();

                          addClickClass(ev.currentTarget, "click");

                          setMediaValue(mediaCondition);
                          setMediaCond(mediaCondition);

                          editor.getConfig().mediaCondition = mediaCondition;

                          localStorage.setItem(
                            "media-condition",
                            mediaCondition,
                          );

                          setDimaonsion({
                            ...dimansions,
                            width: +widthValue[0],
                          });

                          setCustomDevice("width", +widthValue[0]);

                          editor.trigger("device:change");
                        }}
                      >
                        {rule}
                      </li>
                    );
                  })}
                </ul>
              </OptionsButton>
            )}
          </ul>

          {/* Media */}
          <div className=" w-full grow-0 h-full min-w-[200px]">
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
          </div>

          {/* Dimensions */}
          <div className="flex h-full gap-1 shrink-0">
            <Input
              type="number"
              placeholder="Width"
              className="
            bg-surface-tertiary
            p-1
            !w-[70px]
            min-w-[70px]
            text-center
            h-full
            font-bold
            text-sm
            shrink-0
          "
              value={dimansions.width}
              onInput={(ev) => {
                setCustomDevice("width", ev.target.value);

                setDimaonsion({
                  ...dimansions,
                  width: ev.target.value,
                });

                setCurrentEl({
                  currentEl: JSON.stringify(editor.getSelected()),
                });
              }}
            />

            <Input
              type="number"
              value={dimansions.height}
              placeholder="Height"
              className="
            bg-surface-tertiary
            !w-[70px]
            min-w-[70px]
            p-1
            text-center
            h-full
            font-bold
            text-sm
            shrink-0
          "
              onInput={(ev) => {
                setCustomDevice("height", ev.target.value);

                setDimaonsion({
                  ...dimansions,
                  height: ev.target.value,
                });

                setCurrentEl({
                  currentEl: editor.getSelected().getEl(),
                });
              }}
            />

            <Input
              value={zoomValue}
              placeholder="Zoom"
              className="
            bg-surface-tertiary
            !w-[70px]
            min-w-[70px]
            p-1
            text-center
            h-full
            font-bold
            text-sm
            shrink-0
          "
              type="number"
              onInput={(ev) => {
                const val = ev.target.value;
                const container = editor.getContainer();

                container.style.zoom = val / 100;

                const parent = container.parentElement;

                if (parent) {
                  parent.style.display = "flex";
                  parent.style.justifyContent = "center";
                  parent.style.alignItems = "center";
                  parent.style.width = "100%";
                  parent.style.height = "100%";
                  parent.style.overflow = "hidden";
                }

                setZoomValue(val);

                editorContainerInstance.emit(
                  InfinitelyEvents.editorContainer.update,
                  {
                    value: container.style.zoom,
                  },
                );
              }}
            />
          </div>

          {/* Pages */}
          <div className="shrink-0 h-full">
            <PagesSelector />
          </div>

      </ScrollableToolbar>

      {/* =========================================================
        TOOLS
        ========================================================= */}
      {/* <section
        className="
        min-w-0
        w-full
        h-full
        flex
        overflow-hidden
        bg-surface-tertiary
        p-1
        rounded-lg
      "
      > */}
       <ScrollableToolbar
        innerClassName="w-full flex justify-between  bg-surface-tertiary p-1 rounded-lg [&_svg]:!w-[19px] [&_svg]:!h-[19px]"
        className="h-[calc(100%-8px)]"
      >
   
          {tools.map((tool, i) => {
            return <React.Fragment key={i}>{tool}</React.Fragment>;
          })}
       
      </ScrollableToolbar>
      
      {/* <OverflowList
          items={tools}
          maxRows={1}
          // maxVisibleItems={tools.length}
          
          // observeItemSizes
          // flushImmediately
          className="
          w-full

          h-full

          justify-between
          gap-2
        "
          renderItem={(item) => (
            <
              
            >
              {item}
            </>
          )}
          renderOverflow={(hiddenItems) => (
            <div
              className="
              shrink-0
              grow-0
              flex

              justify-between
            "
            >
              <OptionsButton
                className="
                !w-[30px]
                !min-w-[30px]
                !h-[30px]
                shrink-0
                grow-0
                
              "
              >
                <div
                className="gap-2 flex flex-col"
                >
                  {hiddenItems.map((item, i) => (
                    <React.Fragment
                      key={i}
                      
                    >
                      {item}
                    </React.Fragment>
                  ))}
                </div>
              </OptionsButton>
            </div>
          )}
          style={{
            width: "100%",
            minWidth: 0,
            height: "100%",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            alignContent: "center",
            gap: "8px",
            overflow: "hidden",
          }}
        /> */}
      {/* </section> */}

      {/* =========================================================
        WORDPRESS
        ========================================================= */}
      <Wordpress>
        <section
          className="
          w-[140px]
          min-w-[140px]
          max-w-[200px]
          !h-full
          py-1
        "
        >
          <Button
            refForward={animatedRefForPublishBtn}
            disabled={storeLoad || !publish}
            onClick={() => {
              publishToWp();
            }}
            className="
            font-bold
            capitalize
            flex
            items-center
            justify-center
            gap-1
            w-full
            !h-full
          "
          >
            {storeLoad && (
              <section className="w-[15px] h-[15px] shrink-0">
                <Loader width={15} height={15} loaderClassName="border-white" />
              </section>
            )}

            {storeLoad ? <p>Process</p> : <p>Publish</p>}
          </Button>
        </section>
      </Wordpress>
    </header>
  );
});
