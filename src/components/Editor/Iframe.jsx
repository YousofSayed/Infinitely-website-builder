import { Canvas, useEditorMaybe } from "@grapesjs/react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
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
import { pageBuilderWorker } from "../../helpers/defineWorkers";
import { useLiveQuery } from "dexie-react-hooks";
import { liveQuery } from "dexie";
import { styleInfInstance } from "../../constants/InfinitelyInstances";

const PreviewIframe = ({
  content = "",
  myRef,
  infinitelyInstance,
  navigateCallback = (page = "") => {},
}) => {
  const previewIframe = myRef || useRef(iframeType);
  // useEffect(() => {
  //   if (!previewIframe.current) return;
  //   previewIframe.current.contentWindow.document.open();
  //   previewIframe.current.contentWindow.document.write(content);
  //   previewIframe.current.contentWindow.document.close();
  //   const frameWindow = previewIframe.current.contentWindow;

  //   /**
  //    *
  //    * @param {MouseEvent} ev
  //    */
  //   const callback = async (ev) => {
  //     console.log("click callback is fire from out");

  //     const el = ev.currentTarget;
  //     if (el && "href" in el) {
  //       /**
  //        * @type {string}
  //        */
  //       const href = el.href;
  //       const splittedHref = href?.split?.("/");

  //       console.log(
  //         "click callback is fire from middle 2: ",
  //         href,
  //         window.origin,
  //         href == `${window.origin}/index.html`
  //       );
  //       if (
  //         href &&
  //         (splittedHref?.lastIndexOf?.("pages") != -1 ||
  //           href == `${window.origin}/index.html`)
  //       ) {
  //         console.log("click callback is fire from in");
  //         ev.preventDefault();

  //         // const projectData = await getProjectData();
  //         // const pages = projectData.pages;
  //         // const
  //         const pageName = splittedHref
  //           .pop()
  //           .toLowerCase()
  //           .replace(".html", "");
  //         console.log("page name : ", pageName);
  //         infinitelyInstance.current.emit(InfinitelyEvents.preview.navigate, {
  //           pageName,
  //           href,
  //         });
  //         // frameWindow.history.pushState({}, "", href);
  //         // navigateCallback(pageName, true, { firstPreview: false });
  //       }
  //     }
  //   };

  //   const aTagEventHandler = ({
  //     el = refType,
  //     addEvent = false,
  //     removeEvent = false,
  //   }) => {
  //     // console.log("el , ", el);
  //     if (!el) return;
  //     if (el && (el.tagName.toLowerCase() != "a" || !("href" in el))) return;
  //     console.log(
  //       `aTagEventHandler callback is fire`,
  //       el.tagName.toLowerCase()
  //     );
  //     if (el.hasAttribute("observed")) return;
  //     addEvent &&
  //       el.addEventListener("click", callback) &&
  //       el.setAttribute("observed", "true");
  //     removeEvent && el.removeEventListener("click", callback);

  //     el.children.length &&
  //       [...el.children].forEach((child) => {
  //         aTagEventHandler(child);
  //       });
  //   };

  //   previewIframe.current.contentDocument.body
  //     .querySelectorAll("*")
  //     .forEach((el) => {
  //       aTagEventHandler({
  //         el,
  //         addEvent: true,
  //       });
  //     });

  //   const aTageObserver = new MutationObserver((entries) => {
  //     entries.forEach((entry) => {
  //       aTagEventHandler({ el: entry.target, addEvent: true });
  //       entry.removedNodes.forEach((node) => {
  //         aTagEventHandler({ el: node, removeEvent: true });
  //       });
  //     });
  //   });

  //   aTageObserver.observe(previewIframe.current.contentDocument.body, {
  //     subtree: true,
  //     childList: true,
  //   });

  //   return () => {
  //     aTageObserver.disconnect();
  //     // frameWindow.removeEventListener('popstate',popsStateCallback)
  //   };
  // }, [previewIframe]);

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
  const [previewPageName, setPreviewPageName] = useState();
  const pageName = localStorage.getItem(current_page_id);

  const urlSrc =
    pageName.toLowerCase() == "index"
      ? "./index.html"
      : `../pages/${pageName}.html`;
  const [previewSrc, setPreviewSrc] = useState(urlSrc);
  const [historyStack, setHistoryStack] = useState([]);
  const [currentPageIndexInStack, setCurrentPageIndexInStack] = useState(0);
  const previewIframe = useRef(iframeType);
  const iframeContainer = useRef();
  const virtualBrowserWindow = useRef(iframeType);
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const iframeRoot = useRef(null);
  const setStyle = useSetClassForCurrentEl();
  const [currentIndexStates, setCurrentIndexStates] = useState({
    isStart: false,
    isBetween: false,
    isEnd: false,
  });

  // useLiveQuery(() => {
  //   console.log('from live query');
  //   if(!editor) return;

  //   allowWorkerToBuildPagesForPreview({
  //     canvasCss: editor.config.canvasCss,
  //     pageUrl: `${getCurrentPageName()}`,
  //     allowToUpdate: true,
  //   });
  // },[editor]);

  useEffect(() => {
    if(!editor)return;
    const infCallback = (ev) => {
      // console.log("fire from inf instance");

      const { cssProp, value } = ev.detail;
      // console.log("navigateCallback : ", cssProp, value);

      setStyle({
        cssProp,
        value,
      });
      editor.refresh({tools:true});
      editor.Canvas.refresh({all:true, spots:true})
    };
    styleInfInstance.on(InfinitelyEvents.style.set, infCallback);

    return () => {
      styleInfInstance.off(InfinitelyEvents.style.set, infCallback);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.Canvas.refresh();
  }, [showAnimBuilder, showLayers]);

  useEffect(() => {
    if (!editor) return;
    const loadMonaco = () => {
      monacoLoader.init().then((monaco) => {
        window.monaco = monaco;
        monaco.editor.onDidCreateEditor(() => {
          monaco.worker?.keepAlive?.();
        });
      });
    };

    /**
     *
     * @param {MessageEvent} ev
     */
    // const handleAssetsFromWorker = (ev) => {
    //   const { props, command } = ev.data;
    //   if (command == "getDataFromDB" && props.key == "assets") {
    //     window.parseInfinitelyURLForWindow = parseInfinitelyURLForWindow;
    //     window.infinitelyAssets = props.data;
    //     console.log(
    //       "good assets is here : ",
    //       window.infinitelyAssets,
    //       window.parseInfinitelyURLForWindow
    //     );
    //   } else {
    //     console.warn("Some thing wrong!!!");
    //   }
    // };

    // infinitelyWorker.postMessage({
    //   command: "getDataFromDB",
    //   props: {
    //     projectId,
    //     key: "assets",
    //   },
    // });

    // infinitelyWorker.addEventListener("message", handleAssetsFromWorker);

    editor.on("canvas:frame:load:body", loadMonaco);
    return () => {
      editor.off("canvas:frame:load:body", loadMonaco);
      // infinitelyWorker.removeEventListener("message", handleAssetsFromWorker);
    };
  }, [editor]);

  // useEffect(() => {
  //   // setData({ data: previewContent });
  //   if (!editor || !previewIframe) return;

  //   const children = [
  //     ...new DOMParser().parseFromString(previewContent.html, "text/html").body
  //       .children,
  //   ];
  //   const prevBody = previewIframe.current.contentDocument.body;
  //   prevBody && (prevBody.innerHTML = "");

  //   appendWithDelay({
  //     where: prevBody,
  //     els: children,
  //     delay: 20,
  //     starterIndex: 0,
  //   });

  //   // setBody(editor.getHtml())
  // });

  // useEffect(() => {
  //   if (!editor) return;
  //   const getHeadCallback = () => {
  //     getHead({
  //       data: {
  //         scripts: editor.Canvas.config.scripts,
  //         styles: editor.Canvas.config.styles,
  //         css: editor.getCss(),
  //       },
  //     });
  //   };
  //   console.log("run");

  //   editor.on("canvas:frame:load:head", getHeadCallback);

  //   return () => {
  //     editor.off("canvas:frame:load:head", getHeadCallback);
  //   };
  // });

  const getHead = ({ data }) => {
    // console.log(
    //   "head css : ",
    //   editor.getCss({ clearStyles: false, keepUnusedStyles: true })
    // );

    /**
     * @type {import('../helpers/types').PreviewData}
     */
    const msg = data;
    const scripts = [];
    const links = [];

    msg.scripts.forEach((scriptData) => {
      const script = document.createElement("script");

      if (typeof scriptData != "object") {
        script.src = scriptData;
        scripts.push(script);
        return;
      }
      Object.keys(scriptData).forEach((key) => {
        script[key] = scriptData[key];
      });

      scripts.push(script);
    });

    msg.styles.forEach((styleData) => {
      const style = document.createElement("link");
      style.href = styleData.href;
      style.rel = "stylesheet";

      Object.keys(styleData).forEach((key) => {
        style[key] = styleData[key];
      });
      links.push(style);
    });

    const finalContent = [...scripts, ...links].map((item) => item.outerHTML);

    finalContent.push(
      html` <style id="global-rules">
        ${editor.config.canvasCss}
        ${editor.getCss({ clearStyles: false, keepUnusedStyles: true })}
      </style>`
    );
    // ${Object.keys(dynamicTemplates)?.map(dmT => dynamicTemplates[dmT]?.allRules).join('\\n')}

    return finalContent.join("");
  };

  const getPageData = async (page = "", { firstPreview = false }) => {
    console.log(`from getPageData callback : `, page);

    const projectData = await getProjectData();
    const currentPageId = firstPreview
      ? localStorage.getItem(current_page_id)
      : page || previewPageName;
    const currentPage = projectData.pages[`${currentPageId}`];

    const data = {
      helmet: "",
      headerScripts: "",
      footerScripts: "",
      cssLibs: "",
      mainScripts: "",
      localScript: "",
      globalScript: "",
      content: "",
      pageStyle: "",
      // editorStyles: "",
      bodyAttributes:
        projectData.pages[`${currentPageId}`].bodyAttributes || {},
      motions:
        `<script>${buildGsapMotionsScript(projectData.motions)}</script>` || "",
    };
    // console.log("motions : ", buildGsapMotionsScript(projectData.motions));

    const helmet = currentPage.helmet;

    const headerScrtips = getScripts(projectData.jsHeaderLibs);

    const footerScritps = getScripts(projectData.jsFooterLibs);

    const cssLibs = getStyles(projectData.cssLibs);
    // const mainScripts = [
    //   "/scripts/hyperscript@0.9.13.js",
    //   "/scripts/proccesNodeInHS.js",
    //   "/scripts/test.js",
    //   // 'https://cdn.tailwindcss.com',
    //   // 'https://cdnjs.cloudflare.com/ajax/libs/hyperscript/0.9.11/_hyperscript.min.js'
    // ];
    const viewMainScripts = preivewScripts
      .map((src) => html` <script src="${src}"></script> `)
      .join("\n");

    const globalScrtip = html`
      <script>
        ${await projectData.globalJs.text()};
      </script>
    `;

    const localScript = html`
      <script>
        ${await currentPage.js.text()};
      </script>
    `;

    data.helmet += html`
      <meta name="author" content="${helmet.author || ""}" />
      <meta name="description" content="${helmet.description || ""}" />
      <meta name="keywords" content="${helmet.keywords || ""}" />
      <title>${helmet.title || ""}</title>
      <link
        rel="icon"
        href="${projectData.logo ? URL.createObjectURL(projectData.logo) : ""}"
      />
      ${(await helmet?.customMetaTags?.text?.()) || ""}
    `;

    data.headerScripts = (await headerScrtips) || "";
    data.footerScripts = (await footerScritps) || "";
    data.cssLibs = (await cssLibs) || "";
    data.mainScripts = viewMainScripts || "";
    data.content = (await currentPage.html.text()) || "";
    data.pageStyle = (await currentPage.css.text()) || "";
    data.globalScript = globalScrtip || "";
    data.localScript = localScript || "";
    return data;
  };

  const handleSetHistoryStack = (
    page = "",
    addPageToStack = true,
    { firstPreview = false, newHistory = [] }
  ) => {
    const pageWillPreview = firstPreview
      ? localStorage.getItem(current_page_id)
      : page || previewPageName;

    console.log("history", historyStack);
    const newStack = [
      ...historyStack.slice(
        0,
        currentPageIndexInStack == 0
          ? historyStack.length
          : currentPageIndexInStack + 1
      ),
      pageWillPreview,
    ];
    console.log(
      `sliced stack : `,
      historyStack.slice(
        0,
        currentPageIndexInStack == 0
          ? historyStack.length
          : currentPageIndexInStack + 1
      )
    );

    console.log("old History : ", historyStack);
    // window.addEventListener('popstate')
    // firstPreview && setHistoryStack([ localStorage.getItem(current_page_id)])
    if (addPageToStack) {
      console.log("new stack : ", newStack);

      setHistoryStack([...newStack]);
      // !currentPageIndexInStack &&
      setCurrentPageIndexInStack(newStack.length - 1);
    }
    setPreviewPageName(page);
  };

  const getAndSetPreviewData = async (
    page = "",
    addPageToStack = true,
    { firstPreview = false, newHistory = [] }
  ) => {
    if (!editor) return;

    const pageData = await getPageData(page, { firstPreview });
    const content = html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          ${getHead({
            data: {
              scripts: editor.Canvas.config.scripts,
              styles: editor.Canvas.config.styles,
            },
          })}
          <style name="editor-style">
            ${editor.config.canvasCss}
          </style>
          <style id="page-style">
            ${pageData.pageStyle}
          </style>
          ${pageData.helmet} ${pageData.cssLibs} ${pageData.headerScripts}
        </head>

        <body
          style="height:100%;"
          ${Object.keys(pageData.bodyAttributes || {})
            .filter((key) => Boolean(pageData.bodyAttributes[key]))
            .map((key) => `${key}="${pageData.bodyAttributes[key]}"`)
            .join(" ")}
        >
          ${pageData.content} ${pageData.footerScripts} ${pageData.mainScripts}
          ${pageData.motions} ${pageData.globalScript} ${pageData.localScript}
        </body>
      </html>
    `;
    // const slicedStack = (currentPageIndexInStack == 0 ?  historyStack : historyStack.slice(0, currentPageIndexInStack + 1))
    // console.log("sliced stack : ", historyStack, slicedStack , currentPageIndexInStack , page, currentPageIndexInStack == 0);
    // handleSetHistoryStack(page, addPageToStack, { firstPreview });

    // console.log(pageData.motions);

    initDBAssetsSw(() => {}).then((sw) => {
      if (!sw) return;
      // previewIframe.current.src = htmlToDataUrl(content);
    });

    const chrome = isChrome(() => {
      !previewIframe.current.src &&
        (previewIframe.current.src = "about:srcdoc");
      if (previewIframe.current.src) {
        previewIframe.current.srcdoc = content;
      }
    });

    if (!chrome) {
      !iframeRoot.current &&
        (iframeRoot.current = createRoot(iframeContainer.current));
      iframeRoot.current.render(
        <PreviewIframe
          key={random() + uniqueID()}
          myRef={previewIframe}
          content={content}
          infinitelyInstance={infinitelyInstance}
          navigateCallback={(page) => {
            console.log(page);

            // getAndSetPreviewData(page, true, {
            //   firstPreview: false,
            //   newHistory: historyStack,
            // });
          }}
        />
      );
    }
    // previewIframe.current.srcdoc = content;
    // previewIframe.current.contentDocument.close();
  };

  const reloadPreview = () => {
    setPreviewSrc(previewIframe.current.contentDocument.baseURI);
    // getAndSetPreviewData(previewPageName, false, { firstPreview: false });
  };

  const getPreviewPageName = (pageName = "") =>
    pageName.split("/").pop().replace(".html", "");

  useEffect(() => {
    if (!editor) return;

    pageBuilderWorker.postMessage({
      command: "sendPreviewPagesToServiceWorker",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        editorData: {
          canvasCss: editor.config.canvasCss,
          editorCss: "",
        },
      },
    });
    console.log("i should send preview page");
  });

  useEffect(() => {
    if (!showPreview) {
      setHistoryStack([]);
      setPreviewPageName("");
      setCurrentPageIndexInStack(0);
      setPreviewSrc("");
      return;
    }
    const pageName = localStorage.getItem(current_page_id);
    const urlSrc =
      pageName.toLowerCase() == "index"
        ? "./index.html"
        : `../pages/${pageName}.html`;
    // setPreviewPageName(pageName);
    // console.log("url :", urlSrc);

    setPreviewSrc(urlSrc);
    // setHistoryStack([...historyStack, urlSrc]);
  }, [showPreview]);

  useEffect(() => {
    if (!previewIframe.current) return;
    const iframe = previewIframe.current;
    // iframe.contentWindow.location.replace(currentUrl);

    const callback = (ev) => {
      console.log(
        "click event fired",
        ev.target,
        ev.target.contentDocument.baseURI,
        ev.target.origin
      );
      const currentUrl = ev.target.contentDocument.baseURI;
      // const newStack = [
      //   ...historyStack.slice(
      //     0,
      //     currentPageIndexInStack == 0
      //       ? historyStack.length
      //       : currentPageIndexInStack + 1
      //   ),
      //   currentUrl,
      // ];
      // console.log("new stack", newStack, historyStack);

      // setHistoryStack(newStack);
      setPreviewPageName(getPreviewPageName(currentUrl));
      // !currentIndexStates.isEnd &&
      // !currentIndexStates.isStart &&
      // currentIndexStates.isBetween &&
      // setCurrentPageIndexInStack(newStack.length - 1);

      // currentPageIndexInStack != 0 &&
      //   currentPageIndexInStack != historyStack.length &&
      // (!currentPageIndexInStack ||
      // currentPageIndexInStack == historyStack.length-1) &&
      // setCurrentPageIndexInStack(newStack.length - 1);
      // const hisState = iframe.contentWindow.history.state;
      // !hisState &&
      // iframe.contentWindow.history.pushState(
      //   { pageName: currentUrl },
      //   "",
      //   currentUrl
      // );
    };

    iframe.addEventListener("load", callback);
    /**
     *
     * @param {PopStateEvent} ev
     */
    const popCb = (ev) => {
      ev.preventDefault();
      // ev.stopPropagation();
      console.log(`from main pop state callback : `, ev);
      return;
    };
    window.addEventListener("popstate", popCb);

    // frameWindow.addEventListener("DOMContentLoaded", callback);
    return () => {
      // previewIframe.current.contentDocument.baseURI;
      iframe.removeEventListener("load", callback);
      window.removeEventListener("popstate", popCb);
      // frameWindow.removeEventListener("click", callback);
    };
  }, [
    previewIframe,
    previewIframe?.current,
    historyStack,
    currentPageIndexInStack,
  ]);

  // useEffect(() => {
  //   if (!previewIframe || !previewIframe.current) return;
  //   const frameWindow = previewIframe.current.contentWindow;

  // }, [previewIframe]);

  // useEffect(() => {
  //   if (!editor || !showPreview) return;
  //   setPreviewPageName(localStorage.getItem(current_page_id));
  //   setHistoryStack([localStorage.getItem(current_page_id)]);
  //   setCurrentPageIndexInStack(0);
  //   getAndSetPreviewData("", false, { firstPreview: true });
  //   console.log(
  //     (currentPageIndexInStack === historyStack.length - 1) >= 0,
  //     historyStack,
  //     currentPageIndexInStack,

  //     Boolean(
  //       (currentPageIndexInStack === historyStack.length - 1) >= 0 &&
  //         currentPageIndexInStack ===
  //           (historyStack.length - 1 < 0 ? 0 : historyStack.length - 1)
  //     )
  //   );

  //   return () => {
  //     setPreviewPageName("");
  //     setHistoryStack([]);
  //     setCurrentPageIndexInStack(0);
  //     // getAndSetPreviewData("", false , {firstPreview:true});
  //   };
  // }, [showPreview]);

  return (
    <section className="relative bg-[#aaa]    h-full">
      {showAnimBuilder && (
        <section className="grid place-items-center p-2 absolute top-0 left-0 z-20 bg-blur-dark w-full h-full">
          <section className="flex flex-col items-center justify-center self-center p-3 bg-slate-900 rounded-lg gap-5">
            <figure className="relative  w-fit ">
              {Icons.animation(undefined, undefined, "#2563eb", 60, 60)}
            </figure>
            <h1 className="font-bold text-center text-white text-2xl ">
              <span className="text-blue-600 font-bold text-2xl ">" </span>
              You Are In Animations Builder Mode
              <span className="text-blue-600 font-bold text-2xl"> "</span>
            </h1>
            <Button
              onClick={(ev) => {
                setShowAnimBuilder(false);
              }}
            >
              Close
            </Button>
          </section>
        </section>
      )}

      <Canvas
        // key={uniqueID()}
        label="Canvas"
        aria-label="Editor"
        className="overflow-auto"
        style={{ display: showPreview ? "none" : "block", overflow: "auto" }}
        // srcDoc="<video src='../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4'></video>"
      ></Canvas>

      {/* <FloatingButton/> */}

      {showDragLayer && (
        <section className="absolute top-0 left-0 w-full h-full z-[900]  opacity-[0]"></section>
      )}

      <section
        ref={virtualBrowserWindow}
        className="w-full h-full rounded-xl overflow-hidden p-1"
        style={{ display: showPreview ? "block" : "none" }}
      >
        <header className="w-full h-[60px] flex items-center justify-between p-2 rounded-tl-lg rounded-tr-lg  bg-slate-900">
          <section className="flex items-center  gap-5 w-[50%]">
            <FitTitle className=" w-[30%!important] h-full rounded-lg font-semibold capitalize text-xl text-center">
              {previewPageName}
            </FitTitle>
            {/* 
            <SmallButton
              id="back"
              className={`h-full w-fit [&:hover_path]:stroke-white      focus:border-transparent`}
              onClick={(ev) => {
                const newStackIndex = currentPageIndexInStack - 1;
                const newPreviewPage = historyStack[newStackIndex];
                // getAndSetPreviewData(newPreviewPage, false, {
                //   firstPreview: false,
                //   newHistory: historyStack,
                // });
                // if (newStackIndex < 0) {
                //   setCurrentIndexStates({
                //     isStart: true,
                //     isBetween: false,
                //     isEnd: false,
                //   });
                //   return;
                // }
                // setCurrentIndexStates({
                //   isStart: false,
                //   isBetween: newStackIndex > 0,
                //   isEnd: false,
                // });
                // setCurrentPageIndexInStack(newStackIndex);
                // setPreviewSrc(newPreviewPage);
                // setPreviewPageName(getPreviewPageName(newPreviewPage));
                //   ${
                //   currentPageIndexInStack == 0
                //     ? "pointer-events-none"
                //     : "[&_path]:stroke-white [&:hover_path]:stroke-white"
                // }
                // console.log(previewIframe.current.contentWindow.history);
                // console.log(previewIframe.current.contentWindow.history.length);
                // console.log(previewIframe.current.contentWindow.history.state);
                //         // previewIframe.current.contentWindow.history.pushState
                //         //  ({ pageName: currentUrl }, "", "");

                previewIframe.current.contentWindow.history.back(-1);
              }}
            >
              <span className="rotate-90">{Icons.arrow()}</span>
            </SmallButton>

            <SmallButton
              id="forward"
              className={`h-full w-fit [&:hover_path]:stroke-white  focus:border-transparent`}
              onClick={(ev) => {
                const newStackIndex = currentPageIndexInStack + 1;
                const newPreviewPage = historyStack[newStackIndex];
                // getAndSetPreviewData(newPreviewPage, false, {
                //   firstPreview: false,
                //   newHistory: historyStack,
                // });
                // if (newStackIndex >= historyStack.length) {
                //   setCurrentIndexStates({
                //     isStart: false,
                //     isBetween: false,
                //     isEnd: true,
                //   });
                //   return;
                // }
                // setCurrentIndexStates({
                //   isStart: false,
                //   isBetween: newStackIndex > 0,
                //   isEnd: false,
                // });
                // setCurrentPageIndexInStack(newStackIndex);
                // setPreviewSrc(newPreviewPage);
                // setPreviewPageName(getPreviewPageName(newPreviewPage));
                //   ${
                //   Boolean(
                //     (currentPageIndexInStack === historyStack.length - 1) >= 0 &&
                //       currentPageIndexInStack ===
                //         (historyStack.length - 1 < 0
                //           ? 0
                //           : historyStack.length - 1)
                //   )
                //     ? "pointer-events-none"
                //     : "[&_path]:stroke-white [&:hover_path]:stroke-white "
                // }

                // console.log(previewIframe.current.contentWindow.history.length);
                // console.log(previewIframe.current.contentWindow.history.state);

                previewIframe.current.contentWindow.history.forward();
              }}
            >
              <span className="rotate-[-90deg]">{Icons.arrow()}</span>
            </SmallButton> */}

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

        <main className="h-full " ref={iframeContainer}>
          {/* {isChrome() && ( */}
          {showPreview && (
            <iframe
              ref={previewIframe}
              id="preview"
              allowFullScreen
              src={previewSrc || urlSrc}
              translate="yes"
              security="restricted"
              about="target"
              allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
              content="text/html; charset=UTF-8"
              unselectable="on"
              // sandbox=""
              // sandbox="allow-same-origin allow-scripts allow-modals allow-forms allow-popups"
              // src="about:srcdoc"
              // srcDoc=""
              // srcDoc={`<video
              //    src="../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4"
              //    controls
              //  ></video>`}
              className={`bg-white w-full h-[calc(100%-60px)]  transition-all border-[5px] rounded-bl-lg rounded-br-lg border-slate-900`}
              // srcDoc={srcDoc}
            ></iframe>
          )}

          {/* )} */}
        </main>
      </section>
    </section>
  );
});
