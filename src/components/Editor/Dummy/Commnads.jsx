import React, { useEffect, useRef, useState } from "react";
import { Select } from "./Protos/Select";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { Adder } from "./Protos/Adder";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  cmdsBuildState,
  cmdsContextState,
  currentElState,
  dynamicTemplatesState,
  restModelsVarsState,
  varsState,
} from "../../helpers/atoms";
import { ObjectInput } from "./Protos/Commands/ObjectInput";
import { MiniTitle } from "./Protos/MiniTitle";
import { Input } from "./Protos/Input";
import { ArrayInput } from "./Protos/Commands/ArrayInput";

import {
  addClickClass,
  copyToClipboard,
  getDifferences,
  html,
  pushBetween,
  transformToNumInput,
  uniqueID,
} from "../../helpers/cocktail";
import {
  buildDynamicTemplate,
  buildScriptFromCmds,
  evalObject,
  executeAndExtractFunctions,
  getProjectData,
  objectToString,
} from "../../helpers/functions";
import { hsCmds } from "../../constants/hsCmds";
import { useEditorMaybe } from "@grapesjs/react";
import { cmdType, dynamicTemplatesType, refType } from "../../helpers/jsDocs";
import { OptionsButton } from "../Protos/OptionsButton";
import { hsZoo } from "../../constants/hsValues";
import { useCmdsContext } from "../../hooks/useCmdsContext";
import { SmallMonacoEditor } from "./Protos/Commands/SmallMonacoEditor";
import { Editor } from "@monaco-editor/react";
import { Loader } from "../Loader";
import { useLiveQuery } from "dexie-react-hooks";
import {
  current_dynamic_template_id,
  current_page_id,
  current_project_id,
  inf_cmds_id,
} from "../../constants/shared";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";

