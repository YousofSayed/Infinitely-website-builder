import { useEditorMaybe } from "@grapesjs/react";
import React, { memo, useEffect, useRef, useState } from "react";
import { Input } from "../Protos/Input";
import { Select } from "../Protos/Select";
import {
  httpGetterMethods,
  httpSetterMethods,
} from "../../../constants/hsValues";
import { Icons } from "../../Icons/Icons";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { restModelsVarsState, varsState } from "../../../helpers/atoms";
import { Button } from "../../Protos/Button";
import { ObjectInput } from "../Protos/Commands/ObjectInput";
import { MiniTitle } from "../Protos/MiniTitle";
import { SmallButton } from "../Protos/SmallButton";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../helpers/db";
import { current_project_id } from "../../../constants/shared";
import { downloadFile, getProjectData } from "../../../helpers/functions";
import { addClickClass, parse, stringify } from "../../../helpers/cocktail";
import { FitTitle } from "../Protos/FitTitle";
import { isPlainObject } from "lodash";
import { CodeEditor } from "../Protos/CodeEditor";
import { useAutoAnimate } from "@formkit/auto-animate/react";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
// import json from "react-syntax-highlighter/dist/esm/languages/prism/json";

// setTimeout(() => {
//   SyntaxHighlighter.registerLanguage("json", json);
// }, 10);

