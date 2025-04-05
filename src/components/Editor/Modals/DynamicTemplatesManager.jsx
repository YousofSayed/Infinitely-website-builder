import { useEditorMaybe } from "@grapesjs/react";
import React, { useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentDynamicTemplateIdState,
  dynamicTemplatesState,
} from "../../../helpers/atoms";
import { Icons } from "../../Icons/Icons";
import { Input } from "../Protos/Input";
import { Li } from "../../Protos/Li";
import { dynamic_container } from "../../../constants/cmpsTypes";
import noDataImage from "../../../assets/images/no-data.svg";
import { useLiveQuery } from "dexie-react-hooks";
import {
  advancedSearchSuggestions,
  doDocument,
  downloadFile,
  getProjectData,
  regenerateSymbol,
  replaceBlobs,
  restoreBlobs,
} from "../../../helpers/functions";
import { dynamicTemplatesType } from "../../../helpers/jsDocs";
import { select_page } from "../../../constants/InfinitelyCommands";
import {
  current_dynamic_template_id,
  current_project_id,
  data_disable_scripting,
} from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../../Protos/VirtusoGridComponent";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { Button } from "../../Protos/Button";
import { parseHTML } from "linkedom";

export const DynamicTemplatesManager = () => {
  const editor = useEditorMaybe();
  const fileInput = useRef();
  const searchTimeout = useRef();
  const allDynamicTemplates = useRef(dynamicTemplatesType);
  // const dynamicsTemplates = useRecoilValue(dynamicTemplatesState);
  // const setDynamicsTemplatesForDB = useSetRecoilState(dynamicTemplatesState);
  const projectId = +localStorage.getItem(current_project_id);
  const [dynamicsTemplates, setDynamicsTemplates] =
    useState(dynamicTemplatesType);
  useLiveQuery(async () => {
    const projectData = await getProjectData();
    // Object.keys(projectData.dynamicTemplates).forEach((key) => {
    //   console.log(projectData.dynamicTemplates[key].imgSrc);

    //   if (!projectData.dynamicTemplates[key].imgSrc) return;
    //   // projectData.dynamicTemplates[key].imgSrc = URL.createObjectURL(
    //   //   projectData.dynamicTemplates[key].imgSrc
    //   // );
    // });
    // allDynamicTemplates.current = projectData.dynamicTemplates;
    setDynamicsTemplates(projectData.dynamicTemplates);
    return projectData.dynamicTemplates;
  });

  const setDynamicsTemplatesForDB = async (
    newDynamicTemplates = dynamicTemplatesType
  ) => {
    const projectData = await getProjectData();
    await db.projects.update(projectId, {
      dynamicTemplates: newDynamicTemplates,
    });
  };
  const setDynamicTemplateId = useSetRecoilState(currentDynamicTemplateIdState);

  const search = async (value = "") => {
    searchTimeout.current && clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {}, 120);

    const projectData = await getProjectData();
    if (!value) return setDynamicsTemplates(projectData.dynamicTemplates);
    const keys = advancedSearchSuggestions(
      Object.keys(projectData.dynamicTemplates),
      value
    );
    const newTemplates = {};
    for (const key of keys) {
      newTemplates[key] = projectData.dynamicTemplates?.[key];
    }

    setDynamicsTemplates(newTemplates);
  };

  const deleteDynamicTemplate = (key = "", deleteAll = false) => {
    if (deleteAll) return setDynamicsTemplatesForDB({});
    const clone = structuredClone(dynamicsTemplates);
    delete clone[key];
    setDynamicsTemplatesForDB(clone);
  };

  const navigateAndEditeTemplate = async (key = "") => {
    // setDynamicTemplateId(new String(key));
    // editor.Pages.select(null);
    // editor.Pages.select("playground");
    console.log(
      "D data : ",
      dynamicsTemplates[key].cmpElId,
      dynamicsTemplates[key].cmpChilds,
      await dynamicsTemplates[key].allRules.text()
    );
    const projectData = await getProjectData();

    const dynamicTemplateWithpreventCmdsExcutes = async () => {
      const { document } = parseHTML(
        doDocument(await dynamicsTemplates[key].cmp.text())
      );
      document.querySelectorAll("*").forEach((el) => {
        el.setAttribute(data_disable_scripting, "true");
      });

      return new Blob([document.body.innerHTML], { type: "text/html" });
    };

    await db.projects.update(projectId, {
      pages: {
        ...projectData.pages,
        [`playground`]: {
          ...projectData.pages[`playground`],
          css: dynamicsTemplates[key].allRules,
          html: await dynamicTemplateWithpreventCmdsExcutes(),
        },
      },
    });

    sessionStorage.setItem(current_dynamic_template_id, key);
    editor.runCommand(select_page, { pageId: "playground" });

    const afetLoad = () => {
      // editor.setComponents({
      //   type: dynamic_container,
      //   attributes: {
      //     ...dynamicsTemplates[key].oldAttributes,
      //     id: dynamicsTemplates[key].cmpElId,
      //   },
      //   components: `
      //   ${dynamicsTemplates[key].cmpChilds}

      //   `,
      // });

      // editor.setStyle(dynamicsTemplates[key].allRules);
      // //   <style id="dynamic-style-${dynamicsTemplates[key].id}">
      // //   ${dynamicsTemplates[key].allRules}
      // // </style>
      // editor.selectAdd(editor.getComponents().at(0));
      editor.refresh({ tools: true });
      // editor.Canvas.refresh({ all: true, spots: true });
      // editor.Canvas.refreshSpots({ all: true, spots: true });
      editor.off("canvas:frame:load:body", afetLoad);
    };

    editor.on("canvas:frame:load:body", afetLoad);

    editor.runCommand("close:custom:modal");
  };

  const exportDTemplate = async (templateName, exportAll = false) => {
    try {
      const dTemplate = dynamicsTemplates[templateName];
      // dTemplate.name = templateName;
      downloadFile({
        filename: `${exportAll ? "templates" : templateName}.json`,
        mimeType: "application/json",
        content: JSON.stringify(
          await replaceBlobs(
            exportAll ? dynamicsTemplates : { [templateName]: dTemplate }
          )
        ),
      });
      toast.success(
        <ToastMsgInfo
          msg={`${
            exportAll ? "Templates" : "Template"
          } Downloaded Successfully`}
        />
      );
    } catch (error) {
      console.error(`Dynamic Templates Manager : ${error}`);
      toast.error(
        <ToastMsgInfo
          msg={`Faild To Download ${exportAll ? "Templates" : "Template"}`}
        />
      );
    }
  };

  /**
   *
   * @param {File[]} files
   */
  const uploadTemplates = async (files) => {
    let templates = {};

    for (const file of [...files]) {
      templates = {
        ...templates,
        ...(await restoreBlobs(JSON.parse(await file.text()))),
      };
    }
    const projectData = await getProjectData();
    // console.log("templates : ", templates, dynamicsTemplates);

    setDynamicsTemplatesForDB({
      ...projectData.dynamicTemplates,
      ...templates,
    });
  };

  return (
    <main className="flex flex-col gap-2 ">
      <header className="w-full p-2 rounded-lg bg-slate-800 flex gap-2 items-center">
        <Input
          placeholder="Search..."
          onInput={(ev) => {
            search(ev.target.value);
          }}
          className="bg-slate-900 w-full"
        />

        <Button
          onClick={(ev) => {
            deleteDynamicTemplate("", true);
          }}
        >
          {Icons.trash("white")}
          Delete All
        </Button>

        <Button
          onClick={(ev) => {
            fileInput.current.click();
          }}
        >
          {Icons.upload({ strokeColor: "white" })}
          Upload
        </Button>

        <Button
          onClick={() => {
            exportDTemplate("", true);
          }}
        >
          {Icons.export("white")}
          Download All
        </Button>
        <input
          type="file"
          hidden
          multiple
          ref={fileInput}
          onChange={(ev) => {
            uploadTemplates(ev.target.files);
          }}
          accept=".json"
        />
      </header>

      {dynamicsTemplates && Object.keys(dynamicsTemplates).length ? (
        <section className="w-full h-[400px]  min-h-[400px]">
          <VirtuosoGrid
            className="p-0 w-full h-full"
            totalCount={Number(Object.keys(dynamicsTemplates)?.length)}
            components={GridComponents}
            style={{
              width: "100%",
              height: "100%",
            }}
            itemContent={(i) => {
              const dm = Object.keys(dynamicsTemplates)[i];

              return (
                <section
                  key={i}
                  className="p-2 bg-slate-800 rounded-lg h-fit flex  justify-between gap-4 "
                >
                  <section className="flex gap-2 items-center w-full">
                    <figure className="w-full bg-slate-900 p-2 flex items-center gap-3 justify-start rounded-lg">
                      <i
                        dangerouslySetInnerHTML={{
                          __html: dynamicsTemplates[dm].imgSrc,
                        }}
                      ></i>
                      {/* <img
                  className="max-w-[100%] max-h-[100%]"
                  src={dynamicsTemplates[dm].imgSrc}
                /> */}
                      <p className="text-slate-200 font-semibold capitalize overflow-hidden text-ellipsis text-nowrap first-letter:text-blue-400 first-letter:font-bold">
                        {dm}
                      </p>
                    </figure>
                  </section>
                  <ul className="w-full flex gap-2 items-end justify-end self-stretch">
                    <Li
                      className="bg-slate-900"
                      title="Edite Dynamic Template"
                      onClick={() => {
                        navigateAndEditeTemplate(dm);
                      }}
                    >
                      {Icons.edite({ width: 25, fill: "#e2e8f0" })}
                    </Li>
                    <Li
                      className="bg-slate-900"
                      title="Delete Dynamic Template"
                      onClick={() => {
                        deleteDynamicTemplate(dm);
                      }}
                    >
                      {Icons.trash("#e2e8f0")}
                    </Li>
                    <Li
                      className="bg-slate-900"
                      onClick={() => {
                        exportDTemplate(dm);
                      }}
                    >
                      {Icons.export("white")}
                    </Li>
                  </ul>
                </section>
              );
            }}
          />
        </section>
      ) : (
        <figure className="flex items-center flex-col gap-2 py-10 self-center">
          <img
            src={noDataImage}
            className="max-w-[250px]"
            alt="no dynamic templates created yet"
          />
          <figcaption className="text-slate-200 font-semibold capitalize">
            no dynamic templates created yet
          </figcaption>
        </figure>
      )}
    </main>
  );
};