export const Commands = () => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const pageName = localStorage.getItem(current_page_id) || "";
  const dynamicTemplateId = sessionStorage.getItem(current_dynamic_template_id);
  const selectedEl = useRecoilValue(currentElState);
  const [command, setCommand] = useState("");
  // const cmds = useRecoilValue(cmdsBuildState);
  const [cmdKeys, setCmdsKeys] = useState(Object.keys(hsCmds));
  const [cmdsContext, setCmdsContext] = useCmdsContext();
  // const cmdsContext = useRecoilValue(cmdsContextState)
  const [functionNames, setFunctionNames] = useState([]);
  const [vars, setVars] = useState([]);
  const [restModelsVars, setRestModelsVars] =
    useRecoilState(restModelsVarsState);
  const [cmds, setCmds] = useState(cmdType);
  const adderRef = useRef(refType);
  const [cmdsAdded, setCmdsAdded] = useState(cmdType);
  const [dynamicTemplates, setDynamicTemplates] =
    useState(dynamicTemplatesType);
  const oldCmds = useRef(cmdType);
  /**
   * @type {{current:import('@monaco-editor/react').EditorProps}}
   */
  const codeEditorRef = useRef();

  useEffect(() => {
    if (!editor || !selectedEl || !selectedEl.currentEl) {
      setCmds([]);
      return;
    }
    getCmdsFromDB();
  }, [selectedEl]);

  useEffect(() => {
    if (!editor || !editor.getSelected()) return;

    const clone = structuredClone(cmds);
    clone.forEach((cmd) => {
      // cmd.params =  cmd.params.map(param=>structuredClone(param));
      delete cmd.desc;
      delete cmd.ex;
      cmd.params.forEach((param) => {
        delete param.keywords;
      });
    });

    const script = buildScriptFromCmds(clone);
    console.log("script hs : ", script);
    console.log("cmds  : ", clone);
    // console.log("json cmds  : ", JSON.stringify(clone));

    setCmdsToDB(clone);
    editor.getSelected().addAttributes({
      // "inf-cmds": JSON.stringify(clone),
      _: buildScriptFromCmds(clone),
    });
    editor.trigger("component:cmds:update");
  }, [cmds]);

  useEffect(() => {
    scrollToLastElAdded();
    console.log(cmds.length, cmdsAdded.length);
  }, [cmdsAdded]);

  useEffect(() => {
    const params = [];
    cmdsContext.params.forEach((param) => {
      param.forEach((p) => {
        params.push(p);
      });
    });

    setVars([...Object.keys(cmdsContext.vars), ...new Set(params)]);
    console.log("vars : ", Object.keys(cmdsContext.vars), cmdsContext.vars);
  }, [cmdsContext]);

  useLiveQuery(async () => {
    const projectData = await await getProjectData();
    const currentPageName = localStorage.getItem(current_page_id);
    const localScriptFns = executeAndExtractFunctions(
      await projectData.pages[`${currentPageName}`].js.text()
    );
    const globalScriptFns = executeAndExtractFunctions(
      await projectData.globalJs.text()
    );
    setDynamicTemplates(projectData.dynamicTemplates);
    setFunctionNames([...localScriptFns, ...globalScriptFns]);
    setRestModelsVars(projectData.restAPIModels.map((model) => model.varName));
  });

  const scrollToLastElAdded = () => {
    const difId = getDifferences(
      oldCmds.current.map((oldCmd) => oldCmd.id),
      cmds.map((cmd) => cmd.id)
    );

    if (!difId || !difId.length) return;
    const newEl = document.querySelector(`#${difId[0]}`);
    newEl &&
      newEl.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "end",
      });
  };

  const getCmdsFromDB = async () => {
    const projectData = await getProjectData();
    const cmdsId = editor.getSelected().getAttributes()[inf_cmds_id];
    const cmdsFromDB =
      projectData[dynamicTemplateId ? "dynamicTemplates" : "pages"][
        `${dynamicTemplateId ? dynamicTemplateId : pageName}`
      ].cmds[cmdsId];

    // selectedEl.currentEl.getAttribute("inf-cmds");
    console.log("cmmds : ", cmdsFromDB);

    cmdsFromDB?.forEach?.((cmd) => {
      // cmd.params =  cmd.params.map(param=>structuredClone(param));
      const originalCmd = hsCmds[cmd.name];
      cmd.desc = originalCmd.desc;
      cmd.ex = originalCmd.ex;

      cmd.params.forEach((param, i) => {
        param.keywords = originalCmd.params[i].keywords;
      });
    });
    cmdsFromDB ? setCmds(cmdsFromDB) : setCmds([]);
  };

  const setCmdsToDB = async (newCmds = cmdType) => {
    const projectData = await getProjectData();
    const sle = editor.getSelected();
    const uuid = uniqueID();
    !sle.getAttributes()[inf_cmds_id] &&
      sle.addAttributes({ [inf_cmds_id]: uuid });
    const cmdsId = sle.getAttributes()[inf_cmds_id];
    // console.log(evalObject(`${cmds}`), JSON.stringify(clone));
    console.log("I should work fine !", newCmds);

    const pageOrDynamicTemplateProp = dynamicTemplateId
      ? "dynamicTemplates"
      : "pages";
    const propId = dynamicTemplateId ? dynamicTemplateId : pageName;

    infinitelyWorker.postMessage({
      command: "updateDB",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        data: {
          [pageOrDynamicTemplateProp]: {
            ...projectData[pageOrDynamicTemplateProp],
            [propId]: {
              ...projectData[pageOrDynamicTemplateProp][propId],
              cmds: {
                ...projectData[pageOrDynamicTemplateProp][propId].cmds,
                [cmdsId]: newCmds,
              },
            },
          },
        },
      },
    });
  };

  const copyCmds = () => {
    const cmdsAsObj = {};
    cmds.forEach((cmd) => {
      cmdsAsObj[cmd.name] = cmd;
    });

    copyToClipboard(objectToString(cmdsAsObj));
  };

  const pasteCmds = async () => {
    const copidText = await navigator.clipboard.readText();
    const objectFromCopiedText = evalObject(copidText);
    setCmds(Object.values(objectFromCopiedText) || cmds);
  };

  const clearAllCmds = () => {
    setCmds([]);
  };

  const addCmd = (value) => {
    if (!value || !value.toString() || !hsCmds[value]) return;
    const cloneObj = structuredClone(hsCmds[value]);
    cloneObj.name = value;
    cloneObj.id = uniqueID();
    setCmds((cmds) => [...cmds, cloneObj]);
    setCmdsKeys(Object.keys(hsCmds));
    const cloneOfCmdsAdded = structuredClone(cmds);
    setCmdsAdded(cloneOfCmdsAdded);
    oldCmds.current = cloneOfCmdsAdded;
    setCommand(new String(""));
  };

  const addCmdBetween = (value, i) => {
    if (!value || !value.toString() || !hsCmds[value]) return;
    const cloneObj = structuredClone(hsCmds[value]);
    cloneObj.name = value;
    cloneObj.id = uniqueID();
    const cloneBetween = pushBetween({
      arr: cmds,
      oldContent: cmds[i],
      content: cloneObj,
    });

    setCmds(cloneBetween);
    setCmdsKeys(Object.keys(hsCmds));
    const cloneOfCmdsAdded = structuredClone(cmds);
    setCmdsAdded(cloneOfCmdsAdded);
    oldCmds.current = cloneOfCmdsAdded;
    setCommand(new String(""));
    // setCommand('')
  };

  const setOptionValue = (value, i) => {
    const clone = structuredClone(cmds);
    clone[i].optionValue = value;
    setCmds(clone);
  };

  //For Text Input and Select Input
  const addValueForSelect = async (
    value,
    i,
    x,
    isDynamicTempletRenderer = false
  ) => {
    const clone = structuredClone(cmds);
    clone[i].params[x].value =
      isDynamicTempletRenderer && dynamicTemplates[`${value}`]
        ? buildDynamicTemplate(
            html` ${await dynamicTemplates[`${value}`].cmp.text()} `,
            html`
              <style
                id="style-of-${dynamicTemplates[value].id}-dynamic-template"
              >
                ${await dynamicTemplates[value].allRules.text()}
              </style>
            `
          )
        : value;
    isDynamicTempletRenderer && (clone[i].params[x].dynamicTemplateId = value);
    console.log("dynamic template value : ", clone[i].params[x].value);

    setCmds(clone);
  };

  //For ObjectInput
  const addKeyAndValueForObject = ({ i, x, propKey, propVal }) => {
    const clone = structuredClone(cmds);
    console.log(propVal);

    clone[i].params[x].value = JSON.stringify({
      ...JSON.parse(clone[i].params[x].value || "{}"),
      [propKey]: propVal,
    });

    // objectToString({
    //   ...evalObject(clone[i].params[x].value || {}),
    //   [propKey]: propVal,
    // });

    // JSON.stringify({
    //   ...JSON.parse(clone[i].params[x].value || {}),
    //   [propKey]: propVal,
    // });
    console.log("a3aaaaaaaaaaaaa", propKey, propVal, clone[i].params[x].value);
    setCmds(clone);
  };

  const removeKeyAndValueForObject = ({ i, x, propKey }) => {
    const clone = structuredClone(cmds);
    const newObjData = JSON.parse(clone[i].params[x].value || "{}");
    delete newObjData[propKey];
    clone[i].params[x].value = JSON.stringify(newObjData);
    console.log(newObjData, propKey);

    setCmds(clone);
  };

  //For ArrayInput
  const addKeywordToArrayInput = (keyword = "", i, x) => {
    const clone = structuredClone(cmds);
    clone[i].params[x].value = [
      ...new Set([...(clone[i].params[x].value || []), keyword]),
    ];
    setCmds(clone);
  };

  const removeKeywordToArrayInput = (unwantedKeyword = "", i, x) => {
    const clone = structuredClone(cmds);
    clone[i].params[x].value = clone[i].params[x].value.filter(
      (keyword) => keyword != unwantedKeyword
    );

    setCmds(clone);
  };

  //For Code Editor
  const addValueFromCodeEditor = (value = "", i, x) => {
    const clone = structuredClone(cmds);
    clone[i].params[x].value = value;
    setCmds(clone);
  };

  //For Adder
  const deleteCmd = (index) => {
    const clone = structuredClone(cmds).filter((cmd, i) => i != index);
    setCmds(clone);
  };

  //===========
  const conditionalArray = (array, booleanValue) => {
    return booleanValue ? array : [];
  };

  return (
    <section className="flex flex-col gap-2">
      {/* <AsideControllers /> */}
      <section className="flex gap-2">
        <Select
          keywords={cmdKeys}
          value={command}
          placeholder="Type command"
          onInput={(value) => setCommand(value)}
          onItemClicked={(value) => addCmd(value)}
          onEnterPress={(value) => {
            console.log("sle value : ", value);
            addCmd(value);
          }}
        />

        <OptionsButton
          callbackChildren={({ setShowMenu }) => {
            return (
              <>
                <li
                  onClick={(ev) => {
                    setShowMenu(false);
                    addClickClass(ev.currentTarget, "click");
                    copyCmds();
                  }}
                  className="flex items-center gap-2 cursor-pointer transition-all hover:bg-gray-700 font-semibold p-2 rounded-lg"
                >
                  {Icons.copy({})}
                  <span>Copy</span>
                </li>

                <li
                  onClick={(ev) => {
                    ev.preventDefault();
                    setShowMenu(false);
                    addClickClass(ev.currentTarget, "click");
                    pasteCmds();
                  }}
                  className="flex items-center gap-2 cursor-pointer transition-all hover:bg-gray-700 font-semibold p-2 rounded-lg"
                >
                  {Icons.paste({})}
                  <span>Paste</span>
                </li>

                <li
                  onClick={(ev) => {
                    setShowMenu(false);
                    addClickClass(ev.currentTarget, "click");
                    clearAllCmds();
                  }}
                  className="flex items-center gap-2 cursor-pointer transition-all hover:bg-gray-700 font-semibold p-2 rounded-lg"
                >
                  {Icons.delete({})}
                  <span>Clear All</span>
                </li>
              </>
            );
          }}
        />

        <SmallButton
          className="flex-shrink-0 bg-slate-800"
          onClick={(ev) => {
            addCmd(command);
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </section>

      <section className="w-full flex flex-col gap-[40px] ">
        {cmds?.map?.((cmd, i) => {
          return (
            <Adder
              key={i}
              id={cmd.id}
              itemRef={adderRef}
              className="bg-slate-800 relative minion "
              inputClassName="bg-slate-900"
              addClassName="bg-slate-900 h-[52px] w-[50px]"
              delClassName="bg-slate-900 h-[52px] w-[50px]"
              placeholder="Type command"
              showSelectMenu={true}
              value={command}
              // emptyInputValueAfterClick={true}
              keywords={cmdKeys}
              onInput={(value) => setCommand(value)}
              onEnterPress={(value) => {
                addCmdBetween(value, i);
              }}
              onItemClicked={(value) => {
                addCmdBetween(value, i);
              }}
              onAddClick={(ev, value) => {
                addCmdBetween(value, i);
              }}
              onDeleteClick={(ev) => {
                deleteCmd(i);
              }}
            >
              <section className="flex flex-col gap-3 relative ">
                <MiniTitle>{cmd.name}</MiniTitle>

                {cmd.optionsRequired && (
                  <Select
                    value={cmd.optionValue}
                    placeholder="Select Option"
                    className="bg-slate-900"
                    keywords={[...Object.values(cmd.options)]}
                    onAll={(value) => {
                      setOptionValue(value, i);
                    }}
                  />
                )}

                {cmd.params.map((param, x) => {
                  return (
                    <section
                      key={x}
                      className={`w-full  flex justify-between flex-col  gap-2 ${
                        param.type == "array" || param.type == "object"
                          ? "flex-col"
                          : ""
                      }`}
                    >
                      <p
                        className={`min-w-[30%] bg-blue-500  select-none border-l-[3px] p-2 text-nowrap text-[calc(4.5vh/2)] capitalize overflow-auto hideScrollBar   flex   items-center justify-center flex-shrink-0 w-fit rounded-lg  border-blue-600   text-slate-200 font-bold `}
                      >
                        {param.name} :{" "}
                      </p>

                      {/* {param.} */}

                      {(param.type == "text" || param.type == "number") && (
                        <Input
                          className="bg-slate-900 w-full py-3"
                          placeholder={param.name}
                          value={param.value || ""}
                          onInput={(ev) => {
                            param.type == "number" &&
                              transformToNumInput(ev.target);
                            addValueForSelect(ev.target.value, i, x);
                          }}
                        />
                      )}

                      {param.type == "select" && (
                        <Select
                          // isTextarea
                          isCode={param?.isCode}
                          isTemplateEngine={param?.isTemplateEngine}
                          allowRestAPIModelsContext={param.accessRestVars}
                          codeProps={{
                            language: "javascript",
                            value:
                              param?.renderDynamicElement &&
                              param?.dynamicTemplateId
                                ? param?.dynamicTemplateId
                                : param.value || "",
                            onChange(value) {
                              addValueForSelect(
                                value,
                                i,
                                x,
                                param?.renderDynamicElement
                              );
                            },
                          }}
                          allowCmdsContext
                          keywords={[
                            ...conditionalArray(vars, param?.accessAll),
                            ...(param.keywords || []),
                            ...conditionalArray(
                              param.keywords,
                              Boolean(param.keywords)
                            ),
                            ...conditionalArray(
                              Object.keys(dynamicTemplates),
                              param?.renderDynamicElement
                            ),
                            ...conditionalArray(
                              functionNames,
                              functionNames.length
                            ),
                            ...conditionalArray(restModelsVars , param.accessRestVars)
                          ]}
                          className="w-full  bg-slate-900"
                          placeholder={param.name}
                          ignoreCurlyBrackets={true}
                          value={
                            param?.renderDynamicElement &&
                            param?.dynamicTemplateId
                              ? param?.dynamicTemplateId
                              : param.value || ""
                          }
                          onAll={(value) => {
                            addValueForSelect(
                              value,
                              i,
                              x,
                              param?.renderDynamicElement
                            );
                          }}
                        />
                      )}

                      {param.type == "object" && (
                        <ObjectInput
                          className="bg-slate-800"
                          keywords={[...vars, ...hsZoo]}
                          obj={
                            // typeof param.value == "object" &&
                            // evalObject(param.value)
                            //   ? evalObject(param.value)
                            //   : {}
                            JSON.parse(param.value || "{}")
                          }
                          onAddClick={(ev, propKey, propVal) => {
                            addKeyAndValueForObject({
                              i,
                              propKey,
                              propVal,
                              x,
                            });
                          }}
                          onDelete={(ev, propKey, propVal) => {
                            removeKeyAndValueForObject({
                              i,
                              propKey,
                              propVal,
                              x,
                            });
                          }}
                        />
                      )}

                      {param.type == "array" && (
                        <ArrayInput
                          className="bg-slate-800"
                          array={param.value || []}
                          placeholder={param.name}
                          onAddClick={(ev, value) => {
                            addKeywordToArrayInput(value, i, x);
                          }}
                          onCloseClick={(ev, keyword, index) => {
                            removeKeywordToArrayInput(keyword, i, x);
                          }}
                        />
                      )}

                      {param.type == "code" && (
                        // <section className="rounded-lg h-[330px] ">
                        //   <Editor
                        //     className="w-full h-full"

                        //     options={{
                        //       fontSize: "18px",
                        //       foldingHighlight:true,
                        //       minimap:{
                        //         autohide:true,
                        //       },
                        //       padding:{
                        //         bottom:10,
                        //         top:20
                        //       }
                        //     }}

                        //     language={param.lang}
                        //     theme="vs-dark"
                        //     loading={<Loader width={40} height={40} />}
                        //     value={param.value || ``}
                        // onChange={(value)=>{
                        //   addValueFromCodeEditor(value , i ,x);
                        // }}
                        //     onMount={(vsEditor)=>{
                        //       codeEditorRef.current = vsEditor
                        //     }}
                        //     // defaultValue={}
                        //   />
                        // </section>
                        <Select
                          className="w-full  bg-slate-900"
                          isCode={true}
                          value={param.value || ``}
                          codeProps={{
                            value: param.value || ``,
                            onChange: (value) => {
                              addValueFromCodeEditor(value, i, x);
                            },
                            language: param.lang,
                            // options: { tabFocusMode: true },
                          }}
                        />
                      )}
                    </section>
                  );
                })}
              </section>
            </Adder>
          );
        })}
      </section>
    </section>
  );
};
// console.log('keeys : ' ,  ...Object.keys([]));
