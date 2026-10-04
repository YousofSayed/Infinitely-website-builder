import { animationsSavingMsg } from "@/constants/confirms";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import {
  editorStorageInstance,
  styleInfInstance,
} from "@/constants/InfinitelyInstances";
import { current_page_id, current_project_id } from "@/constants/shared";
import {
  animationsState,
  animationsWillRemoveState,
  consoleLogs,
  currentElState,
  isAnimationsChangedState,
  reloaderState,
  showAnimationsBuilderState,
  showComponentsInLeftPanelState,
  showDragLayerState,
  showLayersState,
  showPreviewState,
  zoomValueState,
} from "@/helpers/atoms";
import { defineRoot } from "@/helpers/bridge";
import { addClickClass } from "@/helpers/cocktail";
import { keyframesGetterWorker } from "@/helpers/defineWorkers";
import {
  doInNormal,
  doInNormalAsync,
  doInWordpress,
  doInWordpressAsync,
  emitChange,
  getCurrentPageName,
  getProjectData,
  getWpPageConfig,
  reorderCss,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { iframeType, refType } from "@/helpers/jsDocs";
import { useSetClassForCurrentEl } from "@/hooks/useSetclassForCurrentEl";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Protos/Button";
import Portal from "@/components/Editor/Portal";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Canvas, useEditorMaybe } from "@grapesjs/react";
import monacoLoader from "@monaco-editor/loader";
import interact from "interactjs";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useSetWpTokensQueryVars } from "@/hooks/useSetWpTokensQueryVars";
import { useUpdateWpEditorScriptsInBackground } from "@/hooks/useUpdateWpEditorScriptsInBackground";
import { ShowIf } from "@/components/ShowIf";
import { uniqueId } from "lodash";
import { flushSync } from "react-dom";
import { Input } from "@/components/Editor/Protos/Input";
import { useConsoleFeed } from "@/hooks/useConsoleFeed";

