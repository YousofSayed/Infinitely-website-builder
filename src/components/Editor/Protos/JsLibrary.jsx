import React, { useEffect, useState } from "react";
import { JSLibraryType } from "../../../helpers/jsDocs";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { db } from "../../../helpers/db";
import { current_page_id, current_project_id } from "../../../constants/shared";
import { useEditorMaybe } from "@grapesjs/react";
import { detectGlobalsSandbox, jsToDataURL } from "../../../helpers/functions";
import { html, uniqueID } from "../../../helpers/cocktail";
import { Input } from "./Input";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot, doGlobalType, getFileSize, hasExportDefault } from "../../../helpers/bridge";
import { Tooltip } from "react-tooltip";
import { fetcherWorker } from "../../../helpers/defineWorkers";
import { reloadRequiredInstance } from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";

//million-ignore
export const JsLibrary = ({
  library = JSLibraryType,
  fileuploader = false,
  afterInstall = ({ key = "", lib = JSLibraryType }) => {},
}) => {
  const editor = useEditorMaybe();
  const [installData, setInstallData] = useState({
    async: false,
    defer: false,
    jsType: "",
    header: false,
    footer: true,
    globalName: "",
  });

  const install = async ({ fileUrl, isHeader = false, isCDN = false }) => {
    try {
      const tId = toast.loading(
        <ToastMsgInfo msg={`Installing ${library.name} library`} />
      );

      const projectId = +localStorage.getItem(current_project_id);
      const projectData = await db.projects.get(+projectId);
      if (
        installData.globalName &&
        [...projectData.jsFooterLibs, ...projectData.jsHeaderLibs].some(
          (lib) => lib.globalName == installData.globalName
        )
      ) {
        toast.dismiss(tId);
        toast.error(<ToastMsgInfo msg={`This global name used before`} />);
        return;
      }
      const response = await fetch(fileUrl);
      const responseStatus = response.status;
      const resBlob = await response.blob();
      const isJs = resBlob.type.includes("javascript");
      const isCss = resBlob.type.includes("css");
      const ext = (isJs && ".js") || (isCss && ".css") || "";
      const nameWithoutExt = library.name;
      const fileName = nameWithoutExt.replaceAll(ext, "") + ext;
      const path = `libs/${
        isCss ? "css" : isJs ? (isHeader ? "js/header" : "js/footer") : null
      }/${fileName}`;

      const responseData = new File([resBlob], `${fileName}`, {
        type: resBlob.type,
      });
      console.log(
        "installing data : ",
        ext,
        isJs,
        isCss,
        response,
        responseData
      );
      console.log("haha file name : ", responseData.name);

      if (responseStatus != 200 || !response.ok) {
        toast.dismiss(tId);
        toast.error(
          <ToastMsgInfo
            msg={`Faild To Fetch ${fileUrl} With Status Code : ${response.status}`}
          />
        );
        throw new Error(
          `Faild To Fetch ${fileUrl} With Status Code : ${response.status}`
        );
      }

      /**
       *
       * @param {keyof import('../../../helpers/types').Project} key
       * @param {import('../../../helpers/types').LibraryConfig} newContent
       */
      const updater = async (key, newContent = {}) => {
        // const realKey = `${libraryType}${key}`;
        console.log("from updater :", newContent);

        await opfs.createFiles([
          {
            path: defineRoot(path),
            content: responseData,
          },
        ]);
        await db.projects.update(+projectId, {
          [key]: [...projectData[key], { ...newContent }],
        });
        // editor.load();
        reloadRequiredInstance.emit(InfinitelyEvents.editor.require, {state:true});
        toast.done(tId);
        toast.success(<ToastMsgInfo msg={`Library Installed Successfully `} />);
        afterInstall({ key: key, lib: newContent });
      };

      installData.globalName = installData.globalName || (await detectGlobalsSandbox(fileUrl))?.[0] || ""
      /**
       * @type {import('../../../helpers/types').LibraryConfig}
       */
      const defaultData = {
        ...installData,
        // globalName: installData.globalName || (await detectGlobalsSandbox(fileUrl))?.[0] || "",
        type: ext.replace(".", ""),
        // file: responseData,
        path,
        fileType: ext.replace(".", ""),
        description: library.description,
        name: fileName,
        isCDN: isCDN,
        isLocal: !isCDN,
        header: isHeader ? "header" : "",
        footer: isHeader ? "" : "footer",
        fileUrl: library.latest,
        version: library.version,
        nameWithoutExt,
        size: getFileSize(responseData).MB,
        // ...(installData.globalName
        //   ? {
        //       typesPath: `types/${nameWithoutExt}`,
        //     }
        //   : {}),
        typesPath: `types/${nameWithoutExt}`,
        id: uniqueID(),
      };

      // console.log("lib type:", libraryType, responseData.type);

      if (isHeader && responseData.type.includes("javascript")) {
        updater("jsHeaderLibs", {
          ...defaultData,
        });
      } else if (!isHeader && responseData.type.includes("javascript")) {
        updater("jsFooterLibs", {
          ...defaultData,
        });
      } else if (responseData.type.includes("css")) {
        updater("cssLibs", {
          ...defaultData,
        });
      }

      // if(installData.globalName){
      fetcherWorker.postMessage({
        command: "installTypes",
        props: {
          projectId,
          libConfig: { ...defaultData },
          code: doGlobalType(nameWithoutExt,  installData.globalName  ),
        },
      });
      // }

      console.log(response);
    } catch (error) {
      console.error(
        `Failed To Install Library ${library.name} With Error : ${error}`
      );
      toast.error(<ToastMsgInfo msg={`Failed To Install Library`} />);
    }
  };

  return (
    <>
      <section className="w-full mb-2">
        <article className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 shadow-md  hover:shadow-lg">
          <section className="w-full flex justify-between  items-center bg-slate-900 p-2 rounded-lg">
            <div className="w-full flex items-start flex-col gap-2 ">
              <h1 className="text-3xl font-bold text-blue-400 capitalize p-2 bg-slate-950 rounded-lg">
                {library.name}
              </h1>
              <p className="text-sm text-slate-400 font-medium ">
                <span className="text-slate-50 font-semibold text-lg">
                  Version
                </span>{" "}
                : {library?.version || "Unknown"}
              </p>
              <hr className="h-[2px] w-[80px] bg-red-300 border-2 border-blue-600" />
              <p className="text-sm text-slate-400 font-medium max-w-[70%]">
                <span className="text-slate-50 font-semibold text-lg">
                  Description
                </span>{" "}
                : {library?.description || "Unknown"}
              </p>
              <hr className="h-[2px] w-[80px] bg-red-300 border-2 border-blue-600" />
              <p className="text-sm text-slate-400 font-medium   max-w-[90%] overflow-hidden text-nowrap text-ellipsis">
                <span className="text-slate-50 font-semibold text-lg">
                  File Url
                </span>{" "}
                :{" "}
                <a href={library?.latest} target="_blank" className="text-clip">
                  {library?.latest || "Unknown"}
                </a>
              </p>

              <hr className="h-[2px] w-[80px] bg-red-300 border-2 border-blue-600" />

              <div className="w-full flex items-center justify-between bg-slate-900 p-2 rounded-lg">
                {(library?.fileType == "js" ||
                  library?.latest?.endsWith("js")) && (
                  <>
                    <fieldset>
                      <legend className="text-lg font-semibold mb-2">
                        Load in:
                      </legend>
                      <div className="flex items-center space-x-6 bg-slate-950 p-2 rounded-lg">
                        <label
                          className="flex items-center space-x-3"
                          htmlFor={`${library.name}-header`}
                        >
                          <Input
                            type="radio"
                            name={`${library.name}-header`}
                            checked={installData.header}
                            value="header"
                            id={`${library.name}-header`}
                            onChange={(ev) => {
                              setInstallData({
                                ...installData,
                                header: ev.target.value,
                                footer: "",
                              });
                            }}
                            className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded-full cursor-pointer"
                          />
                          <span className="text-slate-300">Header</span>
                        </label>

                        <label
                          className="flex items-center space-x-3"
                          htmlFor={`${library.name}-footer`}
                        >
                          <input
                            type="radio"
                            checked={installData.footer}
                            // defaultChecked
                            // defaultValue={'footer'}
                            name={`${library.name}-footer`}
                            value="footer"
                            id={`${library.name}-footer`}
                            onChange={(ev) => {
                              setInstallData({
                                ...installData,
                                footer: ev.target.value,
                                header: "",
                              });
                            }}
                            className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded-full cursor-pointer"
                          />
                          <span className="text-slate-300">Footer</span>
                        </label>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-lg font-semibold mb-2">
                        Attributes:
                      </legend>
                      <div className="flex items-center space-x-6 bg-slate-950 p-2 rounded-lg">
                        <label className="flex items-center space-x-3">
                          <Input
                            type="checkbox"
                            name="defer"
                            onChange={(ev) => {
                              setInstallData({
                                ...installData,
                                defer: ev.target.checked,
                              });
                            }}
                            className="w-5 h-5 text-blue-600 bg-slate-900 border-slate-700  cursor-pointer rounded-lg"
                          />
                          <span className="text-slate-300">Defer</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="async"
                            onChange={(ev) => {
                              setInstallData({
                                ...installData,
                                async: ev.target.checked,
                              });
                            }}
                            className="w-5 h-5 text-blue-600 bg-slate-900 border-slate-700  cursor-pointer rounded-lg"
                          />
                          <span className="text-slate-300">Async</span>
                        </label>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-lg font-semibold mb-2 flex items-center justify-between w-full gap-2">
                        <p>Global name:</p>
                        <i className="cursor-pointer" id="global-name-info">
                          {Icons.info({ width: 15 })}
                        </i>
                      </legend>
                      <div className="flex items-center space-x-6">
                        <Input
                          placeholder="Global name"
                          onInput={(ev) => {
                            setInstallData({
                              ...installData,
                              globalName: ev.target.value,
                            });
                          }}
                        />
                      </div>
                      <Tooltip
                        anchorSelect="#global-name-info"
                        place="top-start"
                        style={{ maxWidth: "200px" }}
                        className="font-semibold"
                      >
                        Global name used for easy code with types like :
                        globalName.method() or globalName.name
                      </Tooltip>
                    </fieldset>
                    {/* 
                    <fieldset className="flex flex-col gap-2">
                      <h1>Type</h1>
                      <Input
                        className="bg-slate-950"
                        placeholder="JS Type"
                        onInput={(ev) => {
                          setInstallData({
                            ...installData,
                            jsType: ev.target.value,
                          });
                        }}
                      />
                    </fieldset> */}
                  </>
                )}
              </div>
              <div className="flex items-start justify-end bg-slate-950 w-full h-full gap-2 p-2 rounded-lg mt-3 ">
                <>
                  {" "}
                  <Button
                    className="bg-blue-600 text-slate-200 px-5 py-2 rounded-lg hover:bg-blue-700 transition flex-shrink-0 flex-grow-0"
                    onClick={() => {
                      install({
                        fileUrl: library.latest,
                        isCDN: false,
                        isHeader: installData.header ? true : false,
                      });
                    }}
                  >
                    {Icons.export("white", undefined)}
                    Install
                  </Button>
                  {!fileuploader && (
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg transition hover:bg-blue-700 flex-shrink-0 flex-grow-0"
                      onClick={() => {
                        install({
                          fileUrl: library.latest,
                          isCDN: true,
                          isHeader: installData.header ? true : false,
                        });
                      }}
                    >
                      {Icons.installAsCDN({ arrowStrokeColor: "#2563eb" })}
                      Add as CDN
                    </Button>
                  )}
                </>
              </div>
            </div>
          </section>
        </article>
      </section>
      {/* <hr className="h-[2px] w-full my-3 bg-red-300 border-2 border-blue-600"/> */}
    </>
  );
};
