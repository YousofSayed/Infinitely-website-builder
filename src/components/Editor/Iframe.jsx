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
  isAnimationsChangedState,
  reloaderState,
  showAnimationsBuilderState,
  showDragLayerState,
  showLayersState,
  showPreviewState,
} from "@/helpers/atoms";
import { defineRoot } from "@/helpers/bridge";
import { addClickClass } from "@/helpers/cocktail";
import { keyframesGetterWorker } from "@/helpers/defineWorkers";
import {
  doInNormal,
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

export const Iframe = () => {
  const showLayers = useRecoilValue(showLayersState);
  const [showAnimBuilder, setShowAnimBuilder] = useRecoilState(
    showAnimationsBuilderState,
  );
  const [isResize, setIsResize] = useState(false);
  const [reloader, setReloader] = useRecoilState(reloaderState);
  const [showPreview, setShowPreview] = useRecoilState(showPreviewState);
  const [showDragLayer, setShowDragLayer] = useRecoilState(showDragLayerState);
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
  const iframeContainer = useRef();
  const virtualBrowserWindow = useRef(iframeType);
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const setStyle = useSetClassForCurrentEl();
  const [autoAnimate] = useAutoAnimate();
  const [animatePreviewContainer] = useAutoAnimate();
  const [showLoader, setShowLoader] = useState(true);
  const [showPreviewLoader, setShowPreviewLoader] = useState(true);
  const editorWrapper = useRef(refType);
  const previewRef = useRef(refType);

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
        /**
         *
         * @param {MessageEvent} ev
         */
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
    /**
     *
     * @param {MessageEvent} ev
     */
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
    console.log(
      "changed :",
      animations.some((kf) => kf.changed),
      animations,
    );

    keyframesGetterWorker.addEventListener("message", callback);
    return () => {
      keyframesGetterWorker.removeEventListener("message", callback);
    };
  }, [editor, animations]);

  useEffect(() => {
    if (!editor) return;

    const infCallback = (ev) => {
      // console.log("fire from inf instance");

      const { cssProp, value } = ev.detail;
      // console.log("navigateCallback : ", cssProp, value);

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
      setShowLoader(true);
      console.log("should start");
    };

    const loaderEndCallback = () => {
      setShowLoader(false);
      console.log("should end");
    };

    editorStorageInstance.on(
      InfinitelyEvents.storage.loadStart,
      loaderStartCallback,
    );
    editorStorageInstance.on(
      InfinitelyEvents.storage.loadEnd,
      loaderEndCallback,
    );
    editor.on("canvas:frame:load:body", loadMonaco);
    editor.on(InfinitelyEvents.storage.loadEnd, loaderEndCallback);
    console.log("auto save : ", editor.Storage.config.autosave);

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
      editor.off(InfinitelyEvents.storage.loadEnd, loaderEndCallback);
      // editor.off('storage:end:load', loaderEndCallback);
      // window.removeEventListener("keydown", preventDefaultSave);
      // window.removeEventListener("keydown", saveCallback);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.Canvas.refresh();
  }, [showAnimBuilder, showLayers, editor]);

  useEffect(() => {
    if (!showPreview) {
      setPreviewSrc("");
      return;
    }

    setUrlPage();
  }, [showPreview]);

  useEffect(()=>{
    if(!previewRef.current)return;
    animatePreviewContainer(previewRef.current);
  },[previewRef])

  const getReloadUrl = (url) => {
    if (!url) return url;
    return `${url}${url.includes("?") ? "&" : "?"}reload=${Date.now()}`;
  };

  const onPreviewLoad = () => {
    setShowPreviewLoader(false);
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
    setUrlPage(true);
  };

  return (
    <section className="relative bg-[#aaa]    h-full" ref={autoAnimate}>
      {showAnimBuilder && (
        <section className="grid place-items-center p-2 absolute top-0 left-0 z-20 bg-blue-900/40 backdrop-blur-sm w-full h-full">
          <section className="flex flex-col items-center justify-center self-center p-3 bg-surface-secondary shadow-2xl shadow-slate-950 rounded-lg gap-5">
            <figure className="relative  w-fit ">
              {Icons.animation(undefined, undefined, "#2563eb", 60, 60)}
            </figure>
            <h1 className="font-bold text-center text-white text-2xl ">
              <span className="text-blue-600 font-bold text-2xl ">" </span>
              You Are In Animations Builder Mode
              <span className="text-blue-600 font-bold text-2xl"> "</span>
            </h1>

            <section className="flex gap-2">
              <Button
                className="bg-[crimson!important] font-semibold"
                onClick={(ev) => {
                  if (isAnimationsChanged) {
                    const cnfrm = confirm(animationsSavingMsg);
                    if (cnfrm) {
                      // setShowAnimBuilder(false);
                      setAnimationsChanged(false);
                      setAnimations([]);
                      setShowAnimBuilder(false);
                    }
                  } else {
                    setShowAnimBuilder(false);
                  }
                }}
              >
                Close
              </Button>

              <Button
                disabled={!isAnimationsChanged || saveLoad}
                // className={`font-semibold ${
                //   !Boolean(isAnimationsChanged)
                //     ? `opacity-[.7] cursor-not-allowed `
                //     : ""
                // }`}
                onClick={(ev) => {
                  console.log("isAnimationsChanged: ", isAnimationsChanged);

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
          overflow: "auto",
        }}
      >
        <Canvas
          id="editor-canvas"
          label="Canvas"
          aria-label="Editor"
          className="overflow-auto "
        />
      </section>

      {showLoader && (
        <section className="absolute top-0 left-0 w-full h-full z-[1] bg-surface-secondary flex justify-center items-center">
          <Loader zIndex={1} />
        </section>
      )}

      <section
        ref={virtualBrowserWindow}
        style={{
          display: showPreview ? "block" : "none",
          // contain: "layout , size , paint",
        }}
        className="w-full h-full rounded-xl overflow-hidden p-1 fixed left-0 top-0 z-[1000] "
        // style={{ display: showPreview ? "block" : "none" }}
      >
        {showPreview && (
          <>
            <Portal>
              <main
                id="preview-container"
                className="fixed  left-0 top-0 h-full w-full z-[1000]"
                ref={iframeContainer}
              >
                {/* resizing elements */}
                <div className="absolute top-0 left-[calc(50%-40px)] w-[80px] h-[5px] bg-brand-primary"></div>
                {/* <div></div>
                <div></div> */}
                {/* resizing elements */}
                {/* {showPreview && ( */}
                <header className="w-full h-[60px] flex items-center justify-between p-2 rounded-tl-lg rounded-tr-lg  bg-surface-secondary">
                  <section className="flex items-center  gap-5 w-[50%]">
                    <FitTitle className=" w-[30%!important] h-full rounded-lg font-semibold capitalize text-xl text-center">
                      {localStorage.getItem(current_page_id)}
                    </FitTitle>

                    <button
                      onClick={(ev) => {
                        addClickClass(ev.currentTarget, "click");
                        reloadPreview();
                      }}
                    >
                      {Icons.refresh({ width: 20, height: 20 })}
                    </button>
                  </section>
                  <ul className="flex items-center gap-3 flex-wrap">
                    <li className="group w-[20px] h-[20px] bg-green-600 rounded-full overflow-hidden flex justify-center items-center cursor-pointer">
                      <button
                        className="opacity-0 group-hover:opacity-[1] text-white font-bold  scale-[.8]  transition-all  w-full h-full flex justify-center items-center"
                        onClick={(ev) => {
                          addClickClass(ev.currentTarget, "click");
                          document.exitFullscreen();
                        }}
                      >
                        {Icons.minimize({
                          strokeColor: "white",
                          strokWidth: 2,
                        })}
                      </button>
                    </li>
                    <li className="group w-[20px] h-[20px] bg-yellow-600 rounded-full flex justify-center items-center cursor-pointer">
                      <button
                        className="opacity-0 group-hover:opacity-[1] scale-[.7] transition-all text-sm w-full h-full flex justify-center items-center"
                        onClick={(ev) => {
                          addClickClass(ev.currentTarget, "click");
                          virtualBrowserWindow.current.requestFullscreen();
                        }}
                      >
                        {Icons.square("white")}
                      </button>
                    </li>
                    <li
                      className="group w-[20px] h-[20px] bg-red-600 rounded-full flex justify-center items-center cursor-pointer"
                      onClick={(ev) => {
                        addClickClass(ev.currentTarget, "click");
                        setShowPreview(!showPreview);
                        setTimeout(() => {
                          editor.trigger(InfinitelyEvents.pages.all);
                        }, 0);
                        // window.dispatchEvent(
                        //   changePageName({
                        //     pageName: localStorage.getItem(current_page_id),
                        //   })
                        // );
                        // editor.load();
                      }}
                    >
                      <button className="opacity-0 group-hover:opacity-[1] transition-all text-sm w-full h-full flex justify-center items-center">
                        {Icons.close("white")}
                      </button>
                    </li>
                  </ul>
                </header>

                <section
                  className="h-[calc(100%-60px)] w-full resize rounded-lg bg-white p-2 border-2 border-blue-700"
                  style={{
                    contain: "layout paint",
                    transform: "translateZ(0)",
                  }}
                >
                  <section ref={previewRef} className="h-full w-full">
                    {showPreviewLoader && (
                      <section className="absolute top-0 left-0 w-full h-full z-[1] bg-surface-secondary flex justify-center items-center">
                        <Loader zIndex={1} />
                      </section>
                    )}
                    <iframe
                      ref={previewIframe}
                      id="preview"
                      allowFullScreen
                      src={previewSrc || urlSrc}
                      onLoad={onPreviewLoad}
                      security="restricted"
                      about="target"
                      allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                      unselectable="on"
                      style={{
                        willChange: "transform",
                        contain: `strict`,
                        transform: `translateZ(0)`,
                      }}
                      className={`bg-white w-full h-full   transition-all border-[5px] rounded-bl-lg rounded-br-lg border-slate-900`}
                    ></iframe>
                  </section>
                </section>
                {/* )} */}

                {/* )} */}
              </main>
            </Portal>
          </>
        )}
      </section>
      {/* )} */}
    </section>
  );
};
