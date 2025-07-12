import React, { useEffect, useRef, useState } from "react";
import { MultiTab } from "../../Protos/Multitabs";
import { TabLabel } from "../Protos/TabLabel";
import { Icons } from "../../Icons/Icons";
import { CodeEditor } from "../Protos/CodeEditor";
import { Button } from "../../Protos/Button";
import { current_page_id, current_project_id } from "../../../constants/shared";
import { useLiveQuery } from "dexie-react-hooks";
import {
  executeAndExtractFunctions,
  getProjectData,
} from "../../../helpers/functions";
import { useEditorMaybe } from "@grapesjs/react";
import { db } from "../../../helpers/db";
import { random } from "../../../helpers/cocktail";
import { infinitelyWorker } from "../../../helpers/infinitelyWorker";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot } from "../../../helpers/bridge";
import { css_beautify, html_beautify, js_beautify } from "js-beautify";

export const CodeManagerModal = () => {
  const timeoutRef = useRef();
  const [randomKeys, setRandomKeys] = useState({
    localJsKey: random(100),
    globalJsKey: random(100),
  });

  const currentPageName = localStorage.getItem(current_page_id);
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
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

      for (const handle of filesHandle) {
        
      }

      const filesAsText = Object.fromEntries(
        await Promise.all(
          filesHandle.map(async (handle) => {
            console.log([handle.path, await handle.text()]);
            const file =await handle.getOriginFile();
            const isHtml = file.type.includes('html');
            const isCss = file.type.includes('css');
            const isJS = file.type.includes('javascript');
            const content = isHtml ? html_beautify(await handle.text()) : isCss ? css_beautify(await handle.text()) : isJS ? js_beautify(await handle.text()) : await handle.text()
            return [handle.path, content];
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
  
    const newChange = {}
    for (const key in filesData) {
      const root = defineRoot(key);
      const isChanged = changed[root];
      console.log('chhhhhhhhhhhhhhhhhhhhhhage before : ' ,root,changed, isChanged);
      if (!isChanged) continue;
      console.log('chhhhhhhhhhhhhhhhhhhhhhage : ' , isChanged);
      
      await opfs.writeFiles([
        {
          path: root,
          content: filesData[root],
        },
      ]);
      newChange[root] = false;
    }

    setChanged({
      ...changed,
      ...newChange
    })
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
                key={randomKeys.localJsKey}
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
                key={randomKeys.globalJsKey}
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
      <footer className="h-[8%] flex items-center py-2">
        <Button
          onClick={async () => {
            // await updateDB();
            await save()
            await editor.load();
          }}
        >
          {Icons.save('white' , 0 , 'white')}
          Save
        </Button>
      </footer>
    </section>
  );
};
