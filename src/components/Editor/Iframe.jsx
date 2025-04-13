import { Canvas, useEditorMaybe } from "@grapesjs/react";
import React, { memo, useEffect, useRef, useState } from "react";
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
import { addClickClass, html } from "../../helpers/cocktail";
import { iframeType } from "../../helpers/jsDocs";
import {
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

export const Iframe = memo(() => {
  const showLayers = useRecoilValue(showLayersState);
  const [showAnimBuilder, setShowAnimBuilder] = useRecoilState(
    showAnimationsBuilderState
  );
  const [showPreview, setShowPreview] = useRecoilState(showPreviewState);
  const [showDragLayer, setShowDragLayer] = useRecoilState(showDragLayerState);
  const previewIframe = useRef(iframeType);
  const virtualBrowserWindow = useRef(iframeType);
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);

  useEffect(() => {
    // if (!previewIframe.current || !showPreview) return;
    // previewIframe.current.contentWindow.navigator.serviceWorker.register(
    //   "/dbAssets-sw.js",
    //   { scope: "/" }
    // );
    // console.log('origins :' , window.origin , previewIframe.current.contentWindow.origin);
  }, [showPreview]);

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
    console.log(
      "head css : ",
      editor.getCss({ clearStyles: false, keepUnusedStyles: true })
    );

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

  const getPageData = async () => {
    const projectData = await await getProjectData();
    const currentPageId = localStorage.getItem(current_page_id);
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
      editorStyles: "",
      bodyAttributes:
        projectData.pages[`${currentPageId}`].bodyAttributes || {},
    };
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
      .map((src) => html` <script src="${src}" defer></script> `)
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
    data.editorStyles = (await currentPage.css.text()) || "";
    data.globalScript = globalScrtip || "";
    data.localScript = localScript || "";
    return data;
  };

  const getAndSetPreviewData = async () => {
    const pageData = await getPageData();
    const testScript = `
    <script>
    document.body.innerHTML = \`
    <video
            src="../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4"
            controls
          ></video>
    \`
    </script>
    `
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
          ${pageData.helmet} ${pageData.cssLibs} ${pageData.headerScripts}
        </head>

        <body
          style="height:100%;"
          ${Object.keys(pageData.bodyAttributes || {})
            .filter((key) => Boolean(pageData.bodyAttributes[key]))
            .map((key) => `${key}="${pageData.bodyAttributes[key]}"`)
            .join(" ")}
        >
        
         <!-- ${testScript} -->
          ${pageData.content} ${pageData.footerScripts} ${pageData.globalScript}
          ${pageData.localScript} ${pageData.mainScripts}
        </body>
      </html>
    `;
    function htmlToDataUrl(htmlText, mimeType = "text/html") {
      // Encode the HTML string to base64
      const base64String = btoa(unescape(encodeURIComponent(htmlText)));

      // Create the data URL
      return `data:${mimeType};base64,${base64String}`;
    }
    // previewIframe.current.contentDocument.open();
    // previewIframe.current.contentDocument.write(htmlToDataUrl(content));
    initDBAssetsSw(() => {}).then((sw) => {
      if (!sw) return;
      previewIframe.current.srcdoc = content;
      // previewIframe.current.src = htmlToDataUrl(content);
    });
    // previewIframe.current.contentDocument.close();
  };

  const reloadPreview = () => {
    // previewIframe.current.contentDocument.location.reload();
    getAndSetPreviewData();
  };

  useEffect(() => {
    if (!editor || !showPreview) return;
    // previewIframe.current.contentDocument.location.reload();
    // const content = html`
    //   <!DOCTYPE html>
    //   <html lang="en">
    //     <head>
    //       <meta charset="UTF-8" />
    //       <meta
    //         name="viewport"
    //         content="width=device-width, initial-scale=1.0"
    //       />

    //       ${getHead({
    //         data: {
    //           scripts: editor.Canvas.config.scripts,
    //           styles: editor.Canvas.config.styles,
    //         },
    //       })}
    //       <title>Preview:</title>
    //     </head>

    //     ${editor.getHtml()}
    //   </html>
    // `;
    // previewIframe.current.contentDocument.open();
    // previewIframe.current.contentDocument.write(content);
    // previewIframe.current.contentDocument.close();
    getAndSetPreviewData();
    // setSrcDoc(content);
    // previewIframe.current.contentDocument.location.reload();
  }, [showPreview]);

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
        label="Canvas"
        aria-label="Editor"
        className="overflow-auto"
        style={{ display: showPreview ? "none" : "block", overflow: "auto" }}
        scope="/"
        src="about:blank"
        sandbox="true"
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
        <header className="w-full h-[60px] flex items-center justify-between p-2 rounded-tl-lg rounded-tr-lg  bg-black">
          <section className="flex items-center  gap-5 w-[50%]">
            <h1 className="text-slate-200 custom-font-size overflow-hidden text-md p-2 bg-slate-900 shadow-md w-[30%] rounded-lg font-semibold">
              {localStorage.getItem(current_page_id)}
            </h1>
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

        <main className="h-full ">
          <iframe
            ref={previewIframe}
            id="preview"
            allowFullScreen
            // srcDoc={`<video
            //    src="../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4"
            //    controls
            //  ></video>`}
            className={`bg-white w-full h-[calc(100%-60px)]  transition-all border-[5px] rounded-bl-lg rounded-br-lg border-black`}
            // srcDoc={srcDoc}
          ></iframe>
        </main>
      </section>
    </section>
  );
});
