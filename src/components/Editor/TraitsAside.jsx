import React, { memo, useEffect, useRef, useState } from "react";
import { Input } from "./Protos/Input";
import { useEditorMaybe } from "@grapesjs/react";
import { Button } from "../Protos/Button";
import {
  assetsType,
  componentType,
  refType,
  traitsType,
} from "../../helpers/jsDocs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  assetTypeState,
  currentElState,
  showPreviewState,
} from "../../helpers/atoms";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { Select } from "./Protos/Select";
import { HighlightContentEditable } from "./Protos/HighlightContentEditable";
import { DetailsNormal } from "../Protos/DetailsNormal";
import { MiniTitle } from "./Protos/MiniTitle";
import { open_files_manager_modal } from "../../constants/InfinitelyCommands";
import { inf_build_url } from "../../constants/shared";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { CodeEditor } from "./Protos/CodeEditor";
import { parseHTML } from "linkedom";
import {
  doDocument,
  getProjectData,
  getProjectSettings,
  isValidAttribute,
} from "../../helpers/functions";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { InfAccordion } from "../Protos/InfAccordion";
import { AccordionItem } from "@heroui/accordion";
import { FitTitle } from "./Protos/FitTitle";
import { SwitchButton } from "../Protos/SwitchButton";
import { isFunction, isString } from "lodash";
import { addClickClass, parse, stringify } from "../../helpers/cocktail";
import { useCmdsContext } from "../../hooks/useCmdsContext";
import { useLiveQuery } from "dexie-react-hooks";
import { Popover } from "./Popover";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../Protos/VirtusoGridComponent";
import { FileView } from "../Protos/FileView";
import { ChooseFile } from "../Protos/ChooseFile";

