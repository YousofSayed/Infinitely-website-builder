import { wp_save_code } from "@/apps/wordpress/functions";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import { current_page_id, current_project_id } from "@/constants/shared";
import { defineRoot, getStringSizeBytes, mediaSlugToFileName, normalizeComponentsTree, toMB } from "@/helpers/bridge";
import { wp_preview_bc } from "@/helpers/channels";
import { random, uniqueID } from "@/helpers/cocktail";
import { getProjectData, getWpPageConfig, reloadInfinitely, store, workerCallbackMaker } from "@/helpers/functions";
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
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export const WpCodeManagerModal = () => {
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
  const [disabled, setDisabled] = useState(false);


  const [filesData, setFilesData] = useState({
    html: "",
    css: "",
    js: "",
  });

  const [changed, setChanged] = useState({});

  useEffect(() => {
    (async () => {
      const projectData = await getProjectData();
      const filesHandle = await await opfs.getFiles(
        [projectData.globalJs.slug, projectData.globalCss.slug, 'local.js'].map((key) => ({ path: defineRoot(mediaSlugToFileName(key)) }))
      );



      const filesWithContent = Object.fromEntries(await Promise.all(filesHandle.map(async handle => [handle.path, beautify(handle.path, await (await handle.getOriginFile()).text())])))

      setFilesData({
        html: html_beautify(
          editor.getWrapper().getInnerHTML({ withProps: true })
        ),
        css: css_beautify(
          editor.getCss({
            avoidProtected: true,
            keepUnusedStyles: true,
            clearStyles: false,
            onlyMatched: false,
          })
        ),

        ...(filesWithContent || {})
      })

    })();
  }, []);

  const beautify = (path = '', content) => {
    const is_html = path.endsWith('.html');
    const is_css = path.endsWith('.css');
    const is_js = path.endsWith('.js');

    if (is_html) return html_beautify(content);
    if (is_css) return css_beautify(content);
    if (is_js) return js_beautify(content);

    return content;
  }

  const updateFileContentInEditor = async ({ path, value }) => {
    // await opfs.writeFiles([
    //   {
    //     path: defineRoot(path),
    //     content: value,
    //   },
    // ]);

    setFilesData({
      ...filesData,
      [path]: value,
    });

    console.log({
      ...changed,
      [path]: true,
    });

    setChanged({
      ...changed,
      [path]: true,
    });

    // setGlobals({
    //   ...globals,
    //   [key]: value,
    // });
  };

  const save = async (save_state) => {
    setDisabled(true);
    const tid = toast.loading(<ToastMsgInfo msg={`Saving code...`} />);

    // console.log('parsed html', editor.Parser.parseHtml(filesData.html, {
    //   allowScripts: true,

    // }));

    try {
      const clone = structuredClone(filesData);
      clone.html = normalizeComponentsTree(editor.Parser.parseHtml(filesData.html, {
        allowScripts: true,

      }).html);

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
          js: filesData[defineRoot('global.js')],
          css: filesData[defineRoot('global.css')],
        },
        save_state
      })


      console.log('res from save code: ', res);



      toast.done(tid);
      toast.success(<ToastMsgInfo msg={`Code saved successfully 😍`} />)
      wp_preview_bc.postMessage({
        props: {
          url: wp_post.link,
          mode: "preview",
          save_state: "before_save",
        },
      });
      reloadInfinitely();
    } catch (error) {
      toast.dismiss(tid);
      toast.error(<ToastMsgInfo msg={`Faild to save code 😥`} />);
      throw new Error(error);
    } finally {
      setDisabled(false)
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
                  value: filesData.html,
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `html`,
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
                  value: filesData.css,
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `css`,
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
                  value: filesData.js,
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: `js`,
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
                  value: filesData[defineRoot(`global.css`)],
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: defineRoot(`global.css`),
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
                  value: filesData[defineRoot(`global.js`)],
                  onChange: (value) => {
                    updateFileContentInEditor({
                      path: defineRoot(`global.js`),
                      value,
                    });
                  },
                }}
              />
            ),
          },
        ]}
      />
      <footer className="min-h-[8%] flex items-center gap-3 py-2 mt-2">
        {/* <Button
          disabled={disabled}
          className="flex-grow-0 flex-shrink bg-surface-tertiary hover:bg-brand-primary transition-colors"
          onClick={async () => {
            // await updateDB();
            await save('saved');
          }}
        >
          {Icons.save("white", 0, "white")}
          Publish
        </Button> */}
        <Button
          disabled={disabled}
          className="flex-grow-0 flex-shrink bg-surface-tertiary hover:bg-brand-primary transition-colors"
          onClick={async () => {
            // await updateDB();
            await save('before_save');
          }}
        >
          {Icons.save("white", 0, "white")}
          Save
        </Button>
      </footer>
    </section>
  );
};
