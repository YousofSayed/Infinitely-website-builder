import { Canvas, useEditorMaybe } from "@grapesjs/react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  animationsState,
  animationsWillRemoveState,
  isAnimationsChangedState,
  projectData,
  showAnimationsBuilderState,
  showDragLayerState,
  showLayersState,
  showPreviewState,
} from "../../helpers/atoms";
import { Button } from "../Protos/Button";
import { Icons } from "../Icons/Icons";
import { addClickClass, html, uniqueID } from "../../helpers/cocktail";
import { iframeType, refType } from "../../helpers/jsDocs";
import {
  allowWorkerToBuildPagesForPreview,
  buildGsapMotionsScript,
  getCurrentPageName,
  getProjectData,
  getScripts,
  getStyles,
  parseInfinitelyURLForWindow,
} from "../../helpers/functions";
import {
  current_page_id,
  current_project_id,
  mainScripts,
  preivewScripts,
} from "../../constants/shared";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import monacoLoader from "@monaco-editor/loader";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { initDBAssetsSw } from "../../serviceWorkers/initDBAssets-sw";
import { flatMap, random } from "lodash";
import { isChrome } from "../../helpers/bridge";
import serializeJavascript from "serialize-javascript";
import { createRoot } from "react-dom/client";
import { useSetClassForCurrentEl } from "../../hooks/useSetclassForCurrentEl";
import { FitTitle } from "./Protos/FitTitle";
import { SmallButton } from "./Protos/SmallButton";
import { Infinitely } from "../../helpers/Infinitely";
import {
  keyframesGetterWorker,
  pageBuilderWorker,
} from "../../helpers/defineWorkers";
import { useLiveQuery } from "dexie-react-hooks";
import { liveQuery } from "dexie";
import { styleInfInstance } from "../../constants/InfinitelyInstances";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { animationsSavingMsg } from "../../constants/confirms";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const PreviewIframe = ({
  content = "",
  myRef,
  infinitelyInstance,
  navigateCallback = (page = "") => {},
}) => {
  const previewIframe = myRef || useRef(iframeType);

  return (
    <iframe
      ref={previewIframe}
      id="preview"
      allowFullScreen
      className={`bg-white w-full h-[calc(100%-60px)]  transition-all border-[5px] rounded-bl-lg rounded-br-lg border-slate-900`}
    ></iframe>
  );
};

