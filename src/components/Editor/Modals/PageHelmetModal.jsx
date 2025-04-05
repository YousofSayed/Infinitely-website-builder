import React, { useRef, useState } from "react";
import { pageHelmetType } from "../../../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import { getProjectData } from "../../../helpers/functions";
import {
  current_page_helmet,
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

export const PageHelmetModal = () => {
  const [helmet, setHelmet] = useState(pageHelmetType);
  const [siteLogo, setSiteLogo] = useState(null);
  const currentPageHelmetName = sessionStorage.getItem(current_page_helmet);
  const projectId = +localStorage.getItem(current_project_id);
  const inputFileRef = useRef();
  const editor = useEditorMaybe();
  useLiveQuery(async () => {
    const projectData = await getProjectData();
    const helmet = projectData.pages[`${currentPageHelmetName}`].helmet;
    setSiteLogo(
      helmet.icon
        ? URL.createObjectURL(helmet.icon)
        : projectData.logo
        ? URL.createObjectURL(projectData.logo)
        : ""
    );
    console.log(
      helmet,
      currentPageHelmetName,
      projectData.pages[`${currentPageHelmetName}`]
    );

    setHelmet({
      ...helmet,
      icon: helmet.icon ? URL.createObjectURL(helmet.icon) : undefined,
      customMetaTags: helmet.customMetaTags
        ? await helmet.customMetaTags.text()
        : undefined,
    });
  });

  /**
   *
   * @param {{key:keyof import('../../../helpers/types').PageHelmet , value:string , isBlob:boolean , mimeType:string , isLogo:boolean}} param0
   */
  const updatePageHelmet = async ({
    key,
    value,
    isBlob = false,
    mimeType,
    isLogo = false,
  }) => {
    const projectData = await await getProjectData();
    await db.projects.update(projectId, {
      logo: isLogo ? value : projectData.logo,
      pages: {
        ...projectData.pages,
        [`${currentPageHelmetName}`]: {
          ...projectData.pages[`${currentPageHelmetName}`],
          helmet: {
            ...projectData.pages[`${currentPageHelmetName}`].helmet,
            [key]: isBlob ? new Blob([value], { type: mimeType }) : value,
          },
        },
      },
    });
  };

  return (
    <section className="flex flex-col gap-3 ">
      <section className="flex items-center gap-[140px] justify-between p-2 rounded-lg bg-slate-950">
        <NormalTitle withBorder className="group">
          <button
            className="flex items-center gap-2"
            onClick={(ev) => {
              editor.runCommand(open_pages_manager_modal);
            }}
          >
            <i className="rotate-[90deg] block">{Icons.arrow()}</i>
            Pages
          </button>
        </NormalTitle>

        <MiniTitle className={"w-[30%] py-3 text-2xl"}>
          {currentPageHelmetName}
        </MiniTitle>
      </section>

      <section className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg">
        <NormalTitle>Page Title </NormalTitle>
        <Input
          placeholder="Page Title"
          className="bg-slate-800 py-3"
          value={helmet.title || ""}
          onInput={(ev) => {
            updatePageHelmet({
              key: "title",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg">
        <NormalTitle>Site Icon</NormalTitle>

        <section className="flex justify-between items-center bg-slate-800 p-1 rounded-lg">
          <figure className="rounded-full w-[50px] h-[50px] overflow-hidden">
            <img
              src={siteLogo ? siteLogo : blankImg}
              className="w-full h-full max-h-full"
            />
          </figure>

          <Button
            className="py-3 px-3 text-lg font-semibold capitalize"
            onClick={(ev) => {
              inputFileRef.current.click();
            }}
          >
            {Icons.upload({ strokeColor: "white" })}
            upload
          </Button>

          <input
            type="file"
            className="hidden"
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

      <section className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg">
        <NormalTitle>author</NormalTitle>
        <Input
          placeholder="Author"
          className="bg-slate-800 py-3 rounded-lg"
          value={helmet.author || ""}
          onInput={(ev) => {
            updatePageHelmet({
              key: "author",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg">
        <NormalTitle>description</NormalTitle>
        <textarea
          placeholder="Description"
          className="bg-slate-800 px-2 py-3 rounded-lg text-white font-semibold outline-none border-2 border-transparent focus:border-blue-600"
          value={helmet.description || ""}
          onInput={(ev) => {
            updatePageHelmet({
              key: "description",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg">
        <NormalTitle>keywords</NormalTitle>
        <textarea
          placeholder="keywords Ex : keywords , keyword1 , keyword2"
          className="bg-slate-800 px-2 py-3 rounded-lg text-white font-semibold outline-none border-2 border-transparent focus:border-blue-600"
          value={helmet.keywords || ""}
          onInput={(ev) => {
            updatePageHelmet({
              key: "keywords",
              value: ev.target.value,
            });
          }}
        />
      </section>

      <section className=" flex flex-col gap-2 bg-slate-950 p-2 rounded-lg">
        <NormalTitle>Custom Meta Tags</NormalTitle>
        <Select isCode placeholder="Custom meta tags" value={helmet.customMetaTags} codeProps={{
            // value: helmet.customMetaTags,
            // height:`100%`,
            language:'html',
            onMount(mEditor){
              mEditor.setValue(helmet.customMetaTags || '')
            },
            onChange: (value) => {
              updatePageHelmet({
                key: "customMetaTags",
                value: value,
                isBlob: true,
                mimeType: "text/html",
              });
            },
          }}/>
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
