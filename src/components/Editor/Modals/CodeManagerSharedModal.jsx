import { wp_save_code } from "@/Apps/wordpress/functions";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import { current_page_id, current_project_id } from "@/constants/shared";
import {
  defineRoot,
  getStringSizeBytes,
  mediaSlugToFileName,
  normalizeComponentsTree,
  toMB,
} from "@/helpers/bridge";
import { wp_preview_bc } from "@/helpers/channels";
import { random, uniqueID } from "@/helpers/cocktail";
import {
  doInNormalAsync,
  doInWordpressAsync,
  getProjectData,
  getWpPageConfig,
  reloadInfinitely,
  store,
  workerCallbackMaker,
  isWordpress,
  isNormal,
  emitChange,
  callWorkerCommand,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { renderCssStyles } from "@/plugins/IDB";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { MultiTab } from "@/components/Protos/Multitabs";
import { CodeEditor } from "@/components/Editor/Protos/CodeEditor";
import { TabLabel } from "@/components/Editor/Protos/TabLabel";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { css_beautify, html_beautify, js_beautify } from "js-beautify";
import { isPlainObject, uniqueId } from "lodash";
import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useWordpress } from "@/hooks/useWordpress";
import { useNormal } from "@/hooks/useNormal";

export const CodeManagerSharedModal = () => {
  const timeoutRef = useRef(null);
  const [randomKeys, setRandomKeys] = useState({
    localJsKey: random(100),
    globalJsKey: random(100),
  });

  const currentPageName = localStorage.getItem(current_page_id) || "";
  const projectId = +(localStorage.getItem(current_project_id) || "0");
  const editor = useEditorMaybe();

  const createUUID = () => uniqueId(`reloader-${random(100000)}-${uniqueID()}`);
  const [reloaderKey, setReloaderKey] = useState(createUUID());
  const [disabled, setDisabled] = useState(false);

  // Unified state keys for both modes to prevent mapping bugs
  const [filesData, setFilesData] = useState({
    html: "",
    css: "",
    js: "",
    globalCss: "",
    globalJs: "",
  });

  const [changed, setChanged] = useState({
    html: false,
    css: false,
    js: false,
    globalCss: false,
    globalJs: false,
  });

  const beautifyContent = (path, content) => {
    if (path.endsWith(".html")) return html_beautify(content);
    if (path.endsWith(".css")) return css_beautify(content);
    if (path.endsWith(".js")) return js_beautify(content);
    return content;
  };

  // --- NORMAL MODE INITIALIZATION ---
  useNormal(async () => {
    if (!editor) return;

    const htmlPath = `editor/pages/${currentPageName}.html`;
    const cssPath = `css/${currentPageName}.css`;
    const jsPath = `js/${currentPageName}.js`;
    const pathsToFetch = [
      htmlPath,
      cssPath,
      jsPath,
      "global/global.css",
      "global/global.js",
    ];

    const filesHandle = await opfs.getFiles(
      pathsToFetch.map((key) => ({ path: defineRoot(key) })),
    );

    const filesAsText = Object.fromEntries(
      await Promise.all(
        filesHandle.map(async (handle) => {
          const isHtml = handle.path.endsWith(".html");
          const isCss = handle.path.endsWith(".css");
          const isJS = handle.path.endsWith(".js");
          const isCssEditorStyles = handle.path.includes(
            `css/${currentPageName}.css`,
          );
          const isHtmlEditorContent = handle.path.includes(
            `editor/pages/${currentPageName}.html`,
          );

          if (isCssEditorStyles) {
            return [
              "css",
              css_beautify(
                editor.getCss({
                  avoidProtected: true,
                  keepUnusedStyles: true,
                  clearStyles: false,
                  onlyMatched: false,
                }),
              ),
            ];
          }

          if (isHtmlEditorContent) {
            return [
              "html",
              html_beautify(
                editor.getWrapper().getInnerHTML({ withProps: true }),
              ),
            ];
          }

          const content = isHtml
            ? html_beautify(await handle.text())
            : isCss
              ? css_beautify(await handle.text())
              : isJS
                ? js_beautify(await handle.text())
                : await handle.text();

          if (handle.path.includes("global.css")) return ["globalCss", content];
          if (handle.path.includes("global.js")) return ["globalJs", content];
          if (isJS) return ["js", content];

          return ["html", content]; // fallback
        }),
      ),
    );

    setFilesData((prev) => ({ ...prev, ...filesAsText }));
  }, [currentPageName, editor]);

  // --- WORDPRESS MODE INITIALIZATION ---
  useWordpress(async () => {
    if (!editor) return;

    const projectData = await getProjectData();
    const slugs = [
      projectData.globalJs.slug,
      projectData.globalCss.slug,
      "local.js",
    ];

    const filesHandle = await opfs.getFiles(
      slugs.map((key) => ({ path: defineRoot(mediaSlugToFileName(key)) })),
    );

    const filesWithContent = Object.fromEntries(
      await Promise.all(
        filesHandle.map(async (handle) => {
          const text = await (await handle.getOriginFile()).text();
          const beautified = beautifyContent(handle.path, text);

          if (handle.path.includes(projectData.globalCss.slug))
            return ["globalCss", beautified];
          if (handle.path.includes(projectData.globalJs.slug))
            return ["globalJs", beautified];
          if (handle.path.includes("local.js") || handle.path.endsWith(".js"))
            return ["js", beautified];

          return ["js", beautified]; // fallback
        }),
      ),
    );

    setFilesData({
      html: html_beautify(
        editor.getWrapper().getInnerHTML({ withProps: true }),
      ),
      css: css_beautify(
        editor.getCss({
          avoidProtected: true,
          keepUnusedStyles: true,
          clearStyles: false,
          onlyMatched: false,
        }),
      ),
      js: filesWithContent["js"] || "",
      globalCss: filesWithContent["globalCss"] || "",
      globalJs: filesWithContent["globalJs"] || "",
    });
  }, [currentPageName, editor]);

  const updateFileContentInEditor = async ({ key, value }) => {
    setFilesData((prev) => ({
      ...prev,
      [key]: value,
    }));

    setChanged((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const save = async (save_state = "saved") => {
    // --- WORDPRESS MODE SAVE ---
    await doInWordpressAsync(async () => {
      setDisabled(true);
      const tid = toast.loading(<ToastMsgInfo msg={`Saving code...`} />);

      try {
        const clone = { ...filesData };
        const parsedHtml = editor?.Parser.parseHtml(filesData.html, {
          allowScripts: true,
        });
        if (parsedHtml) {
          clone.html = normalizeComponentsTree(parsedHtml.html);
        }

        const wp_post = getWpPageConfig();

        const res = await wp_save_code({
          projectId,
          post_id: wp_post.id,
          meta: {
            html: clone.html,
            css: clone.css,
            js: clone.js,
          },
          global: {
            js: filesData.globalJs,
            css: filesData.globalCss,
          },
          save_state,
        });

        console.log("res from save code: ", res);

        wp_preview_bc.postMessage({
          props: {
            url: wp_post.link,
            mode: "preview",
            save_state: "before_save",
          },
        });
        emitChange();
        toast.done(tid);
        toast.success(<ToastMsgInfo msg={`Code saved successfully 😍`} />);
      } catch (error) {
        toast.dismiss(tid);
        toast.error(<ToastMsgInfo msg={`Failed to save code 😥`} />);
        console.error(error);
        throw error;
      } finally {
        setDisabled(false);
      }
    });

    // --- NORMAL MODE SAVE ---
    await doInNormalAsync(async () => {
      const tid = toast.loading(<ToastMsgInfo msg={`Saving code...`} />);
      try {
        const newChange = { ...changed };
        let isHtmlUpdated = false;
        let isCssUpdated = false;

        const pathMap = {
          html: `editor/pages/${currentPageName}.html`,
          css: `css/${currentPageName}.css`,
          js: `js/${currentPageName}.js`,
          globalCss: `global/global.css`,
          globalJs: `global/global.js`,
        };

        for (const key in filesData) {
          const path = pathMap[key];
          const root = defineRoot(path);
          const isChanged = changed[key];

          if (!isChanged) continue;

          if (key === "html" || key === "css") {
            const response = await callWorkerCommand(
              infinitelyWorker,
              "parseHTMLAndRaplceSymbols",
              {
                pageName: currentPageName,
                projectId,
              },
            );

            // const response = await new Promise((res) => {
            //   workerCallbackMaker(
            //     infinitelyWorker,
            //     "parseHTMLAndRaplceSymbols",
            //     res,
            //   );
            //   infinitelyWorker.postMessage({
            //     command: "parseHTMLAndRaplceSymbols",
            //     props: { pageName: currentPageName, projectId },
            //   });
            // });

            if (
              response.done &&
              isPlainObject(response.symbols) &&
              key === "css"
            ) {
              await callWorkerCommand(
                infinitelyWorker,
                "updateSymbolsStylesFiles",
                {
                  symbols: response.symbols,
                  cssCode: filesData.css,
                },
              );
              //   await new Promise((res) => {
              //     workerCallbackMaker(
              //       infinitelyWorker,
              //       "updateSymbolsStylesFiles",
              //       res,
              //     );
              //     infinitelyWorker.postMessage({
              //       command: "updateSymbolsStylesFiles",
              //       props: {
              //         symbols: response.symbols,
              //         cssCode: filesData.css,
              //       },
              //     });
              //   });
            }
          }

          // Handle real time saving (Preserved from original logic)
          // if (key === 'html') { ... }
          // if (key === 'css' && !isHtmlUpdated) { ... }

          const fileWriteRes = await callWorkerCommand(
            infinitelyWorker,
            "writeFilesToOPFS",
            {
              files: [{ path:root, content: filesData[key] }],
            },
          );

          //   await new Promise((res) => {
          //     workerCallbackMaker(infinitelyWorker, "writeFilesToOPFS", res);
          //     infinitelyWorker.postMessage({
          //       command: "writeFilesToOPFS",
          //       props: {
          //         files: [{ path: root, content: filesData[key] }],
          //       },
          //     });
          //   });

          if (fileWriteRes?.roots?.includes?.(root) && fileWriteRes?.done) {
            newChange[key] = false;
          }
        }

        setChanged(newChange);
        setReloaderKey(createUUID());
        // editor?.clearDirtyCount();

        // let totalHTMLAndCssSize = [
        //   new Blob([filesData.html], { type: "text/html" }),
        //   new Blob([filesData.css], { type: "text/css" }),
        // ]
        //   .map((file) => file.size)
        //   .reduce((prev, current) => (prev += current), 0);

        //   if (toMB(totalHTMLAndCssSize, 2) <= 0.25) {
        //     editor?.load();
        //   } else {
        //     reloadRequiredInstance.emit(InfinitelyEvents.editor.require, { state: true });
        //   }

        emitChange();

        toast.done(tid);
        toast.success(<ToastMsgInfo msg={`Code saved successfully 😍`} />);
      } catch (error) {
        toast.dismiss(tid);
        toast.error(<ToastMsgInfo msg={`Failed to save code 😥`} />);
        console.error(error);
        throw error;
      } finally {
        setDisabled(false);
      }
    });
  };

  return (
    <section className="h-full flex flex-col">
      <MultiTab
        style={{ height: "92%" }}
        onTabClick={async () => {
          setRandomKeys({
            localJsKey: random(100),
            globalJsKey: random(100),
          });
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
                  value: filesData.html,
                  onChange: (value) =>
                    updateFileContentInEditor({ key: "html", value }),
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
                  value: filesData.css,
                  onChange: (value) =>
                    updateFileContentInEditor({ key: "css", value }),
                }}
              />
            ),
          },
          {
            title: <TabLabel icon={Icons.js({})} label="local.js" />,
            content: (
              <CodeEditor
                key={`3-${reloaderKey}`}
                props={{
                  language: "javascript",
                  value: filesData.js,
                  onChange: (value) =>
                    updateFileContentInEditor({ key: "js", value }),
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
                  value: filesData.globalCss,
                  onChange: (value) =>
                    updateFileContentInEditor({ key: "globalCss", value }),
                }}
              />
            ),
          },
          {
            title: <TabLabel icon={Icons.js({})} label="global.js" />,
            content: (
              <CodeEditor
                key={`5-${reloaderKey}`}
                props={{
                  language: "javascript",
                  value: filesData.globalJs,
                  onChange: (value) =>
                    updateFileContentInEditor({ key: "globalJs", value }),
                }}
              />
            ),
          },
        ]}
      />
      <footer className="min-h-[8%] flex items-center gap-3 py-2 mt-2">
        {isWordpress() && (
          <Button
            disabled={disabled}
            className="flex-grow-0 flex-shrink bg-surface-tertiary hover:bg-brand-primary transition-colors"
            onClick={async () => await save("saved")}
          >
            {Icons.save("white", 0, "white")}
            Publish
          </Button>
        )}
        <Button
          disabled={disabled}
          className="flex-grow-0 flex-shrink bg-surface-tertiary hover:bg-brand-primary transition-colors"
          onClick={async () =>
            await save(isWordpress() ? "before_save" : "saved")
          }
        >
          {Icons.save("white", 0, "white")}
          Save
        </Button>
      </footer>
    </section>
  );
};
