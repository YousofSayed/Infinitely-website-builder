import React, { useEffect, useRef, useState } from "react";
import { MultiTab } from "../../Protos/Multitabs";
import { TabLabel } from "../Protos/TabLabel";
import { Icons } from "../../Icons/Icons";
import { CodeEditor } from "../Protos/CodeEditor";
import { Button } from "../../Protos/Button";
import { current_page_id, current_project_id } from "../../../constants/shared";
import { store, workerCallbackMaker } from "../../../helpers/functions";
import { useEditorMaybe } from "@grapesjs/react";
import { random, uniqueID } from "../../../helpers/cocktail";
import { infinitelyWorker } from "../../../helpers/infinitelyWorker";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot, getStringSizeBytes, toMB } from "../../../helpers/bridge";
import { css_beautify, html_beautify, js_beautify } from "js-beautify";
import { isPlainObject, uniqueId } from "lodash";
import { reloadRequiredInstance } from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { renderCssStyles } from "../../../plugins/IDB";

export const CodeManagerModal = () => {
  const timeoutRef = useRef();
  const [randomKeys, setRandomKeys] = useState({
    localJsKey: random(100),
    globalJsKey: random(100),
  });

  const currentPageName = localStorage.getItem(current_page_id);
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
  const createUUID = () => uniqueId(`reloader-${random(100000)}-${uniqueID()}`);
  const [reloaderKey, setReloaderKey] = useState(createUUID());
  // const [pageStructure, setPageStructure] = useState({
  //   html: {
  //     path: `editor/pages/${currentPageName}.html`,
  //     content: "",
  //   },
  //   css: {
  //     path: `css/${currentPageName}.css`,
  //     content: "",
  //   },
  //   js: {
  //     path: `js/${currentPageName}.js`,
  //     content: "",
  //   },
  // });

  // const [globals, setGlobals] = useState({
  //   globalCss: {
  //     path:'global/global.css',
  //     content:''
  //   },
  //   globalJs: {
  //     path:'global/global.js'
  //   },
  // });

  const htmlPath = `editor/pages/${currentPageName}.html`;
  const cssPath = `css/${currentPageName}.css`;
  const jsPath = `js/${currentPageName}.js`;
  const [filesData, setFilesData] = useState({
    [htmlPath]: "",
    [cssPath]: "",
    [jsPath]: "",
    [`global/global.css`]: "",
    [`global/global.js`]: "",
  });

  const [changed, setChanged] = useState({});

  useEffect(() => {
    (async () => {
      // const localFiles = await await opfs.getFiles([
      //   {
      //     path: defineRoot(`editor/pages/${currentPageName}.html`),
      //     as: "Text",
      //   },
      //   {
      //     path: defineRoot(`css/${currentPageName}.css`),
      //     as: "Text",
      //   },
      //   {
      //     path: defineRoot(`js/${currentPageName}.js`),
      //     as: "Text",
      //   },
      //   {
      //     path: def,
      //   },
      // ]);

      // const globalFiles = await opfs.getFiles([
      //   {
      //     path: defineRoot(`global/global.css`),
      //   },
      //   {
      //     path: defineRoot(`global/global.js`),
      //   },
      // ]);

      // setPageStructure({
      //   html: {
      //     ...pageStructure.html,
      //     content: await localFiles[0].text(),
      //   },
      //   css: {},
      //   js: await localFiles[2].text(),
      // });

      // setGlobals({
      //   globalCss: await globalFiles[0].text(),
      //   globalJs: await globalFiles[1].text(),
      // });

      const filesHandle = await await opfs.getFiles(
        Object.keys(filesData).map((key) => ({ path: defineRoot(key) }))
      );

      // for (const handle of filesHandle) {

      // }

      const filesAsText = Object.fromEntries(
        await Promise.all(
          filesHandle.map(async (handle) => {
            console.log([handle.path, await handle.text()]);
            const file = await handle.getOriginFile();
            const isHtml = handle.path.endsWith(".html");
            const isCss = handle.path.endsWith(".css");
            const isJS = handle.path.endsWith(".js");
            const isCssEditorStyles = handle.path.includes(
              `css/${currentPageName}.css`
            );
            const isHtmlEditorContent = handle.path.includes(
              `editor/pages/${currentPageName}.html`
            );
            let content = "";
            if (!isCssEditorStyles) {
              content = isHtml
                ? html_beautify(await handle.text())
                : isCss
                ? css_beautify(await handle.text())
                : isJS
                ? js_beautify(await handle.text())
                : await handle.text();
            }

            if (!isHtmlEditorContent) {
              content = isHtml
                ? html_beautify(await handle.text())
                : isCss
                ? css_beautify(await handle.text())
                : isJS
                ? js_beautify(await handle.text())
                : await handle.text();
            }

            console.log(`css editor : `, editor.getCss({
                      avoidProtected: true,
                      keepUnusedStyles: true,
                      clearStyles: false,
                      onlyMatched: false,
                    }));

            return isCssEditorStyles
              ? [
                  handle.path,
                  css_beautify(
                    editor.getCss({
                      avoidProtected: true,
                      keepUnusedStyles: true,
                      clearStyles: false,
                      onlyMatched: false,
                    })
                  ),
                ]
              : isHtmlEditorContent
              ? [
                  handle.path,
                  html_beautify(
                    editor.getWrapper().getInnerHTML({ withProps: true })
                  ),
                ]
              : [handle.path, content];
          })
        )
      );

      // console.log('Files as text : ' , filesAsText);

      setFilesData(filesAsText);
    })();
  }, []);

  const updateLocals = async ({ path, value }) => {
    await opfs.writeFiles([
      {
        path: defineRoot(path),
        content: value,
        // options:{

        // }
      },
    ]);
    // setPageStructure({
    //   ...pageStructure,
    //   [key]: value,
    // });
  };

  const updateFileContentInEditor = async ({ path, value }) => {
    // await opfs.writeFiles([
    //   {
    //     path: defineRoot(path),
    //     content: value,
    //   },
    // ]);

    setFilesData({
      ...filesData,
      [defineRoot(path)]: value,
    });

    console.log({
      ...changed,
      [defineRoot(path)]: true,
    });

    setChanged({
      ...changed,
      [defineRoot(path)]: true,
    });

    // setGlobals({
    //   ...globals,
    //   [key]: value,
    // });
  };

  const save = async () => {
    const newChange = {};
    let isHtmlUpdated = false;
    let isCssUpdated = false;

    for (const key in filesData) {
      const root = defineRoot(key);
      const isChanged = changed[root];

      if (!isChanged) continue;
      console.log("chhhhhhhhhhhhhhhhhhhhhhage : ", isChanged, key);

      if (
        key.includes(`editor/pages/${currentPageName}.html`) ||
        key.includes(`css/${currentPageName}.css`)
      ) {
        const response = await new Promise((res, rej) => {
          workerCallbackMaker(
            infinitelyWorker,
            "parseHTMLAndRaplceSymbols",
            (props) => {
              res(props);
            }
          );

          infinitelyWorker.postMessage({
            command: "parseHTMLAndRaplceSymbols",
            props: {
              pageName: currentPageName,
              projectId,
            },
          });
        });

        if (
          response.done &&
          isPlainObject(response.symbols) &&
          key.includes(`css/${currentPageName}.css`)
        ) {
          const symbolsCssContent = {};
          const cssSymbolsRes = await new Promise((res, rej) => {
            workerCallbackMaker(
              infinitelyWorker,
              "updateSymbolsStylesFiles",
              (props) => {
                res(props);
              }
            );

            infinitelyWorker.postMessage({
              command: "updateSymbolsStylesFiles",
              props: {
                symbols: response.symbols,
                cssCode: filesData[defineRoot(`css/${currentPageName}.css`)],
              },
            });
          });

          console.log(
            "response  : ",
            // filesData[defineRoot(`css/${currentPageName}.css`)],
            response,
            cssSymbolsRes
          );
        }
      }
      //Handle real time saving
      if (key.includes(`editor/pages/${currentPageName}.html`)) {
        // const htmlContent = filesData[key];
        // const cssContent = filesData[defineRoot(`css/${currentPageName}.css`)];
        // const htmlSize = toMB(getStringSizeBytes(htmlContent)); // size in MB
        // const cssSize = toMB(getStringSizeBytes(cssContent)); // size in MB
        // if (htmlSize + cssSize > 0.2) {
        //   // ~200 KB
        //   toast.warn(
        //     <ToastMsgInfo
        //       msg={`The HTML & CSS files is too large for real-time updates. Please reload the page.`}
        //     />
        //   );
        // } else {
        //   // editor.DomComponents.clear();
        //   // editor.setComponents(
        //   //   renderCssStyles(editor, filesData) + htmlContent,
        //   //   { avoidStore: true }
        //   // ); // typo: "avoideStore" → "avoidStore"
        //   // editor.clearDirtyCount();
        //   isHtmlUpdated = true;
        // }
      }

      if (key.includes(`css/${currentPageName}.css`) && !isHtmlUpdated) {
        // const cssContent = filesData[key];
        // const cssSize = toMB(getStringSizeBytes(cssContent)); // size in MB
        // if (cssSize > 0.15) {
        //   // ~150 KB
        //   toast.warn(
        //     <ToastMsgInfo
        //       msg={`The CSS file is too large for real-time updates. Please reload the page.`}
        //     />
        //   );
        // } else {
        //   // editor.Css.clear();
        //   // editor.setStyle("");
        //   // editor.addComponents(renderCssStyles(editor, cssContent));
        //   // editor.clearDirtyCount();
        //   isCssUpdated = true;
        // }
      }

      // return;

      const fileWriteRes = await new Promise((res, rej) => {
        workerCallbackMaker(infinitelyWorker, "writeFilesToOPFS", (props) => {
          res(props);
        });

        console.log("root to write : ", root, filesData[root]);

        infinitelyWorker.postMessage({
          command: "writeFilesToOPFS",
          props: {
            files: [
              {
                path: root,
                content: filesData[root],
              },
            ],
          },
        });
      });
      // await opfs.writeFiles([
      //   {
      //     path: root,
      //     content: filesData[root],
      //   },
      // ]);

      console.log("fileWriteRes response : ", fileWriteRes);

      fileWriteRes.roots.includes(root) &&
        fileWriteRes.done &&
        (newChange[root] = false);
    }

    setChanged({
      ...changed,
      ...newChange,
    });
    setReloaderKey(createUUID());
    editor.clearDirtyCount();
    // await editor.load();

    let totalHTMLAndCssSize = [
      new Blob(
        [filesData[defineRoot(`editor/pages/${currentPageName}.html`)]],
        { type: "text/html" }
      ),
      new Blob([filesData[defineRoot(`css/${currentPageName}.css`)]], {
        type: "text/css",
      }),
    ]
      .map((file) => file.size)
      .reduce((prev, current) => (prev += current), 0);
    //  let totalHTMLAndCssSize = await (
    //   await Promise.all(
    //     (
    //       await opfs.getFiles([
    //         {
    //           path: defineRoot(`editor/pages/${currentPageName}.html`),
    //           as: "File",
    //         },
    //         { path: defineRoot(`css/${currentPageName}.css`), as: "File" },
    //       ])
    //     ).map(async (file) => await file.getSize())
    //   )
    // ).reduce((prev, current) => (prev += current), 0);

    console.log(
      "totalHTMLAndCssSize : ",
      totalHTMLAndCssSize,
      toMB(totalHTMLAndCssSize, 2)
    );

    if (toMB(totalHTMLAndCssSize, 2) <= 0.25) {
      // await store({}, editor);
      console.log("Less than : ", toMB(totalHTMLAndCssSize, 2));
      editor.load();

      // const cb = () => {
      //   editor.off(InfinitelyEvents.storage.storeEnd , cb);
      // };
      // editor.on(InfinitelyEvents.storage.storeEnd, cb);
    } else {
      console.log('Reload required:');
      
      reloadRequiredInstance.emit(InfinitelyEvents.editor.require, {
        state: true,
      });
    }
  };

  return (
    <section className="h-full flex flex-col ">
      <MultiTab
        style={{ height: "92%" }}
        onTabClick={async () => {
          // await updateDB();
          //   await editor.load();
          //   setRandomKeys({
          //     localJsKey: random(100),
          //     globalJsKey: random(100),
          //   });
        }}
        preventViewScroll
        tabs={[
          {
            title: <TabLabel icon={Icons.html({})} label="HTML" />,
            content: (
              <CodeEditor
                key={`1-${reloaderKey}`}
                props={{
                  language: "html",
                  value: filesData[defineRoot(htmlPath)],
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `editor/pages/${currentPageName}.html`,
                      value,
                    });
                    console.log(value);
                  },
                }}
              />
            ),
          },
          {
            title: <TabLabel icon={Icons.css({})} label="local.css" />,
            content: (
              <CodeEditor
                key={`2-${reloaderKey}`}
                props={{
                  language: "css",
                  value: filesData[defineRoot(cssPath)],
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `css/${currentPageName}.css`,
                      value,
                    });
                  },
                }}
              />
            ),
          },
          {
            title: <TabLabel icon={Icons.js({})} label="local.js" />,
            content: (
              <CodeEditor
                key={`3-${reloaderKey}`}
                // extraLibs={pageStructure.js}
                props={{
                  language: "javascript",
                  value: filesData[defineRoot(jsPath)],
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `js/${currentPageName}.js`,
                      value,
                    });
                  },
                }}
              />
            ),
          },
          {
            title: <TabLabel icon={Icons.css({})} label="global.css" />,
            content: (
              <CodeEditor
                key={`4-${reloaderKey}`}
                props={{
                  language: "css",
                  value: filesData[defineRoot(`global/global.css`)],
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `global/global.css`,
                      value,
                    });
                  },
                }}
              />
            ),
          },
          {
            title: <TabLabel icon={Icons.js({})} label="global.js" />,
            content: (
              <CodeEditor
                key={`5-${reloaderKey}`}
                // extraLibs={globals.globalJs}
                // isTemplateEngine
                // allowCmdsContext
                props={{
                  language: "javascript",
                  value: filesData[defineRoot(`global/global.js`)],
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `global/global.js`,
                      value,
                    });
                  },
                }}
              />
            ),
          },
        ]}
      />
      <footer className="h-[8%] flex items-center py-2 mt-2">
        <Button
          className="flex-grow-0 flex-shrink"
          onClick={async () => {
            // await updateDB();
            await save();
          }}
        >
          {Icons.save("white", 0, "white")}
          Save
        </Button>
      </footer>
    </section>
  );
};