export const Iframe = memo(() => {
  const showLayers = useRecoilValue(showLayersState);
  const [showAnimBuilder, setShowAnimBuilder] = useRecoilState(
    showAnimationsBuilderState
  );
  const [showPreview, setShowPreview] = useRecoilState(showPreviewState);
  const [showDragLayer, setShowDragLayer] = useRecoilState(showDragLayerState);
  const [animations, setAnimations] = useRecoilState(animationsState);
  const [animationsWillRemove, setAnimationsWillRemove] = useRecoilState(
    animationsWillRemoveState
  );
  const [saveLoad, setSaveLoad] = useState(false);
  const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
    isAnimationsChangedState
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
  const saveAnimations = () => {
    if (isAnimationsChanged) {
      setSaveLoad(true);
      setAnimationsChanged("pendding");

      if (animationsWillRemove.length) {
        keyframesGetterWorker.postMessage({
          command: "removeAnimation",
          props: {
            keyframes: animationsWillRemove,
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
    const callback = (ev) => {
      const { command, props } = ev.data;
      if (command == "saveAnimations" && props.done) {
        setSaveLoad(false);
        setAnimationsChanged(false);
        editor.load();
      }
    };

    keyframesGetterWorker.addEventListener("message", callback);
    return () => {
      keyframesGetterWorker.removeEventListener("message", callback);
    };
  }, [editor, animations]);

  useEffect(() => {
    if (!editor) return;
    console.log("auto save : ", editor.Storage.config.autosave);

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

    editor.on("canvas:frame:load:body", loadMonaco);
    const preventDefaultSave = (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
      }
    };
    // window.addEventListener("keydown", preventDefaultSave);
    /**
     *
     * @param {KeyboardEvent} ev
     */
    const saveCallback = (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        editor.store();
      }
    };

    window.addEventListener("keydown", saveCallback);

    return () => {
      styleInfInstance.off(InfinitelyEvents.style.set, infCallback);
      editor.off("canvas:frame:load:body", loadMonaco);
      // window.removeEventListener("keydown", preventDefaultSave);
      window.removeEventListener("keydown", saveCallback);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.Canvas.refresh();
  }, [showAnimBuilder, showLayers]);

  // const getPageName = ()=>{}

  const reloadPreview = () => {
    setPreviewSrc(new String(getCurrentPageName()));
    // getAndSetPreviewData(previewPageName, false, { firstPreview: false });
  };

  // useEffect(() => {
  //   if (!editor) return;

  //   pageBuilderWorker.postMessage({
  //     command: "sendPreviewPagesToServiceWorker",
  //     props: {
  //       projectId: +localStorage.getItem(current_project_id),
  //       editorData: {
  //         canvasCss: editor.config.canvasCss,
  //         editorCss: "",
  //       },
  //     },
  //   });
  //   console.log("i should send preview page");
  // },[]);

  useEffect(() => {
    if (!showPreview) {
      setPreviewSrc("");
      return;
    }
    const pageName = localStorage.getItem(current_page_id);
    const urlSrc =
      pageName.toLowerCase() == "index"
        ? "./index.html"
        : `../pages/${pageName}.html`;

    setPreviewSrc(urlSrc);
  }, [showPreview]);

  

  return (
    <section
      className="relative bg-[#aaa]    h-full"
      ref={autoAnimate}
    >
      {showAnimBuilder && (
        <section className="grid place-items-center p-2 absolute top-0 left-0 z-20 bg-blur-dark w-full h-full">
          <section className="flex flex-col items-center justify-center self-center p-3 bg-slate-900 shadow-2xl shadow-slate-950 rounded-lg gap-5">
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
                // disabled={
                //   isAnimationsChanged == "pendding" ||
                //   !Boolean(isAnimationsChanged)
                //     ? true
                //     : false
                // }
                // style={{
                //   backgroundColor:'red !important',
                //   opacity:
                //     // isAnimationsChanged == "pendding" ||
                //     !Boolean(isAnimationsChanged)
                //       ? ".7"
                //       : "1",
                //   cursor:
                //   'not-allowed'
                //     // isAnimationsChanged == "pendding" ||
                //     // Boolean(isAnimationsChanged)
                //     //   ? "pointer"
                //     //   : "not-allowed",
                // }}
                className={`font-semibold ${!Boolean(isAnimationsChanged)? `opacity-[.7] cursor-not-allowed ` :''}`}
                onClick={(ev) => {
                  console.log('isAnimationsChanged: ' , isAnimationsChanged);
                  
                  if (!isAnimationsChanged) {
                    toast.info(
                      <ToastMsgInfo msg={`You did not do any change!`} />
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

      <Canvas
        // key={uniqueID()}
        id="editor-container"
        label="Canvas"
        aria-label="Editor"
        className="overflow-auto "
        style={{
          display: showPreview ? "none" : "block",
          // scale:showPreview ? 0 : 1,
          overflow: "auto",
        }}
        // srcDoc="<video src='../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4'></video>"
      ></Canvas>

      {/* <FloatingButton/> */}

      {/* {showDragLayer && (
        <section className="absolute top-0 left-0 w-full h-full z-[900]  opacity-[0]"></section>
      )} */}

      {/* {showPreview && ( */}
      <section
        ref={virtualBrowserWindow}
        style={{ display: showPreview ? "block" : "none" }}
        className="w-full h-full rounded-xl overflow-hidden p-1 fixed left-0 top-0 z-[1000] backdrop-blur-md"
        // style={{ display: showPreview ? "block" : "none" }}
      >
        {showPreview && (
          <>
            <header className="w-full h-[60px] flex items-center justify-between p-2 rounded-tl-lg rounded-tr-lg  bg-slate-900">
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
                    {Icons.minimize({ strokeColor: "white", strokWidth: 2 })}
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

            <main className="h-[calc(100%-60px)] w-full" ref={iframeContainer}>
              {/* {isChrome() && ( */}
              {/* {showPreview && ( */}
              <iframe
                ref={previewIframe}
                id="preview"
                allowFullScreen
                src={previewSrc || urlSrc}
                security="restricted"
                about="target"
                allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                unselectable="on"
                // sandbox=""
                // sandbox="allow-same-origin allow-scripts allow-modals allow-forms allow-popups"
                // src="about:srcdoc"
                // srcDoc=""
                // srcDoc={`<video
                //    src="../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4"
                //    controls
                //  ></video>`}
                className={`bg-white w-full h-full  transition-all border-[5px] rounded-bl-lg rounded-br-lg border-slate-900`}
                // srcDoc={srcDoc}
              ></iframe>
              {/* )} */}

              {/* )} */}
            </main>
          </>
        )}
      </section>
      {/* )} */}
    </section>
  );
});
