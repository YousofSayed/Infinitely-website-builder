import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useRef, useState } from "react";
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
import { Editor } from "@monaco-editor/react";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../helpers/db";
import { current_project_id } from "../../../constants/shared";
import { DetailsNormal } from "../../Protos/DetailsNormal";
import { Loader } from "../../Loader";

export const RestAPIModels = () => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const vsEditorRef = useRef();
  const [restModelsVars , setRestModelsVars] = useRecoilState(restModelsVarsState);
  // const restModels = useRecoilValue(restModelState);
  // const setRestModels = useSetRecoilState(restModelState);
  const restModels = useLiveQuery(async () => {
    return await (
      await db.projects.get(projectId)
    ).restAPIModels;
  });
  const setRestModels = async (newRestModles) => {
    await db.projects.update(projectId, {
      restAPIModels: newRestModles, //[...restModels, newRestModle],
    });
  };
  const vars = useRecoilValue(varsState);
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

  const addModel = () => {
    if (
      !modleData.name ||
      !modleData.url ||
      !modleData.method ||
      !modleData.varName
    ) {
      toast.warn(<ToastMsgInfo msg={`Fill all fields`} />);
      return;
    }
    setRestModels([...restModels, structuredClone(modleData)]);
    setModelData(structuredClone(initModelValue));
  };

  const deleteModel = (index) => {
    const newArr = structuredClone(restModels).filter((md, i) => i != index);
    setRestModels(newArr);
  };

  const fetchResponse = async () => {
    const clone = structuredClone(restModels);
    if (!clone || !clone.length) return;
    clone.forEach(async (model, i) => {
      if (model.response || !model.url || !model.method) return;
      const res = await fetch(model.url, {
        method: model.method,
        headers: Object.keys(model.headers).length ? model.headers : undefined,
        body: Object.keys(model.body).length ? model.body : undefined,
      });

      try {
        const resData = await res.json();
        // if (Array.isArray(resData)) {
        //   toast.error(<ToastMsgInfo msg={"Response Is Not Object"} />);
        //   const newArr = clone.filter((md, nI) => nI != i);
        //   setRestModels(newArr);
        //   return;
        // }
        model.response = JSON.stringify(resData);
        setRestModels(clone);
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
    });
  };

  useEffect(() => {
    if (!editor) return;
    fetchResponse();
  }, [restModels]);

  return (
    <section className="flex flex-col gap-3 h-full max-h-[800px] ">
      <header className="flex flex-col gap-3  w-full p-1 py-2  rounded-lg bg-slate-800">
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
                containerClassName="w-full"
                className="bg-slate-900 focus:border-[transparent!important] w-full px-[unset]"
                onInput={(ev) => {
                  setModelData({ ...modleData, varName: ev.target.value });
                  setRestModelsVars((old)=>({...old , [ev.target.value]:ev.target.value}))
                }}
              />
            </section>
          </section>

          <section className="flex gap-2 h-full">
            <Select
              value={modleData.method}
              // containerClassName="p-1"
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
          </section>
        </section>

        {httpSetterMethods.findIndex(
          (value) => value.toLowerCase() == modleData.method.toLowerCase()
        ) != -1 ? (
          <>
            <section className=" rounded-lg flex flex-col gap-2 ">
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

            <section className=" rounded-lg flex flex-col gap-2 ">
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

      <main
        className={`flex flex-col gap-2 h-[500px] overflow-auto ${
          restModels?.length && "border-t-2 border-t-slate-600 py-3"
        }`}
      >
        {restModels?.map((model, i) => {
          return (
            <section
              key={i}
              className="flex  justify-between gap-2 bg-slate-900 px-1 w-full "
            >
              <DetailsNormal
                label={model.name}
                className="w-[calc(100%-55px)!important]  bg-slate-800 p-2 rounded-lg"
              >
                <section className="mt-3 flex flex-col gap-2 bg-slate-900 p-2 rounded-lg">
                  <p className="text-slate-200 font-semibold bg-slate-800 p-2 rounded-lg">
                    Method : {model.method}
                  </p>
                  <p className="text-slate-200 font-semibold  bg-slate-800 p-2 rounded-lg">
                    Variable Name : {model.varName}
                  </p>
                  <p className="text-slate-200 font-semibold  bg-slate-800 p-2 rounded-lg">
                    URL :{" "}
                    <a
                      className="hover:underline hover:cursor-pointer"
                      target="_blank"
                      href={model.url}
                    >
                      {model.url}
                    </a>
                  </p>
                  <section>
                    <Editor
                      className={`rounded-lg`}
                      width={"100%"}
                      height={"300px"}
                      language="json"
                      defaultLanguage="json"
                      theme="vs-dark"
                      defaultValue={model.response}
                      value={model.response}
                      loading={<Loader width={100} height={100} />}
                      onChange={(value, ev) => {
                        const formattedContent = JSON.stringify(
                          JSON.parse(value),
                          null,
                          2
                        );
                        if (value == formattedContent) return;
                        vsEditorRef.current.setValue(formattedContent);
                      }}
                      onMount={async (vsEditor) => {
                        vsEditorRef.current = vsEditor;
                        const unformattedContent = vsEditor.getValue();
                        if (!unformattedContent) {
                          console.warn(`Unfromatted content yet...`);

                          return;
                        }
                        try {
                          const formattedContent = JSON.stringify(
                            JSON.parse(unformattedContent),
                            null,
                            2
                          );
                          vsEditor.setValue(formattedContent);
                        } catch (error) {
                          editor.runCommand("close:custom:modal");
                          editor.runCommand("open:error:modal", {
                            errMsg: "Invalid JSON",
                            content: error.message,
                          });
                        }
                      }}
                      options={{
                        minimap: {
                          enabled: false,
                          autohide: true,
                        },
                        fontSize: 19,
                        formatOnType: true,
                        formatOnPaste: true,
                        readOnly: true,
                        // value:modal.response ? JSON.parse(model.response) : ''
                      }}
                    />
                  </section>
                </section>
              </DetailsNormal>
              <SmallButton
                title={`Delete ${model.name}`}
                className="group max-h-[50px] bg-slate-800 shadow-[unset] flex-grow-0 flex-shrink-0"
                onClick={() => {
                  deleteModel(i);
                }}
              >
                {Icons.trash("#CBD5E1")}
              </SmallButton>
            </section>
          );
        })}
      </main>
    </section>
  );
};