export const Iframe = () => {
  const showLayers = useRecoilValue(showLayersState);
  const [showAnimBuilder, setShowAnimBuilder] = useRecoilState(
    showAnimationsBuilderState,
  );
  // const [isResize, setIsResize] = useState(false);
  // const [reloader, setReloader] = useRecoilState(reloaderState);
  const [showPreview, setShowPreview] = useRecoilState(showPreviewState);
  // const [showDragLayer, setShowDragLayer] = useRecoilState(showDragLayerState);
  const [animations, setAnimations] = useRecoilState(animationsState);
  const [animationsWillRemove, setAnimationsWillRemove] = useRecoilState(
    animationsWillRemoveState,
  );
  const [saveLoad, setSaveLoad] = useState(false);
  const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
    isAnimationsChangedState,
  );
  const pageName = localStorage.getItem(current_page_id);

  const urlSrc =
    pageName.toLowerCase() == "index"
      ? "./index.html"
      : `../pages/${pageName}.html`;
  const [previewSrc, setPreviewSrc] = useState(urlSrc);
  const previewIframe = useRef(iframeType);

  // ✅ FIXED: Replaced editorIframe with editorWindow and added previewWindow
  const [previewWindow, setPreviewWindow] = useState(null);
  // const [editorWindow, setEditorWindow] = useState(null);

  const iframeContainer = useRef();
  // const virtualBrowserWindow = useRef(iframeType);
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const setStyle = useSetClassForCurrentEl();
  // const [autoAnimate] = useAutoAnimate();
  const [animatePreviewContainer] = useAutoAnimate();
  const [showLoader, setShowLoader] = useState(true);
  const [showPreviewLoader, setShowPreviewLoader] = useState(true);
  const editorWrapper = useRef(refType);
  const previewRef = useRef(refType);
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );
  // const [currentEl, setCurrentEl] = useRecoilState(currentElState);
  // const [zoomValue, setZoomValue] = useRecoilState(zoomValueState);
  const [previewIframeClient, setPreviewIframeClient] = useState({
    width: null,
    height: null,
    zoom: null,
  });

  // const [logs, setLogs] = useRecoilState(consoleLogs);

  // ✅ FIXED: Pass the Window objects to the hook
  // doInNormal(() => {
  // });
  useConsoleFeed();

  // useConsoleFeed(editorWindow, "editor");

  // ✅ FIXED: Listen to GrapesJS events to grab the canvas window dynamically
  // useEffect(() => {
  //   if (!editor) return;

  //   const updateEditorWindow = (ev) => {
  //     // const iframeEl = editor.Canvas.getFrameEl();
  //     // if (iframeEl && iframeEl?.contentWindow) {
  //     //   setEditorWindow(iframeEl.contentWindow);
  //     // }
  //     // alert("updateEditorWindow");
  //     console.log("evoooooooooooo - 2 : ", ev);

  //     const wind = ev?.console ? ev : ev?.window?.console ? ev.window : null;
  //     console.log("evoooooooooooo - 2 window from start loading", ev , wind);
  //     if (wind) {
  //       // setEditorWindow(wind);
  //     }
  //   };

  //   const iframeWindow = editor.Canvas.getFrameEl()?.contentWindow;
  //   if (iframeWindow) {
  //     setEditorWindow(iframeWindow);
  //     console.log("evoooooooooooo - 2 iframe window: ", iframeWindow);
  //   }

  //   editor.on(InfinitelyEvents.storage.loadStart, updateEditorWindow);
  //   // editor.on("canvas", updateEditorWindow);
  //   editor.on("canvas:frame:load", updateEditorWindow);
  //   // editor.on("canvas:frame:load:body", updateEditorWindow);
  //   // editor.on("canvas:ready", updateEditorWindow);

  //   return () => {
  //     editor.off("canvas", updateEditorWindow);
  //     editor.off("canvas:frame:load", updateEditorWindow);
  //     editor.off("canvas:frame:load:body", updateEditorWindow);
  //     editor.off("canvas:ready", updateEditorWindow);
  //     editor.off(InfinitelyEvents.storage.loadStart, updateEditorWindow);
  //   };
  // }, [editor]);

  // useEffect(()=>{
  //   if(!editor) return;

  //   const callback = (ev) => {
  //     setCurrentEl(null);
  //   }

  //   editor.on(InfinitelyEvents.storage.loadStart, callback);
  // }, [editor])

  const saveAnimations = () => {
    if (isAnimationsChanged) {
      setSaveLoad(true);
      setAnimationsChanged("pendding");

      if (animationsWillRemove.length) {
        keyframesGetterWorker.postMessage({
          command: "removeAnimation",
          props: {
            keyframes: animationsWillRemove,
            projectId,
            editorCss: editor.getCss({
              keepUnusedStyles: false,
              avoidProtected: true,
            }),
          },
        });
        const callback = (ev) => {
          const { command, props } = ev.data;
          if (command == "animationsRemoved" && props.done) {
            setAnimationsWillRemove([]);
            keyframesGetterWorker.postMessage({
              command: "saveAnimations",
              props: {
                animations,
                projectId,
                editorCss: editor.getCss({
                  keepUnusedStyles: false,
                  avoidProtected: true,
                }),
              },
            });
            keyframesGetterWorker.removeEventListener("message", callback);
          }
        };

        keyframesGetterWorker.addEventListener("message", callback);
      } else {
        keyframesGetterWorker.postMessage({
          command: "saveAnimations",
          props: {
            animations,
            projectId,
            editorCss: editor.getCss({
              keepUnusedStyles: false,
              avoidProtected: true,
            }),
          },
        });
      }
    }
  };

  useEffect(() => {
    if (!editor) return;
    if (!animations.length) return;
    const callback = async (ev) => {
      const { command, props } = ev.data;
      if (command == "saveAnimations" && props.done) {
        setSaveLoad(false);
        setAnimationsChanged(false);
        await doInWordpressAsync(async () => {
          const projectData = await getProjectData();
          const css =
            projectData.current_inf_meta[
              projectData.currentEditingPage.save_state
            ].css;
          reorderCss(editor, css);
        });

        await doInNormalAsync(async () => {
          const pageName = localStorage.getItem(current_page_id);
          const cssFile = (
            await opfs.getFile(defineRoot(`css/${pageName}.css`))
          ).getOriginFile();
          reorderCss(editor, await cssFile.text());
        });
        emitChange();
      }
    };

    setAnimationsChanged(animations.some((kf) => kf.changed));

    keyframesGetterWorker.addEventListener("message", callback);
    return () => {
      keyframesGetterWorker.removeEventListener("message", callback);
    };
  }, [editor, animations]);

  useEffect(() => {
    if (!editor) return;

    const infCallback = (ev) => {
      const { cssProp, value } = ev.detail;
      setStyle({
        cssProp,
        value,
      });
      editor.refresh({ tools: true });
      editor.Canvas.refresh({ all: true, spots: true });
    };
    styleInfInstance.on(InfinitelyEvents.style.set, infCallback);

    const loadMonaco = () => {
      monacoLoader.init().then((monaco) => {
        !window.monaco && (window.monaco = monaco);
        monaco.editor.onDidCreateEditor(() => {
          monaco.worker?.keepAlive?.();
        });
      });
    };

    const loaderStartCallback = () => {
      document.body.classList.add("disable-when-load");
      setShowLoader(true);
    };

    const loaderEndCallback = () => {
      setShowLoader(false);
      setTimeout(() => {
        document.body.classList.remove("disable-when-load");
      }, 200);
    };

    const loaderStartCallbackStorage = () => {};

    const loaderEndCallbackStorage = () => {
      reloadPreview();
    };

    editorStorageInstance.on(
      InfinitelyEvents.storage.loadStart,
      loaderStartCallback,
    );
    editorStorageInstance.on(
      InfinitelyEvents.storage.loadEnd,
      loaderEndCallback,
    );

    const selectComponentWhenDeviceChange = () => {
      const sle = editor.getSelected();
      if (!sle) return;
      // alert("sle");
      // editor.Canvas.scrollTo(sle, { behavior: "smooth",  });

      const canvasFrameEl = editor.Canvas.getFrameEl();
      const callback = () => {
        // alert ('test');
        sle.getEl().scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "center",
        });
        canvasFrameEl.removeEventListener("transitionend", callback);
      };

      canvasFrameEl.addEventListener("transitionend", callback);
    };

    editor.on("canvas:frame:load:body", loadMonaco);
    editor.on(InfinitelyEvents.storage.loadStart, loaderStartCallback);
    editor.on(InfinitelyEvents.storage.loadEnd, loaderEndCallback);
    editor.on(InfinitelyEvents.storage.storeStart, loaderStartCallbackStorage);
    editor.on(InfinitelyEvents.storage.storeEnd, loaderEndCallbackStorage);
    editor.on("change:device", selectComponentWhenDeviceChange);

    return () => {
      styleInfInstance.off(InfinitelyEvents.style.set, infCallback);
      editor.off("canvas:frame:load:body", loadMonaco);
      editorStorageInstance.off(
        InfinitelyEvents.storage.loadStart,
        loaderStartCallback,
      );
      editorStorageInstance.off(
        InfinitelyEvents.storage.loadEnd,
        loaderEndCallback,
      );
      editor.off(InfinitelyEvents.storage.loadStart, loaderStartCallback);
      editor.off(InfinitelyEvents.storage.loadEnd, loaderEndCallback);
      editor.off(
        InfinitelyEvents.storage.storeStart,
        loaderStartCallbackStorage,
      );
      editor.off(InfinitelyEvents.storage.storeEnd, loaderEndCallbackStorage);
      editor.off("change:device", selectComponentWhenDeviceChange);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.Canvas.refresh();
    editor.Canvas.refreshSpots({ all: true, spots: true });
    editor.refresh({ tools: true });
  }, [editor, showPreview]);

  useEffect(() => {
    if (!editor) return;

    editor.Canvas.refresh();
  }, [showAnimBuilder, showLayers, showsComponents, editor]);

  useEffect(() => {
    if (!showPreview) {
      setPreviewSrc("");
      return;
    }

    setUrlPage();
  }, [showPreview]);

  useEffect(() => {
    if (!previewRef.current) return;
    animatePreviewContainer(previewRef.current);
  }, [previewRef]);

  useEffect(() => {
    if (!previewIframe.current || !previewRef.current) return;
    const wrapperWidth = previewRef.current.offsetWidth;
    previewIframe.current.style.height = previewIframeClient.height
      ? `${previewIframeClient.height}px`
      : "100%";

    let zoomValue;

    if (previewIframeClient.width > wrapperWidth) {
      const zoom = wrapperWidth / previewIframeClient.width;
      previewIframe.current.style.zoom = zoom;
      zoomValue = zoom * 100;
      previewIframe.current.style.width = `100%`;
    } else {
      previewIframe.current.style.zoom = `100%`;
      zoomValue = 100;
      previewIframe.current.style.width = previewIframeClient.width
        ? `${previewIframeClient.width}px`
        : `100%`;
    }

    setPreviewIframeClient({
      ...previewIframeClient,
      zoom: parseFloat(zoomValue.toFixed(2)),
    });
  }, [
    previewRef,
    previewIframe,
    previewIframeClient.width,
    previewIframeClient.height,
  ]);

  const getReloadUrl = (url) => {
    if (!url) return url;
    return `${url}${url.includes("?") ? "&" : "?"}reload=${Date.now()}`;
  };

  // ✅ FIXED: Extract the window object when the preview iframe loads
  const onPreviewLoad = () => {
    setShowPreviewLoader(false);
    if (previewIframe.current && previewIframe.current.contentWindow) {
      setPreviewWindow(previewIframe.current.contentWindow);
    }
  };

  const setUrlPage = (forceReload = false) => {
    setShowPreviewLoader(true);

    doInNormal(() => {
      const url = getCurrentPageName();
      setPreviewSrc(forceReload ? getReloadUrl(url) : url);
    });

    doInWordpressAsync(async () => {
      const wp_post = getWpPageConfig();
      const projectData = await getProjectData();
      const url = `${wp_post.link}?&save_state=${projectData.currentEditingPage.save_state}&mode=preview`;
      setPreviewSrc(forceReload ? getReloadUrl(url) : url);
    });
  };

  const reloadPreview = () => {
    setShowPreviewLoader(true);
    setUrlPage(true);
  };

  useShortcuts();
  useSetWpTokensQueryVars();
  useUpdateWpEditorScriptsInBackground();

  return (
    <section className="relative bg-[#aaa] h-full animate-go-to auto-animate">
      {showsComponents.animationsBuilder && (
        <section className="grid place-items-center p-2 absolute top-0 left-0 z-[120] bg-blue-900/40  isolate w-full h-full">
          <section className="flex flex-col items-center justify-center self-center p-3 bg-surface-secondary shadow-2xl shadow-slate-950 rounded-lg gap-5">
            <figure className="relative w-fit">
              {Icons.animation(undefined, undefined, "#2563eb", 60, 60)}
            </figure>
            <h1 className="font-bold text-center text-white text-2xl">
              <span className="text-blue-600 font-bold text-2xl"> </span>
              You Are In Animations Builder Mode
              <span className="text-blue-600 font-bold text-2xl"> </span>
            </h1>

            <section className="flex gap-2">
              <Button
                className="bg-[crimson!important] font-semibold"
                onClick={(ev) => {
                  if (isAnimationsChanged) {
                    const cnfrm = confirm(animationsSavingMsg);
                    if (cnfrm) {
                      setAnimationsChanged(false);
                      setAnimations([]);
                      setShowsComponents((prev) => {
                        return {
                          ...prev,
                          animationsBuilder: false,
                        };
                      });
                    }
                  } else {
                    setShowsComponents((prev) => {
                      return {
                        ...prev,
                        animationsBuilder: false,
                      };
                    });
                  }
                }}
              >
                Close
              </Button>

              <Button
                disabled={!isAnimationsChanged || saveLoad}
                onClick={(ev) => {
                  if (!isAnimationsChanged) {
                    toast.info(
                      <ToastMsgInfo msg={`You did not do any change!`} />,
                    );
                  }
                  saveAnimations();
                }}
              >
                Save
              </Button>
            </section>
          </section>
        </section>
      )}

      <section
        id="editor-wrapper"
        ref={editorWrapper}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        className="bg-surface-main animate-go-to"
      >
        <Canvas
          id="editor-canvas"
          label="Canvas"
          aria-label="Editor"
          className="overflow-auto w-full h-full animate-go-to "
          style={{
            display: !showPreview || showLoader ? "block" : "none",
            // opacity: !showPreview || showLoader ? "1" : "0",
            isolation: "isolate",
            willChange: "transform, opacity, height, width",
          }}
        />

        <ShowIf condition={showPreview}>
          <main
            id="preview-container"
            className={`relative h-full w-full bg-surface-main animate-go-to`}
            ref={iframeContainer}
          >
            <section ref={previewRef} className="h-full w-full flex flex-col">
              <header className="w-full p-2 bg-surface-tertiary flex gap-2 border-b border-b-slate-600">
                <section className="w-full flex gap-2">
                  <Input
                    type="number"
                    placeholder="Width"
                    value={previewIframeClient.width || ""}
                    onInput={(e) => {
                      setPreviewIframeClient({
                        ...previewIframeClient,
                        width: e.target.value,
                      });
                    }}
                  />

                  <Input
                    type="number"
                    placeholder="Height"
                    value={previewIframeClient.height || ""}
                    onInput={(e) => {
                      setPreviewIframeClient({
                        ...previewIframeClient,
                        height: e.target.value,
                      });
                    }}
                  />

                  <Input
                    type="number"
                    placeholder="Zoom"
                    value={previewIframeClient?.zoom}
                    onInput={(e) => {
                      if (e.target.value < 0) {
                        setPreviewIframeClient({
                          ...previewIframeClient,
                          zoom: 0,
                        });
                        return;
                      }

                      setPreviewIframeClient({
                        ...previewIframeClient,
                        zoom: e.target.value,
                      });
                    }}
                  />

                  <h1 className="text-slate-200 font-medium p-2 rounded-lg bg-surface-secondary text-nowrap overflow-hidden text-ellipsis">
                    {previewSrc}
                  </h1>
                </section>
                <section className="w-full flex gap-2 items-center justify-end">
                  <button onClick={reloadPreview}>
                    {Icons.refresh({ width: 20, height: 20 })}
                  </button>
                </section>
              </header>

              {showPreviewLoader && (
                <section className=" w-full h-full z-[1] bg-surface-secondary flex justify-center items-center animate-go-to">
                  <Loader zIndex={1} />
                </section>
              )}

              <iframe
                className={`w-full h-full self-center transition-all`}
                ref={previewIframe}
                id="preview"
                src={previewSrc}
                allowFullScreen
                onLoad={onPreviewLoad}
                security="restricted"
                about="target"
                unselectable="on"
                style={{
                  zoom:
                    previewIframeClient.zoom && `${previewIframeClient.zoom}%`,
                  opacity: showPreviewLoader ? 0 : 1,
                  display: showPreviewLoader ? "none" : "block",
                }}
              ></iframe>
            </section>
          </main>
        </ShowIf>
      </section>

      {showLoader && (
        <section className="absolute top-0 left-0 w-full h-full z-[1] bg-surface-secondary flex justify-center items-center animate-go-to">
          <Loader zIndex={1} />
        </section>
      )}
    </section>
  );
};
