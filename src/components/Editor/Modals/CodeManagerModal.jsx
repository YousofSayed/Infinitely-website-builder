import React, { useRef, useState } from "react";
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

export const CodeManagerModal = () => {
  const timeoutRef = useRef();
  const [randomKeys, setRandomKeys] = useState({
    localJsKey: random(100),
    globalJsKey: random(100),
  });

  const currentPageName = localStorage.getItem(current_page_id);
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
  const [pageStructure, setPageStructure] = useState({
    html: "",
    css: "",
    js: "",
  });

  const [globals, setGlobals] = useState({
    globalCss: "",
    globalJs: "",
  });

  useLiveQuery(async () => {
    const projectData = await await getProjectData();
    const currnetPage = projectData.pages[`${currentPageName}`];

    console.log(
      "Functions : ",
      executeAndExtractFunctions(await currnetPage.js.text())
    );

    setPageStructure({
      html: await currnetPage.html.text(),
      css: await currnetPage.css.text(),
      js: await currnetPage.js.text(),
    });

    setGlobals({
      globalCss: await projectData.globalCss.text(),
      globalJs: await projectData.globalJs.text(),
    });
  });

  const updateLocals = ({ key, value }) => {
    setPageStructure({
      ...pageStructure,
      [key]: value,
    });
  };

  const updateGlobals = ({ key, value }) => {
    setGlobals({
      ...globals,
      [key]: value,
    });
  };

  const updateDB = async () => {
    const projectData = await await getProjectData();
    // infinitelyWorker.postMessage({

    // })
    await db.projects.update(projectId, {
      pages: {
        ...projectData.pages,
        [currentPageName]: {
          ...projectData.pages[currentPageName],
          html: new Blob([pageStructure.html], { type: "text/html" }),
          css: new Blob([pageStructure.css], { type: "text/css" }),
          js: new Blob([pageStructure.js], { type: "text/javascript" }),
        },
      },
      globalCss: new Blob([globals.globalCss], { type: "text/css" }),
      globalJs: new Blob([globals.globalJs], { type: "text/javascript" }),
    });
  };

  return (
    <section className="h-full flex flex-col ">
      <MultiTab
        style={{ height: "92%" }}
        onTabClick={async () => {
          await updateDB();
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
                  value: pageStructure.html,
                  onChange: (value) => {
                    updateLocals({ key: "html", value });
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
                  value: pageStructure.css,
                  onChange: (value) => {
                    updateLocals({ key: "css", value });
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
                extraLibs={pageStructure.js}
                props={{
                  language: "javascript",
                  value: pageStructure.js,
                  onChange: (value) => {
                    updateLocals({ key: "js", value });
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
                  value: globals.globalCss,
                  onChange: (value) => {
                    updateGlobals({ key: "globalCss", value });
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
                extraLibs={globals.globalJs}
                // isTemplateEngine
                // allowCmdsContext
                props={{
                  language: "javascript",
                  value: globals.globalJs,
                  onChange: (value) => {
                    updateGlobals({ key: "globalJs", value });
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
            await updateDB();
            await editor.load();
          }}
        >
          Save
        </Button>
      </footer>
    </section>
  );
};