export const TraitsAside = memo(() => {
  const editor = useEditorMaybe();
  const [newAttributeName, setNewAttributeName] = useState("");
  const [traits, setTraits] = useState(traitsType);
  const [attributesTraits, setAttributesTraits] = useState(traitsType);
  const [handlerTraits, setHandlerTraits] = useState(traitsType);
  const [attributes, setAttributes] = useState({});
  const [cmpTextContent, setCmpTextContent] = useState("");
  const [selectedCmp, setSelectedCmp] = useState(componentType);
  const [selectedValue, setSelectedValue] = useState("");
  const [fileName, setFileName] = useState("");
  const setAssetType = useSetRecoilState(assetTypeState);
  const selectedEl = useRecoilValue(currentElState);
  const [cmdsContext, setCmdsContext] = useCmdsContext();
  const [projectData, setProjectData] = useState({});

  const [codeSettings, setCodeSettings] = useState({
    defaultLanguage: "html" || "javascript",
    enableTemplateEngine: false,
    htmlValueState: "",
    templateEngineValueState: "",
  });

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    setProjectData(projectData);
  });

  useEffect(() => {
    if (!editor || !editor.getSelected()) return;
    const selectedEl = editor.getSelected();
    // console.log('traits : ' ,editor.getSelected().getTraits());

    setCmpTextContent(editor.getSelected().getInnerHTML());
    const buildFileName = selectedEl.getAttributes()[inf_build_url];
    const contentLangType =
      selectedEl.getAttributes()["content-lang"] || "html";
    setFileName(buildFileName);
    setSelectedCmp(selectedEl);

    const innerHtml = selectedEl.isInstanceOf("text")
      ? selectedEl.getInnerHTML()
      : "";
    // setSelectedValue(selectedEl.getInnerHTML());
    setCodeSettings({
      ...codeSettings,
      defaultLanguage: contentLangType,
      htmlValueState: contentLangType == "html" ? innerHtml : "",
      templateEngineValueState:
        contentLangType == "javascript" ? innerHtml : "",
      enableTemplateEngine: contentLangType == "javascript",
    });
    
    getAndSetTraits();
    setCmdsContext();
  }, [selectedEl]);

  useEffect(() => {
    const selectedEl = editor?.getSelected?.();
    if (!editor || !selectedEl) return;
    const callback = () => {
      console.log("trait updated");
      getAndSetTraits();
    };
    // const buildAttrUrlCallback = () => {
    //   setFileName(selectedEl.getAttributes()[inf_build_url]);
    // };
    editor.on("trait:value", callback);
    // editor.on(InfinitelyEvents.attributes.buildUrl, buildAttrUrlCallback);
    return () => {
      editor.off("trait:value", callback);
      // editor.off(InfinitelyEvents.attributes.buildUrl, buildAttrUrlCallback);
    };
  }, [editor]);

  const getFilterdAttributes = () => {
    const sle = editor.getSelected();
    const traits = sle.getTraits();

    const attributesTraits = traits
      .map((trait) => trait.attributes)
      .filter((trait) => trait.role == "attribute");

    const elementAttributes = sle.getAttributes();

    attributesTraits.forEach((trait) => {
      delete elementAttributes[trait.name];
    });

    Object.keys(elementAttributes).forEach((key) => {
      if (
        key.startsWith("_") ||
        key.startsWith("inf") ||
        key.startsWith("v-")
      ) {
        delete elementAttributes[key];
      }
    });
    delete elementAttributes["id"];
    delete elementAttributes["class"];

    return elementAttributes;
  };

  const getAndSetTraits = () => {
    const sle = editor.getSelected();

    const traits = sle.getTraits();

    const attributesTraits = traits
      .map((trait) => trait.attributes)
      .filter((trait) => trait.role == "attribute");

    const handlerTraits = traits
      .map((trait) => trait.attributes)
      .filter((trait) => trait.role == "handler");

    const elementAttributes = sle.getAttributes();

    attributesTraits.concat(handlerTraits).forEach((trait) => {
      delete elementAttributes[trait.name];
    });
    Object.keys(elementAttributes).forEach((key) => {
      if (
        key.startsWith("_") ||
        key.startsWith("inf") ||
        key.startsWith("v-")
      ) {
        delete elementAttributes[key];
      }
    });
    delete elementAttributes["id"];
    delete elementAttributes["class"];
    setTraits(traits);
    setAttributesTraits(attributesTraits);
    setHandlerTraits(handlerTraits);
    setAttributes(elementAttributes);
    console.log(
      "traits : ",
      attributesTraits,
      handlerTraits,
      sle.getTraits().map((tr) => tr.attributes)
    );
  };

  const updateTraitValue = ({ name = "", key = "", value = "" }) => {
    const sle = editor.getSelected();
    sle.updateTrait(name, { [key]: value });
    const trait = sle.getTrait(name);

    // trait.set({
    //   [key]: value,
    //   attributes: {
    //     [key]: value,
    //   },
    // });



    const role = trait.get("role");
    if (role == "attribute") {
      console.log('this is attribute');
      
      sle.addAttributes({ [name]: trait.get('value') } , );
    }
    // sle.addAttributes({ [name]: isString(value) ? value : stringify(value) });
    editor.trigger("trait:value");
    console.log("update should be done");
  };

  const addAttribute = ({ key, value }) => {
    const sle = editor.getSelected();
    const type = sle.get("type").toLowerCase();
    if (isValidAttribute(key, value)) {
      sle.addAttributes({ [key]: value || "" }, { partial:true });
      setAttributes(getFilterdAttributes());
      if (type == "video" || type == "iframe" || type == "source") {
        const newSle = sle.replaceWith(sle.clone())[0];
        getProjectSettings().set({
          navigate_to_style_when_Select: false,
        });
        editor.select(newSle);
        getProjectSettings().set({
          navigate_to_style_when_Select: true,
        });
      }
    } else {
      toast.error(<ToastMsgInfo msg={`Attribute has invalid character`} />);
    }
  };

  const removeAttribute = (key) => {
    const sle = editor.getSelected();
    const type = sle.get("type").toLowerCase();
    sle.removeAttributes([key]);
    setAttributes(getFilterdAttributes());
    if (type == "video" || type == "iframe" || type == "source") {
      const newSle = sle.replaceWith(sle.clone())[0];
      getProjectSettings().set({
        navigate_to_style_when_Select: false,
      });
      editor.select(newSle);
      getProjectSettings().set({
        navigate_to_style_when_Select: true,
      });
    }
  };

  return (
  <section className="mt-2">
      <InfAccordion>
      {/* <AsideControllers /> */}
      <AccordionItem title={"Type Content"}>
        <section className="flex flex-col gap-2 p-2">
          <section className="flex items-center gap-2 justify-between">
            <FitTitle className="custom-font-size">Type Content</FitTitle>
            <nav className="flex items-center  gap-3 p-1 px-2 bg-slate-800 w-fit  rounded-lg self-end text-slate-200">
              <button
                className={`w-[22.5px] h-[22.5px] cursor-pointer flex items-center justify-center rounded-md transition-colors ${
                  codeSettings.defaultLanguage == "html" && "bg-blue-600"
                }`}
                onClick={(ev) => {
                  addClickClass(ev.currentTarget, "click");
                  editor.getSelected().addAttributes({
                    "content-lang": "html",
                  });
                  setCodeSettings({
                    ...codeSettings,
                    defaultLanguage: "html",
                    enableTemplateEngine: false,
                  });
                }}
              >
                {Icons.html({ width: 16, height: 16 })}
              </button>
              <button
                className={`w-[22.5px] h-[22.5px] cursor-pointer flex items-center justify-center rounded-md transition-colors ${
                  codeSettings.defaultLanguage == "javascript" && "bg-blue-600"
                }`}
                onClick={(ev) => {
                  addClickClass(ev.currentTarget, "click");
                  editor.getSelected().addAttributes({
                    "content-lang": "javascript",
                  });
                  setCodeSettings({
                    ...codeSettings,
                    defaultLanguage: "javascript",
                    enableTemplateEngine: true,
                  });
                }}
              >{`\$\{ \}`}</button>
            </nav>
          </section>
          <Select
            isCode
            className="px-[unset] py-[unset] "
            inputClassName="bg-slate-800"
            containerClassName="bg-slate-800"
            placeholder="Type Content"
            allowCmdsContext
            allowRestAPIModelsContext
            value={
              codeSettings.defaultLanguage == "html"
                ? codeSettings.htmlValueState
                : codeSettings.templateEngineValueState
            }
            codeProps={{
              language: codeSettings.defaultLanguage,
              // onMount(mEditor) {
              //   console.log('mouted' ,  editor
              //     ?.getSelected?.()
              //     ?.components()
              //     ?.models?.[0]?.toHTML?.());

              //   mEditor.setValue(
              //    selectedValue
              //   );
              // },
              // value: codeSettings.htmlValueState || codeSettings.templateEngineValueState,
              onMount(ed, mon) {
                // console.log("mouted", ed, mon);
                setCmdsContext();
                if (
                  codeSettings.defaultLanguage == "html" &&
                  !codeSettings.enableTemplateEngine
                ) {
                  ed.setValue(codeSettings.htmlValueState || codeSettings.templateEngineValueState);
                  // setCodeSettings({
                  //   ...codeSettings,
                  //   htmlValueState: selectedValue,
                  // });
                } else if (
                  codeSettings.defaultLanguage == "javascript" &&
                  codeSettings.enableTemplateEngine
                ) {
                  const templateEngineValue = `\`${codeSettings.templateEngineValueState}\``;
                  ed.setValue(templateEngineValue);
                  // setCodeSettings({
                  //   ...codeSettings,
                  //   templateEngineValueState: templateEngineValue,
                  // });
                }
              },
              onChange(value) {
                const sle = editor.getSelected();
                const type = sle.get("type");
                if (!sle.isInstanceOf("text")) return;

                if (
                  !codeSettings.enableTemplateEngine &&
                  codeSettings.defaultLanguage == "html"
                ) {
                  sle.components(`${value}`);
                  // setSelectedValue(value);
                  setCodeSettings({
                    ...codeSettings,
                    htmlValueState: value,
                  });
                } else if (
                  codeSettings.enableTemplateEngine &&
                  codeSettings.defaultLanguage == "javascript"
                ) {
                  if (
                    value.trim().startsWith("`") &&
                    value.trim().endsWith("`")
                  ) {
                    const newValue = value.trim().slice(1, -1);
                    sle.components(newValue);
                    setCodeSettings({
                      ...codeSettings,
                      templateEngineValueState: newValue,
                    });
                  }
                }
                // sle.getEl().innerHTML = `${value}`;

                editor.refresh();
                editor.Canvas.refresh();
                editor.Canvas.refreshSpots();
              },
            }}
          />
        </section>
      </AccordionItem>
      {!![...attributesTraits, ...handlerTraits].length && (
        <AccordionItem title={"Traits"}>
          <section className="p-2 flex flex-col gap-2">
            <MiniTitle className={`py-3 w-full`}>Traits</MiniTitle>

            {[...attributesTraits, ...handlerTraits].map((trait, i) => {
              console.log("trait type:", trait);
              console.log("is function ? ", isFunction(trait?.showCallback));

              const isShow =
                trait?.showCallback && isFunction(trait?.showCallback)
                  ? trait?.showCallback?.()
                  : true;
              return isShow ? (
                <li
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg"
                >
                  {/* <h1 className="text-[14px!important] px-2 text-white capitalize font-semibold">
                    {trait.name}
                  </h1> */}
                  <FitTitle>{trait.label}</FitTitle>
                  {trait.type == "text" && isShow && (
                    <Input
                      value={trait.value || trait.default || ""}
                      placeholder={trait.placeholder || trait.label}
                      className="py-2 w-full bg-slate-800"
                      onInput={(ev) => {
                        trait.callback &&
                          trait.callback({
                            editor,
                            oldValue: trait.value,
                            newValue: ev.target.value,
                            trait,
                          });
                        trait.command && editor.runCommand(trait.command);
                        updateTraitValue({
                          name: trait.name,
                          key: "value",
                          value: ev.target.value,
                        });

                        // if (trait.role == "attribute") {
                        //   addAttribute({ [trait.name]: ev.target.value });
                        // }
                      }}
                    />
                  )}

                  {trait.type == "select" && isShow && (
                    <Select
                      placeholder={trait.placeholder || trait.label}
                      keywords={
                        isFunction(trait.keywords)
                          ? trait.keywords({ projectData })
                          : trait.keywords || []
                      }
                      value={trait.value || trait.default || ""}
                      onAll={(value) => {
                        trait.callback &&
                          trait.callback({
                            editor,
                            oldValue: trait.value,
                            newValue: value,
                            trait,
                          });
                        trait.command && editor.runCommand(trait.command);
                        updateTraitValue({
                          name: trait.name,
                          key: "value",
                          value,
                        });
                      }}
                    />
                  )}

                  {trait.type == "textarea" && isShow && (
                    <Select
                      placeholder={trait.placeholder || trait.label}
                      // keywords={trait.keywords}
                      value={trait.value || trait.default || ""}
                      // onAll={(value) => {
                      //   console.log(value);

                      //   trait.callback &&
                      //     trait.callback({
                      //       editor,
                      //       oldValue: trait.value,
                      //       newValue: value,
                      //       trait,
                      //     });
                      //   trait.command && editor.runCommand(trait.command);
                      //   updateTraitValue({
                      //     name: trait.name,
                      //     key: "value",
                      //     value,
                      //   });
                      //   console.log(
                      //     "traits vals",
                      //     editor
                      //       .getSelected()
                      //       .getTraits()
                      //       .map((tr) => tr.attributes),
                      //     JSON.stringify(editor.getSelected()),
                      //     {
                      //       ...editor.getSelected().toJSON(),
                      //       traits: editor
                      //         .getSelected()
                      //         .getTraits()
                      //         .map((tr) => tr.attributes),
                      //     },
                      //     editor.getComponents()
                      //   );
                      //   // if (trait.role == "attribute") {
                      //   //   addAttribute({ [trait.name]: value });
                      //   // }
                      // }}
                      allowCmdsContext={trait?.allowCmdsContext}
                      allowRestAPIModelsContext={trait?.allowCmdsContext}
                      isCode
                      codeProps={{
                        language: trait.textareaLanguage || "text",
                        // value: trait.value,
                        ...(trait?.codeEditorProps || {}),
                        onMount(ed, mon) {
                          trait?.onMountHandler?.(ed, mon);
                        },
                        onChange(value) {
                          trait?.onChangeHandler?.(value);
                          trait.callback &&
                            trait.callback({
                              editor,
                              oldValue: trait.value,
                              newValue: value,
                              trait,
                            });

                          trait.command && editor.runCommand(trait.command);
                          updateTraitValue({
                            name: trait.name,
                            key: "value",
                            value,
                          });
                        },
                      }}
                    />
                  )}

                  {trait.type == "add-props" && isShow && (
                    <>
                      <section className="flex justify-between gap-2">
                        <Select
                          placeholder={trait.placeholder || trait.label}
                          className="w-full bg-slate-800"
                          value={trait.stateProp || ""}
                          keywords={
                            isFunction(trait.keywords)
                              ? trait.keywords({ projectData })
                              : trait.keywords || []
                          }
                          onInput={(value) => {
                            updateTraitValue({
                              name: trait.name,
                              key: "stateProp",
                              value,
                            });
                          }}
                          onEnterPress={(value) => {
                            const newVal = stringify({
                              ...parse(trait.value || {}),
                              [value]: "",
                            });

                            trait.callback &&
                              trait.callback({
                                editor,
                                oldValue: trait.value,
                                newValue: newVal,
                                trait,
                              });
                            trait.command && editor.runCommand(trait.command);
                            updateTraitValue({
                              name: trait.name,
                              key: "value",
                              value: newVal,
                            });
                          }}
                          onItemClicked={(value) => {
                            const newVal = stringify({
                              ...parse(trait.value || {}),
                              [value]: "",
                            });

                            trait.callback &&
                              trait.callback({
                                editor,
                                oldValue: trait.value,
                                newValue: newVal,
                                trait,
                              });

                            trait.command && editor.runCommand(trait.command);

                            updateTraitValue({
                              name: trait.name,
                              key: "value",
                              value: newVal,
                            });
                          }}
                        />
                        <SmallButton
                          onClick={() => {
                            const newVal = stringify({
                              ...parse(trait.value || {}),
                              [trait.stateProp]: "",
                            });

                            trait.callback &&
                              trait.callback({
                                editor,
                                oldValue: trait.value,
                                newValue: newVal,
                                trait,
                              });
                            trait.command && editor.runCommand(trait.command);
                            updateTraitValue({
                              name: trait.name,
                              key: "value",
                              value: newVal,
                            });
                          }}
                        >
                          {Icons.plus("white")}
                        </SmallButton>
                      </section>

                      <section className="flex flex-col gap-2">
                        {Object.entries(
                          parse(trait.value || trait.default) || {}
                        ).map(([key, value], i) => {
                          return (
                            <section key={i} className="flex flex-col gap-2">
                              <FitTitle>{key}</FitTitle>
                              <section className="flex gap-2">
                                {(trait.addPropsInputType == "text" ||
                                  !trait.addPropsInputType) && (
                                  <Input
                                    placeholder={key}
                                    className="w-full bg-slate-800"
                                    value={value || ""}
                                    onInput={(ev) => {
                                      const newVal = stringify({
                                        ...parse(trait.value || {}),
                                        [key]: ev.target.value,
                                      });

                                      trait.callback &&
                                        trait.callback({
                                          editor,
                                          oldValue: trait.value,
                                          newValue: newVal,
                                          trait,
                                        });

                                      trait.command &&
                                        editor.runCommand(trait.command);

                                      updateTraitValue({
                                        name: trait.name,
                                        key: "value",
                                        value: newVal,
                                      });
                                    }}
                                  />
                                )}

                                {trait.addPropsInputType == "code" && (
                                  <Select
                                    placeholder={key}
                                    // className="w-full bg-slate-800"
                                    value={value || ""}
                                    isCode
                                    allowCmdsContext
                                    allowRestAPIModelsContext
                                    codeProps={{
                                      language:
                                        trait.addPropsCodeLanguage || "text",
                                      value,
                                      onChange: (value) => {
                                        const newVal = stringify({
                                          ...parse(trait.value || {}),
                                          [key]: value,
                                        });

                                        trait.callback &&
                                          trait.callback({
                                            editor,
                                            oldValue: trait.value,
                                            newValue: newVal,
                                            trait,
                                          });

                                        trait.command &&
                                          editor.runCommand(trait.command);

                                        updateTraitValue({
                                          name: trait.name,
                                          key: "value",
                                          value: newVal,
                                        });
                                      },
                                    }}
                                  />
                                )}

                                <SmallButton
                                  onClick={() => {
                                    const parsedVal = parse(trait.value || {});
                                    delete parsedVal[key];
                                    const newVal = stringify({
                                      ...parsedVal,
                                    });
                                    trait.callback &&
                                      trait.callback({
                                        editor,
                                        oldValue: trait.value,
                                        newValue: newVal,
                                      });
                                    trait.command &&
                                      editor.runCommand(trait.command);

                                    updateTraitValue({
                                      name: trait.name,
                                      key: "value",
                                      value: newVal,
                                    });
                                  }}
                                  className="[&_path]:stroke-white bg-slate-800 hover:bg-[crimson!important]"
                                >
                                  {Icons.trash()}
                                </SmallButton>
                              </section>
                            </section>
                          );
                        })}
                      </section>
                    </>
                  )}

                  {trait.type.toLowerCase() == "switch" && isShow && (
                    <SwitchButton
                      defaultValue={Boolean(trait.value || trait.default)}
                      onActive={() => {
                        trait?.onSwitch?.(true);
                        trait.command && editor.runCommand(trait.command);
                        updateTraitValue({
                          name: trait.name,
                          key: "value",
                          value: true,
                        });
                      }}
                      onUnActive={() => {
                        trait?.onSwitch?.(false);
                        trait.command && editor.runCommand(trait.command);
                        updateTraitValue({
                          name: trait.name,
                          key: "value",
                          value: false,
                        });
                      }}
                    >
                      {trait.label}
                    </SwitchButton>
                  )}

                  {trait.type.toLowerCase() == "button" && isShow && (
                    <Button
                      className="flex justify-center items-center py-2 w-full"
                      {...trait.buttonEvents({ editor, trait })}
                    >
                      {trait.label}
                    </Button>
                  )}

                  {trait.type.toLowerCase() == "media" && isShow && (
                    <ChooseFile
                      value={trait.value}
                      placeholder={trait.placeholder || trait.label}
                      mediaType={trait.mediaType}
                      callback={(asset, url) => {
                        trait.callback({
                          editor,
                          newValue: url,
                          oldValue: trait.value,
                          asset:asset,
                          trait,
                        });
                        console.log('url : ' , url);
                        
                        trait?.command && editor.runCommand(trait.command);
                        updateTraitValue({
                          name: trait.name,
                          key: "value",
                          value: url,
                        });
                      }}
                    />
                  )}

                  {trait.type.toLowerCase() == 'custom' && isShow ?<trait.component/> : null}
                </li>
              ) : null;
            })}
          </section>
        </AccordionItem>
      )}

      <AccordionItem title={"Attributes"}>
        <section className="p-2 flex flex-col gap-2">
          <MiniTitle className={`py-3 w-full`}>Attributes</MiniTitle>
          {!!Object.keys(attributes).length &&
            Object.keys(attributes).map((key, i) => {
              return (
                <li key={i} className="flex flex-col gap-2">
                  <FitTitle>{key}</FitTitle>
                  <section className="flex gap-2">
                    <Input
                      placeholder={key}
                      className="bg-slate-800 w-full"
                      value={attributes[key]}
                      onInput={(ev) => {
                        addAttribute({ key, value: ev.target.value });
                      }}
                    />
                    <Button
                      onClick={(ev) => {
                        removeAttribute(key);
                      }}
                    >
                      {Icons.trash("white")}
                    </Button>
                  </section>
                </li>
              );
            })}

          <section className="flex flex-col gap-2 items-center">
            <Input
              value={newAttributeName}
              className="w-full text-center bg-slate-800"
              placeholder="Add Attribute"
              onInput={(ev) => {
                setNewAttributeName(ev.target.value);
              }}
            />
            <Button
              onClick={(ev) => {
                console.log("RRADA : ", newAttributeName);

                addAttribute({ key: `${newAttributeName}`, value: "" });
                setNewAttributeName("");
              }}
            >
              {Icons.plus("white")}
              Add
            </Button>
          </section>
        </section>
      </AccordionItem>
    </InfAccordion>
  </section>
  );
});
