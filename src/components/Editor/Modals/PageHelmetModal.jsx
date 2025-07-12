import React, { useCallback, useEffect, useRef, useState } from "react";
import { pageHelmetType } from "../../../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import { getProjectData } from "../../../helpers/functions";
import {
  current_page_helmet,
  current_page_id,
  current_project_id,
} from "../../../constants/shared";
import { NormalTitle } from "../../Protos/NormalTitle";
import { Input } from "../Protos/Input";
import blankImg from "../../../assets/images/blank.jpg";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { Editor } from "@monaco-editor/react";
import { db } from "../../../helpers/db";
import { MiniTitle } from "../Protos/MiniTitle";
import { useEditorMaybe } from "@grapesjs/react";
import { open_pages_manager_modal } from "../../../constants/InfinitelyCommands";
import { CodeEditor } from "../Protos/CodeEditor";
import { Select } from "../Protos/Select";
import { FitTitle } from "../Protos/FitTitle";
import { SmallButton } from "../Protos/SmallButton";
import { infinitelyWorker } from "../../../helpers/infinitelyWorker";
import { projectData } from "../../../helpers/atoms";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot } from "../../../helpers/bridge";
import { random } from "lodash";

export const PageHelmetModal = () => {
  const [helmet, setHelmet] = useState({
    logo: null,
    ...pageHelmetType,
  });
  const [siteLogo, setSiteLogo] = useState(null);
  const currentPageHelmetName = sessionStorage.getItem(current_page_helmet);
  const projectId = +localStorage.getItem(current_project_id);
  const inputFileRef = useRef();
  const editor = useEditorMaybe();
  const inputTimeoutRef = useRef(null);
  // const original = useRef(URL.createObjectURL);
  const logosURLs = useRef([]);
  // URL.createObjectURL = (blob) => {
  //   if (!blob || !(blob instanceof Blob)) {
  //     console.warn("createObjectURL called with non-Blob object:", blob);
  //     return "";
  //   }
  //   const url = original.current(blob);
  //   logosURLs.current.push(url);
  //   return url;
  // };

  useEffect(() => {
    getAndSetHelmetData();
    return () => {
      // Clean up URLs created by createObjectURL
      logosURLs.current.forEach((url) => URL.revokeObjectURL(url));
      logosURLs.current = [];
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
      // URL.createObjectURL = original.current;
    };
  }, []);

  useEffect(() => {
    const setHelmetToDB = async () => {
      const projectData = await getProjectData();
      helmet.logo && (projectData.logo = helmet.logo);
      const currentPageId = localStorage.getItem(current_page_id);
      projectData.pages[`${currentPageHelmetName}`].helmet = {
        ...projectData.pages[`${currentPageHelmetName}`].helmet,
        ...helmet,
        ...(helmet.customMetaTags && typeof helmet.customMetaTags == "string"
          ? {
              customMetaTags: new Blob([helmet.customMetaTags], {
                type: "text/html",
              }),
            }
          : { customMetaTags: "" }),
      };

      const props = {
        data: {
          ...((helmet.logo && { logo: helmet.logo }) || {}),
          pages: projectData.pages,
        },
        projectId: +localStorage.getItem(current_project_id),
        updatePreviewPages: true,
        pageName: currentPageId,
        pageUrl: `pages/${currentPageId}.html`,
        editorData: {
          canvasCss: editor.config.canvasCss,
        },
      };

      infinitelyWorker.postMessage({
        command: "updateDB",
        props,
      });
    };

    setHelmetToDB();
  }, [helmet]);

  const getAndSetHelmetData = async () => {
    const projectData = await getProjectData();
    const helmetFromDB = projectData.pages[`${currentPageHelmetName}`].helmet;
    console.log("Helmet Data: ", helmetFromDB);

    const iconUrl =
      helmetFromDB.icon && helmetFromDB.icon instanceof Blob
        ? URL.createObjectURL(helmetFromDB.icon)
        : projectData.logo
        ? projectData.logo
        : "";
    setSiteLogo(iconUrl);
    // logosURLs.current.push(iconUrl);

    console.log(
      helmet,
      helmetFromDB,
      currentPageHelmetName,
      projectData.pages[`${currentPageHelmetName}`]
    );

    setHelmet({
      ...helmet,
      ...helmetFromDB,
      icon:
        helmetFromDB.icon && helmetFromDB.icon instanceof Blob
          ? helmetFromDB
          : undefined,
      customMetaTags: helmet.customMetaTags
        ? await helmet.customMetaTags.text()
        : undefined,
    });
  };

  /**
   *
   * @param {{key:keyof import('../../../helpers/types').PageHelmet , value:string , isBlob:boolean , mimeType:string , isLogo:boolean}} param0
   */
  const updatePageHelmet = useCallback(
    async ({ key, value, isBlob = false, mimeType, isLogo = false }) => {
      if (isLogo) {
        await opfs.writeFiles([
          {
            path: defineRoot(`logo.png`),
            content: value,
          },
        ]);
        // const url = URL.createObjectURL(value);
        // logosURLs.current.push(url);
        setSiteLogo(String(`logo.png`));
      }

      setHelmet({
        ...helmet,
        logo: `logo.png`,
        [key]: isBlob ? new Blob([value], { type: mimeType }) : value,
        // ...projectData.pages[currentPageHelmetName].helmet,
      });

      // isLogo ? value : null
    },
    [projectId, currentPageHelmetName, helmet]
  );

  return (
    <section className="flex flex-col gap-3 ">
      <header className="flex h-[45px] gap-3 justify-between p-1 rounded-lg bg-slate-800">
        <section className="group p-1 bg-slate-900 text-[14px] font-semibold rounded-lg flex items-center gap-2 text-slate-200">
          <button
            className="flex items-center gap-2 p-1"
            onClick={(ev) => {
              editor.runCommand(open_pages_manager_modal);
            }}
          >
            <i className="rotate-[90deg] block">{Icons.arrow()}</i>
            Pages
          </button>
        </section>

        <FitTitle className="flex items-center gap-2 text-lg font-semibold h-full flex-shrink-0 capitalize">
          {Icons.helmet({ strokeColor: "white", fill: "white" })}
          {currentPageHelmetName}
        </FitTitle>
      </header>

      <section className="flex   gap-2 bg-slate-800 p-2 rounded-lg">
        <FitTitle className="flex  w-[20%!important] items-center justify-center flex-shrink-0 ">
          Site Icon
        </FitTitle>

        <section className="flex w-full justify-between items-center   rounded-lg">
          <figure className="rounded-full w-[39px] h-[39px] overflow-hidden">
            <img
              onClick={() => {
                inputFileRef.current.click();
              }}
              key={siteLogo + random(999, 1000)}
              src={siteLogo ? siteLogo : blankImg}
              className="w-full h-full max-h-full"
            />
          </figure>

          <SmallButton
            title="Upload Site Icon"
            className="text-lg h-full bg-slate-900 font-semibold capitalize"
            onClick={(ev) => {
              inputFileRef.current.click();
            }}
          >
            {Icons.upload({ strokeColor: "white" })}
          </SmallButton>

          <input
            type="file"
            className="hidden bg-slate-900"
            accept="image/*"
            ref={inputFileRef}
            onChange={(ev) => {
              const file = ev.target.files[0];
              updatePageHelmet({
                key: "icon",
                value: file,
                isLogo: true,
              });
            }}
          />
        </section>
      </section>

      <section className="flex  gap-2 bg-slate-800 p-2  rounded-lg">
        <FitTitle className="flex items-center justify-center flex-shrink-0 w-[20%!important]">
          Page Title{" "}
        </FitTitle>
        <Input
          placeholder="Page Title"
          className="bg-slate-900 py-1 w-full"
          value={helmet.title || ""}
          onInput={(ev) => {
            updatePageHelmet({
              key: "title",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className="flex  gap-2 bg-slate-800 p-2 rounded-lg">
        <FitTitle className="capitalize w-[20%!important] flex justify-center items-center flex-shrink-0">
          author
        </FitTitle>
        <Input
          placeholder="Author"
          className="bg-slate-900 py-1 w-full rounded-lg"
          value={helmet.author || ""}
          onInput={(ev) => {
            updatePageHelmet({
              key: "author",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-2 bg-slate-800 p-2 rounded-lg">
        <FitTitle className="capitalize">description</FitTitle>
        <textarea
          placeholder="Description"
          className="bg-slate-900 px-2 py-3 rounded-lg text-white font-semibold outline-none border-2 border-transparent focus:border-blue-600"
          value={helmet.description || ""}
          onInput={(ev) => {
            console.log(ev.target.value);
            updatePageHelmet({
              key: "description",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-2 bg-slate-800 p-2 rounded-lg">
        <FitTitle className="capitalize">keywords</FitTitle>
        <textarea
          placeholder="keywords Ex : keywords , keyword1 , keyword2"
          className="bg-slate-900 px-2 py-3 rounded-lg text-white font-semibold outline-none border-2 border-transparent focus:border-blue-600"
          value={helmet.keywords || ""}
          onInput={(ev) => {
            updatePageHelmet({
              key: "keywords",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className=" flex flex-col gap-2 bg-slate-800 p-2 rounded-lg">
        <FitTitle>Custom Meta Tags</FitTitle>
        <Select
          isCode
          placeholder="Custom meta tags"
          value={helmet.customMetaTags}
          codeProps={{
            // value: helmet.customMetaTags,
            // height:`100%`,
            language: "html",
            onMount(mEditor) {
              mEditor.setValue(helmet.customMetaTags || "");
            },
            onChange: (value) => {
              updatePageHelmet({
                key: "customMetaTags",
                value: value,
                // isBlob: true,
                // mimeType: "text/html",
              });
            },
          }}
        />
        {/* <CodeEditor
          props={{
            value: helmet.customMetaTags,
            height:`100%`,
            language:'html',
            onChange: (value) => {
              updatePageHelmet({
                key: "customMetaTags",
                value: value,
                isBlob: true,
                mimeType: "text/html",
              });
            },
          }}
        /> */}
        {/* <Editor
          theme="vs-dark"
          width={"100%"}
          height={"400px"}
          language="html"
          options={{
            fontSize: 20,
            minimap: {
              autohide: true,
              enabled: false,
            },
          }}
          value={helmet.customMetaTags}
          onChange={(value) => {
            updatePageHelmet({
              key: "customMetaTags",
              value: value,
              isBlob: true,
              mimeType: "text/html",
            });
          }}
        /> */}
      </section>
    </section>
  );
};