export const RestAPIModels = memo(() => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const fileUploader = useRef();
  const [restModelsVars, setRestModelsVars] =
    useRecoilState(restModelsVarsState);
  const [currentViewModel, setCurrentViewModel] = useState({
    show: false,
    index: 0,
    model: {
      name: "",
      method: "",
      url: "",
      headers: {},
      body: {},
      response: "",
      varName: "",
    },
  });
  const [startFetch, setStartFetch] = useState(false);

  const restModels = useLiveQuery(async () => {
    const projectData = await getProjectData();
    const restModels = projectData.restAPIModels;
    console.log("dodod");
    setStartFetch(true);
    return restModels.filter(Boolean);
  });

  const setRestModels = async (newRestModels) => {
    await db.projects.update(projectId, {
      restAPIModels: newRestModels, //[...restModels, newRestModle],
    });
    // await fetchResponse(newRestModels);
  };

  const [vars, setVars] = useRecoilState(varsState);
  const [animatRef] = useAutoAnimate();
  const [animatContentRef] = useAutoAnimate();
  const initModelValue = {
    name: "",
    method: "",
    url: "",
    headers: {},
    body: {},
    respones: "",
    varName: "",
  };
  // const [methodsKeys , setMethodsKeys] = useState([...httpGetterMethods, ...httpSetterMethods])
  const [modleData, setModelData] = useState(structuredClone(initModelValue));

  const addModel = async() => {
    if (
      !modleData.name ||
      !modleData.url ||
      !modleData.method ||
      !modleData.varName
    ) {
      toast.warn(<ToastMsgInfo msg={`Fill all fields`} />);
      return;
    }
    // setRestModels([...restModels, structuredClone(modleData)]);
    await fetchResponse([...restModels, structuredClone(modleData)]);
    setModelData(structuredClone(initModelValue));
  };

  const deleteModel = (index) => {
    const newArr = structuredClone(restModels).filter((md, i) => i != index);
    console.log("new mmodels : ", newArr);

    setRestModels(newArr);
  };

  const fetchResponse = async (newRestModels) => {
    if (!navigator.onLine) {
      toast.warn(<ToastMsgInfo msg={`You are offline!`} />);
      return;
    }
    const clone = structuredClone(newRestModels || restModels);
    if (!clone || !clone.length) return;
    let isAnythingChanged = false;
    const newArr = await Promise.all(
      clone.map(async (model, i) => {
        if (model.response || !model.url || !model.method) return model;
        const res = await fetch(model.url, {
          method: model.method,
          headers: Object.keys(model.headers || {}).length
            ? model.headers
            : undefined,
          body: Object.keys(model.body || {}).length ? model.body : undefined,
        });

        try {
          const resData = await res.json();
          console.log("ress : ", resData);
          // if (Array.isArray(resData)) {
          //   toast.error(<ToastMsgInfo msg={"Response Is Not Object"} />);
          //   const newArr = clone.filter((md, nI) => nI != i);
          //   setRestModels(newArr);
          //   return;
          // }
          model.response = JSON.stringify(resData);
          isAnythingChanged = true;
        } catch (error) {
          toast.error(
            <ToastMsgInfo
              msg={"Error Fetch Response "}
              onClick={(ev) => {
                editor.runCommand("close:custom:modal");
                editor.runCommand("open:error:modal", {
                  errMsg: "Error Fetch Response ",
                  content: error.message,
                });
              }}
            />
          );
        }
        return model;
      })
    );

    isAnythingChanged && (await setRestModels(newArr));
    !isAnythingChanged &&
      restModels.length != newRestModels &&
      (await setRestModels(newArr));
  };

  const uploadModel = async (ev) => {
    /**
     * @type {File}
     */
    const file = ev.target.files[0];
    if (!file) return;
    const fileAsText = await file.text();
    /**
     * @type {import('../../../helpers/types').RestAPIModel}
     */
    const fileAsJson = JSON.parse(fileAsText);
    console.log("file as json : ", fileAsJson);

    if (fileAsJson.type != "rest-model") {
      toast.error(<ToastMsgInfo msg={`Invalid Rest API Model`} />);
      ev.target.value = "";
      return;
    }

    console.log("file as json : ", fileAsJson);

    await fetchResponse([
      ...restModels,
      {
        ...fileAsJson,
        response: isPlainObject(fileAsJson.response)
          ? stringify(fileAsJson.response)
          : fileAsJson.response,
      },
    ]);

    ev.target.value = "";
    // setRestModels([
    //   ...restModels,
    //   {
    //     ...fileAsJson,
    //     response: isPlainObject(fileAsJson.response)
    //       ? stringify(fileAsJson.response)
    //       : fileAsJson.response,
    //   },
    // ]);
  };

  useEffect(() => {
    if (!editor) return;
    if (!startFetch) return;
    fetchResponse();
    console.log("render");
  }, [editor, startFetch]);

  return (
    <section
      className="flex flex-col gap-3 h-full max-h-[800px] will-change-contents"
      ref={animatRef}
    >
      {!currentViewModel.show && (
        <header className="flex flex-col gap-3  w-full bg-slate-800 p-2  rounded-lg ">
          <section className="flex flex-col gap-2 w-full">
            <section className="flex gap-2">
              <section className="flex items-center gap-2 w-full bg-slate-900 border-[2px] border-slate-600 rounded-lg">
                <figure className="h-full border-r-2 border-r-slate-600 flex justify-center items-center px-2">
                  {Icons.model({ strokWidth: 4 })}
                </figure>
                <Input
                  value={modleData.name}
                  placeholder="Model Name"
                  className="bg-slate-900 border-[2px] w-full border-slate-600 focus:border-[transparent!important]"
                  onInput={(ev) => {
                    setModelData({ ...modleData, name: ev.target.value });
                  }}
                />
              </section>

              <section className="flex items-center gap-2 w-full  bg-slate-900 border-[2px] border-slate-600 rounded-lg ">
                <figure className="h-full border-r-2 border-r-slate-600 flex justify-center items-center px-2">
                  {Icons.link({ strokWidth: 2 })}
                </figure>
                <Input
                  value={modleData.url}
                  placeholder="URL"
                  className="bg-slate-900 w-full focus:border-[transparent!important]"
                  onInput={(ev) => {
                    setModelData({ ...modleData, url: ev.target.value });
                  }}
                />
              </section>

              <section className="flex items-center gap-2 w-full   bg-slate-900 border-[2px] border-slate-600 rounded-lg ">
                <figure className="h-full border-r-2 border-r-slate-600 flex justify-center items-center px-2">
                  {Icons.command("#CBD5E1", 2)}
                </figure>
                <Input
                  value={modleData.varName}
                  keywords={[...vars]}
                  placeholder="Variable name"
                  // containerClassName="w-full"
                  className="bg-slate-900 focus:border-[transparent!important] w-full px-[unset]"
                  onInput={(ev) => {
                    setModelData({ ...modleData, varName: ev.target.value });
                    setRestModelsVars((old) => ({
                      ...old,
                      [ev.target.value]: ev.target.value,
                    }));
                  }}
                />
              </section>
            </section>

            <section className="flex gap-2 h-full">
              <Select
                value={modleData.method}
                className="bg-slate-900 border-2  border-slate-600 px-[unset] py-[unset]"
                placeholder="Method"
                keywords={[...httpGetterMethods, ...httpSetterMethods]}
                onAll={(value) => {
                  setModelData({ ...modleData, method: value });
                }}
              />
              <Button
                title="create model"
                onClick={(ev) => {
                  addModel();
                }}
              >
                Create
              </Button>

              <Button
                onClick={() => {
                  fileUploader.current.click();
                }}
              >
                Upload
              </Button>
              <input
                type="file"
                accept=".json"
                hidden
                ref={fileUploader}
                onChange={uploadModel}
              />
            </section>
          </section>

          {httpSetterMethods.findIndex(
            (value) => value.toLowerCase() == modleData.method.toLowerCase()
          ) != -1 ? (
            <>
              <section className=" rounded-lg flex flex-col gap-2 bg-slate-800 p-2 ">
                <MiniTitle>Headers</MiniTitle>
                <ObjectInput
                  obj={modleData.headers}
                  isRelative={true}
                  onAddClick={(ev, key, value) => {
                    setModelData((old) => ({
                      ...old,
                      headers: { ...old.headers, [key]: value },
                    }));
                  }}
                  onDelete={(ev, key, value) => {
                    const clone = structuredClone(modleData);
                    delete clone.headers[key];
                    setModelData(clone);
                  }}
                />
              </section>

              <section className=" rounded-lg flex flex-col gap-2 bg-slate-800 p-2">
                <MiniTitle>Body</MiniTitle>
                <ObjectInput
                  obj={modleData.body}
                  isRelative={true}
                  onAddClick={(ev, key, value) => {
                    setModelData((old) => ({
                      ...old,
                      body: { ...old.body, [key]: value },
                    }));
                  }}
                  onDelete={(ev, key, value) => {
                    const clone = structuredClone(modleData);
                    delete clone.body[key];
                    setModelData(clone);
                  }}
                />
              </section>
            </>
          ) : null}
        </header>
      )}

      <main
        ref={animatContentRef}
        className={`flex flex-col gap-2 w-full h-full overflow-auto will-change-contents ${
          restModels?.length && ""
        }`}
      >
        {!!restModels?.length && !currentViewModel.show && (
          <>
            <MiniTitle>Rest API Models</MiniTitle>
            {restModels?.map((model, i) => {
              return (
                <h1
                  key={i}
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");
                    setCurrentViewModel({ show: true, model, index: i });
                  }}
                  className="cursor-pointer p-2 [&:hover_path]:stroke-white bg-slate-800 rounded-lg text-slate-200 font-semibold capitalize flex items-center justify-between"
                >
                  <span>{model.name}</span>
                  <span className="rotate-[-90deg] [&_path]:hover:stroke-white ">
                    {Icons.arrow()}
                  </span>
                </h1>
              );
            })}
          </>
        )}

        {currentViewModel.show && currentViewModel.model && (
          <section className="flex flex-col gap-2 bg-slate-900 rounded-lg w-full h-full overflow-hidden will-change-[height,width]">
            <header className="flex justify-between gap-3 py-1">
              <section className=" flex items-center gap-2 bg-slate-800 rounded-lg">
                <span
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");
                    setCurrentViewModel({ show: false, model: null });
                  }}
                  className="rotate-90 [&_path]:hover:stroke-white cursor-pointer"
                >
                  {Icons.arrow()}
                </span>
                <FitTitle className="h-full">
                  {currentViewModel.model.name}
                </FitTitle>
              </section>

              <MiniTitle>Rest Model Details</MiniTitle>

              <section className="flex gap-3 items-center bg-slate-800 rounded-lg">
                <SmallButton
                  onClick={() => {
                    deleteModel(currentViewModel.index);
                    setCurrentViewModel({
                      show: false,
                      model: null,
                      index: null,
                    });
                  }}
                  className="h-[30px] w-[30px!important] [&:hover_path]:stroke-white hover:bg-[crimson]"
                  title="delete"
                >
                  {Icons.trash(undefined, undefined, 19, 19)}
                </SmallButton>
                <SmallButton
                  onClick={() => {
                    downloadFile({
                      filename: `RModlel-${currentViewModel.model.name}.json`,
                      content: `${stringify(
                        {
                          ...currentViewModel.model,
                          response: parse(currentViewModel.model.response),
                          type: "rest-model",
                        },
                        2
                      )}`,
                      mimeType: "application/json",
                    });
                  }}
                  className="h-[30px] w-[30px!important] [&:hover_path]:stroke-white "
                  title="export"
                >
                  {Icons.export(undefined, undefined, 19, 19)}
                </SmallButton>
              </section>
            </header>
            <section className="flex gap-2 items-center text-slate-200 font-semibold bg-slate-800 p-2 rounded-lg">
              <FitTitle>Method</FitTitle> {currentViewModel.model.method}
            </section>
            <section className="flex gap-2 items-center text-slate-200 font-semibold  bg-slate-800 p-2 rounded-lg">
              <FitTitle>Variable Name</FitTitle>{" "}
              {currentViewModel.model.varName}
            </section>
            <section className="flex gap-2 items-center text-slate-200 font-semibold  bg-slate-800 p-2 rounded-lg">
              <FitTitle>URL</FitTitle>{" "}
              <a
                className="hover:underline hover:cursor-pointer"
                target="_blank"
                href={currentViewModel.model.url}
              >
                {currentViewModel.model.url}
              </a>
            </section>
            <section className="w-full h-full max-w-full overflow-hidden">
              {/* <SyntaxHighlighter
                customStyle={{
                  height: `100%`,
                  minWidth: "100%",
                  width: "100%",
                  borderRadius: ".5rem",
                  // overflow:''
                  // display:'none',
                }}
                // CodeTag={"code"}
                // PreTag={"pre"}
                useInlineStyles
                wrapLines
                wrapLongLines
                language="json"
                style={vscDarkPlus}
              >
                {stringify(
                  isPlainObject(currentViewModel.model.response)
                    ? currentViewModel.model.response
                    : parse(currentViewModel.model.response),
                  2
                ) || ""}
              </SyntaxHighlighter> */}

              <CodeEditor
                props={{
                  height: "100%",
                  width: "100%",
                  value:
                    stringify(
                      isPlainObject(currentViewModel.model.response)
                        ? currentViewModel.model.response
                        : parse(currentViewModel.model.response) || "",
                      2
                    ) || "",
                  language: "json",
                  // theme:''
                  options: {
                    readOnly: true,
                    domReadOnly: true,
                  },
                }}
              />
            </section>
          </section>
        )}
      </main>
    </section>
  );
});
