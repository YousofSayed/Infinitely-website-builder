import React, { memo, useEffect, useRef, useState } from "react";
import { directives } from "../../constants/cmds";
import { Input } from "./Protos/Input";
import { DetailsNormal } from "../Protos/DetailsNormal";
import { Details } from "./Protos/Details";
import { Button } from "../Protos/Button";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { Select } from "./Protos/Select";
import { ObjectInput } from "./Protos/Commands/ObjectInput";
import {
  getAlpineContext,
  getDirectiveContext,
  parseForDirective,
} from "../../helpers/bridge";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../helpers/atoms";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { js_beautify } from "js-beautify";
import { cloneDeep } from "lodash";
import { Choices } from "./Protos/Choices";
import { MiniTitle } from "./Protos/MiniTitle";
import { Tooltip } from "react-tooltip";
import { useCmdsContext } from "../../hooks/useCmdsContext";
import { InfAccordion } from "../Protos/InfAccordion";
import { AccordionItem } from "@heroui/accordion";
import { getInfinitelySymbolInfo } from "../../helpers/functions";
import { current_symbol_id } from "../../constants/shared";
import { SearchHeader } from "../Protos/SearchHeader";

export const Commands = memo(() => {
  const editor = useEditorMaybe();
  const [cmds, setCmds] = useState(directives);
  const [dataObject, setDataObject] = useState({});
  const selectedEl = useRecoilValue(currentElState);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedType, setSelectedType] = useState("");
  const [cmdsContext, setCmdsContext] = useCmdsContext();
  const typingTimeout = useRef();
  const [customDirevtives, setCustomDirectives] = useState({
    "v-for": {
      varName: "",
      index: "",
      array: "",
    },
    "v-if": "",
    "x-teleport": "",
  });

  useEffect(() => {
    const sle = editor?.getSelected?.();
    if (!sle) return;
    const type = sle.get("type") == "template" ? sle.get("type") : "";
    setSelectedType(type);
    Object.entries(editor?.getSelected?.()?.getAttributes()).forEach(
      ([key, value]) => {
        key.startsWith("v-") && !value && sle.removeAttributes(key);
      }
    );
    const selectedAttributes = editor?.getSelected?.()?.getAttributes() || {};
    setSelectedAttributes(selectedAttributes);
    setCustomDirectives({
      ...customDirevtives,
      "v-for": {
        ...(parseForDirective(selectedAttributes["v-for"]) || {}),
      },
    });
    console.log(parseForDirective(selectedAttributes["v-for"]));
    setCmdsContext();
  }, [selectedEl]);

  useEffect(() => {
    if (!editor) return;
    const callback = () => {
      const selectedAttributes = editor?.getSelected?.()?.getAttributes() || {};
      setSelectedAttributes(selectedAttributes);
      setCustomDirectives({
        ...customDirevtives,
        "v-for": {
          ...(parseForDirective(selectedAttributes["v-for"]) || {}),
        },
      });
      console.log({
        ...customDirevtives,
        "v-for": {
          ...customDirevtives["v-for"],
          ...(parseForDirective(selectedAttributes["v-for"]) || {}),
        },
      });

      setCmdsContext();
    };
    editor.on(InfinitelyEvents.directives.update, callback);
    return () => {
      editor.off(InfinitelyEvents.directives.update, callback);
    };
  }, [editor]);

  const objectSplitter = (string = "") => {
    string = string.trim();
    if (!string) return "";
    if (string.startsWith("(") && string.endsWith(")")) {
      string = string.slice(1, -1).trim();
      if (string.startsWith("{") && string.endsWith("}")) {
        return string;
      } else {
        toast.error(<ToastMsgInfo msg={`Object is not valid`} />);
      }
    } else {
      toast.error(<ToastMsgInfo msg={`Object is not valid`} />);
    }
    console.log(string);
  };

  const addValue = (value = "", i) => {
    const clone = cloneDeep(cmds);
    clone[i].value = value;
    setCmds(clone);
  };

  const addSuffixValue = (value = "", i) => {
    const clone = cloneDeep(cmds);
    clone[i].suffixValue = value;
    setCmds(clone);
  };

  const addModifierValue = (value = "", i) => {
    const clone = cloneDeep(cmds);
    clone[i].modifierValue = value;
    setCmds(clone);
  };

  const addModifier = (modifier = "", i) => {
    const clone = cloneDeep(cmds);
    clone[i].selectedModifiers = [
      ...(clone?.[i]?.selectedModifiers || []),
      modifier,
    ];
    setCmds(clone);
  };

  const removeModifier = (modifier = "", i) => {
    const clone = cloneDeep(cmds);
    clone[i].selectedModifiers = clone[i].selectedModifiers.filter(
      (key) => key.toLowerCase() != modifier
    );
    setCmds(clone);
    return clone;
  };

  const removeAttribute = (attribute = "") => {
    if (!attribute) return;
    const sle = editor.getSelected();
    sle.removeAttributes([attribute]);
    editor.trigger(InfinitelyEvents.directives.update);
  };

  const handleAddingAttributes = (value = "", directive) => {
    typingTimeout.current && clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      const sle = editor.getSelected();
      if (!value) {
        sle.removeAttributes([directive]);
      } else {
        sle.addAttributes(
          {
            [directive]: value,
          },
          { avoidStore: true }
        );
      }
      editor.trigger(InfinitelyEvents.directives.update);
      const symbolInfo = getInfinitelySymbolInfo(sle);
      if (symbolInfo.isSymbol) {
        sessionStorage.setItem(current_symbol_id, symbolInfo.mainId);
        editor.trigger(
          `${InfinitelyEvents.symbols.update}:${symbolInfo.mainId}`,
          symbolInfo.mainId,
          sle,
          JSON.stringify(symbolInfo.symbol)
        );
      }
      editor.store();
      editor.trigger(InfinitelyEvents.directives.update);
    }, 300);
  };

  const isRequired = (string, bool) => {
    return bool ? `${string} (required)` : string;
  };

  const search = (value = "") => {
    if (!value) {
      setCmds(directives);
      return;
    }
    const newArr = cmds.filter(
      (cmd) => cmd.directive.includes(value) || cmd.name.includes(value)
    );
    setCmds(newArr);
  };

  return (
    <section className="flex flex-col gap-2">
      
      <SearchHeader search={search}/>
      <InfAccordion>
        {/* {selectedType && (
         
        )} */}

        <AccordionItem title={"for"}>
          <section className="mt-2 flex flex-col  gap-2 p-2 text-[14px]">
            <h1>Var :</h1>
            <Input
              className="bg-slate-800 w-full"
              placeholder="var"
              value={customDirevtives["v-for"]?.varName || ""}
              onInput={(ev) => {
                setCustomDirectives({
                  ...customDirevtives,
                  "v-for": {
                    ...customDirevtives["v-for"],
                    varName: ev.target.value,
                  },
                });
              }}
            />
            <h1>Index : </h1>
            <Input
              className="bg-slate-800 w-full"
              placeholder="index"
              value={customDirevtives["v-for"]?.index || ""}
              onInput={(ev) => {
                setCustomDirectives({
                  ...customDirevtives,
                  "v-for": {
                    ...customDirevtives["v-for"],
                    index: ev.target.value,
                  },
                });
              }}
            />
            <h1>Array :</h1>
            <Select
              placeholder="array"
              isCode
              allowCmdsContext
              value={customDirevtives["v-for"]?.array || ""}
              codeProps={{
                language: "javascript",
                onMount(mEditor) {
                  mEditor.setValue(
                    js_beautify(customDirevtives["v-for"]?.array || "")
                  );
                },
                onChange(value) {
                  // if (!value) {
                  //   editor.getSelected().removeAttributes(["v-for"]);
                  // } else {
                  //   editor.getSelected().addAttributes({
                  //     "v-for": `(${customDirevtives["v-for"].varName} , ${customDirevtives["v-for"].index}) in ${value}`,
                  //   });
                  // }
                  // editor.trigger(InfinitelyEvents.directives.update);
                  if (
                    !customDirevtives["v-for"].varName ||
                    !customDirevtives["v-for"].index
                  ) {
                    toast.warn(<ToastMsgInfo msg={`Fill all fields please`} />);
                    return;
                  }

                  if (
                    (customDirevtives["v-for"].varName ||
                      customDirevtives["v-for"].index) &&
                    !value
                  ) {
                    // return;
                  } else {
                    handleAddingAttributes(
                      value
                        ? `(${customDirevtives["v-for"].varName} , ${customDirevtives["v-for"].index}) in ${value}`
                        : "",
                      "v-for"
                    );
                  }
                },
              }}
            />
          </section>
        </AccordionItem>

        <AccordionItem title={"if"}>
          <section className="mt-2 ">
            <Select
              placeholder="Code"
              isCode
              allowCmdsContext
              className="p-[unset]"
              value={selectedAttributes["v-if"]}
              codeProps={{
                language: "javascript",
                onMount(mEditor) {
                  mEditor.setValue(js_beautify(selectedAttributes["v-if"]));
                },
                onChange(value) {
                  handleAddingAttributes(value, "v-if");
                  // editor.getSelected().addAttributes({
                  //   "v-if": value,
                  // });
                  // editor.trigger(InfinitelyEvents.directives.update);
                },
              }}
            />
          </section>
        </AccordionItem>

        {/* <AccordionItem title={"teleport"}>
            <section className="mt-2">
              <Input
                placeholder="Selector"
                className="w-full bg-slate-800"
                value={selectedAttributes["x-teleport"]}
                onInput={(ev) => {
                  // editor.getSelected().addAttributes({
                  //   "x-teleport": ev.target.value,
                  // });
                  // editor.trigger(InfinitelyEvents.directives.update);
                  handleAddingAttributes(ev.target.value, "x-teleport");
                }}
              />
            </section>
          </AccordionItem> */}

        {cmds.map((cmd, i) => {
          return (
            <AccordionItem
              title={cmd.name}
              key={i}
              className={`${
                Object.keys(selectedAttributes).includes(cmd.directive)
                  ? "border-l-2 border-l-blue-600"
                  : ""
              }`}
            >
              {cmd.type == "object" && (
                <section className="flex gap-2 mt-2">
                  <Select
                    isCode
                    allowCmdsContext
                    className="p-[unset]"
                    value={
                      getDirectiveContext(selectedAttributes, cmd.directive)?.[
                        cmd.directive
                      ]?.value
                    }
                    placeholder="Code..."
                    codeProps={{
                      language: cmd.codeLang ? cmd.codeLang : "javascript",
                      onChange(value) {
                        typingTimeout.current &&
                          clearTimeout(typingTimeout.current);
                        typingTimeout.current = setTimeout(() => {
                          cmd.callback({
                            value: objectSplitter(value),
                            editor,
                            callback() {
                              const clone = [];
                            },
                          });
                          console.log(objectSplitter(value));
                        }, 300);
                      },
                      onMount(monacEditor) {
                        monacEditor.setValue(
                          js_beautify(
                            `(${
                              getDirectiveContext(
                                selectedAttributes,
                                cmd.directive
                              )?.[cmd.directive]?.value ||
                              `{
                              
                              }`
                            })`
                          )
                        );
                        monacEditor.setPosition({
                          lineNumber: 3, // Line 3 (1-based: "`" is line 1, empty line is line 2, "here" is line 3)
                          column: 1, // Column 1 (start of "here")
                        });

                        // Optional: Ensure the caret is visible by revealing the position
                        monacEditor.revealPosition({
                          lineNumber: 3,
                          column: 1,
                        });
                      },
                    }}
                  />
                </section>
              )}

              {cmd.type == "code" && (
                <section className="flex gap-2 mt-2">
                  <Select
                    isCode
                    allowCmdsContext
                    className="p-[unset]"
                    placeholder="Code..."
                    value={
                      getDirectiveContext(selectedAttributes, cmd.directive)?.[
                        cmd.directive
                      ]?.value
                    }
                    codeProps={{
                      // value: js_beautify(
                      //   `${
                      //     getDirectiveContext(
                      //       editor?.getSelected?.(),
                      //       cmd.directive
                      //     )?.[cmd.directive]?.value || ""
                      //   }`
                      // ),
                      language: cmd.codeLang ? cmd.codeLang : "javascript",
                      onChange(value) {
                        typingTimeout.current &&
                          clearTimeout(typingTimeout.current);
                        typingTimeout.current = setTimeout(() => {
                          console.log(value);

                          cmd.callback({
                            value: value,
                            editor,
                          });
                          console.log(value);
                        }, 300);
                      },
                      onMount(mEditor) {
                        mEditor.setValue(
                          js_beautify(
                            `${
                              getDirectiveContext(
                                selectedAttributes,
                                cmd.directive
                              )?.[cmd.directive]?.value || ""
                            }`
                          )
                        );
                        mEditor.setPosition({
                          lineNumber: 3, // Line 3 (1-based: "`" is line 1, empty line is line 2, "here" is line 3)
                          column: 1, // Column 1 (start of "here")
                        });

                        // Optional: Ensure the caret is visible by revealing the position
                        mEditor.revealPosition({
                          lineNumber: 3,
                          column: 1,
                        });
                      },
                    }}
                  />
                </section>
              )}

              {cmd.type == "multi" && (
                <section className="flex flex-col gap-2 mt-2 p-2">
                  <Select
                    // label="Suffix"
                    keywords={cmd.keywordsForMulti}
                    placeholder={isRequired("Add Suffix", cmd.isSuffixRequired)}
                    value={cmd.suffixValue}
                    onAll={(value) => {
                      addSuffixValue(value, i);
                    }}
                    // onEnterPress={(value) => {
                    //  addValue(value)
                    // }}
                  />
                  {/* <h1 className="text-lg font-semibold text-slate-200 capitalize">modifiers :</h1> */}
                  <section className="flex gap-2 ">
                    <Select
                      // label="modifier"
                      keywords={cmd.modifiers}
                      placeholder={isRequired(
                        "Add Modifier",
                        cmd.isModifiersRequired
                      )}
                      value={cmd.modifierValue}
                      onInput={(value) => {
                        // const clone = cloneDeep(cmds);
                        // clone[i].value = value;
                        // setCmds(clone);
                        addModifierValue(value, i);
                      }}
                      onEnterPress={(value) => {
                        // const clone = cloneDeep(cmds);
                        // clone[i].selectedModifiers = [
                        //   ...(clone?.[i]?.selectedModifiers || []),
                        //   value,
                        // ];
                        // setCmds(clone);
                        addModifier(value, i);
                        // cmd.callback({ value, editor });
                      }}
                      onItemClicked={(value) => {
                        addModifier(value, i);
                      }}
                      // onItemClicked={}
                    />
                    <SmallButton
                      onClick={(ev) => {
                        addModifier(cmd.modifierValue, i);
                      }}
                    >
                      {Icons.plus("white")}
                    </SmallButton>
                  </section>
                  {cmd?.selectedModifiers && !!cmd.selectedModifiers.length && (
                    <Choices
                      keywords={cmd.selectedModifiers || []}
                      onCloseClick={(ev, keyword) => {
                        removeModifier(keyword, i);
                      }}
                    />
                  )}

                  {cmd.valueInputType == "input" && (
                    <Input
                      placeholder={isRequired("Add Value", cmd.isValueRequired)}
                      className="bg-slate-800 py-3"
                      value={cmd.value}
                      onInput={(ev) => {
                        addValue(ev.target.value, i);
                      }}
                    />
                  )}

                  {cmd.valueInputType == "code" && (
                    <Select
                      value={cmd.value}
                      isCode
                      allowCmdsContext
                      placeholder={isRequired("Add Value", cmd.isValueRequired)}
                      codeProps={{
                        language: cmd.codeLang || "text",
                        onChange(value) {
                          addValue(value, i);
                        },
                      }}
                    />
                  )}

                  {/* <h1 className="text-slate-200 font-semibold capitalize">Value:</h1> */}
                  {cmd.valueInputType == "select" && (
                    <Select
                      value={cmd.value}
                      placeholder={isRequired("Add Value", cmd.isValueRequired)}
                      onAll={(value) => {
                        addValue(value, i);
                      }}
                    />
                  )}

                  <Button
                    className="w-[40%] self-end px-5 py-2 flex items-center justify-center"
                    onClick={() => {
                      const isValue = cmd.isValueRequired && !cmd.value;
                      const isSuffix = cmd.isSuffixRequired && !cmd.suffixValue;
                      const ismodifiers =
                        cmd.isModifiersRequired &&
                        !cmd.selectedModifiers &&
                        !cmd.selectedModifiers.length;
                      if (isValue || isSuffix || ismodifiers) {
                        toast.error(
                          <ToastMsgInfo
                            msg={`Please fill all required fields`}
                          />
                        );
                        return;
                      }
                      cmd.callback({
                        editor,
                        value: cmd.value,
                        suffix: cmd.suffixValue,
                        modifiers: cmd.selectedModifiers,
                        callback() {
                          const clone = cloneDeep(cmds);
                          clone[i].suffixValue = "";
                          clone[i].selectedModifiers = [];
                          clone[i].value = "";
                          clone[i].modifierValue = "";
                          setCmds(clone);
                        },
                      });
                    }}
                  >
                    {Icons.plus("white")}
                    Add
                  </Button>

                  {/* childs  */}
                  {Object.keys(
                    getDirectiveContext(selectedAttributes, cmd.directive)
                  ).map((key, x) => {
                    const obj = getDirectiveContext(
                      selectedAttributes,
                      cmd.directive
                    );
                    console.log("nested : ", cmd.nestedInputType);

                    return (
                      <section
                        className="flex  gap-2 p-2 bg-slate-800 rounded-lg"
                        key={x}
                      >
                        <a
                          id={`${cmd.directive}-${x}`}
                          className="cursor-pointer text-slate-200 self-center font-semibold w-[30%] custom-font-size overflow-hidden text-ellipsis"
                        >
                          {key}
                        </a>
                        <Tooltip
                          anchorSelect={`#${cmd.directive}-${x}`}
                          className="z-[100] max-w-[40%] whitespace-pre-wrap break-all text-lg"
                          opacity={1}
                          place="top-start"
                          positionStrategy="fixed"
                          float
                        >
                          <h1>{cmd.directive}</h1>
                          <ul>
                            {obj[key]?.suffixes?.map((suffix, z) => (
                              <li key={z}>{suffix}</li>
                            ))}
                          </ul>
                          <ul>
                            {obj[key]?.modifires?.map((modifire, y) => (
                              <li key={y}>{modifire}</li>
                            ))}
                          </ul>
                        </Tooltip>

                        {cmd.nestedInputType == "input" && (
                          <Input
                            placeholder="Value"
                            value={obj[key].value}
                            onInput={(ev) => {
                              // cmd.nestedCallback({
                              //   editor,
                              //   targetAttribute: key,
                              //   value: ev.target.value,
                              // });

                              typingTimeout.current &&
                                clearTimeout(typingTimeout.current);
                              typingTimeout.current = setTimeout(() => {
                                cmd.nestedCallback({
                                  editor,
                                  targetAttribute: key,
                                  value: ev.target.value,
                                });
                              });
                            }}
                          />
                        )}

                        {cmd.nestedInputType == "code" && (
                          <Select
                            isCode
                            allowCmdsContext
                            placeholder="Value"
                            value={obj[key].value}
                            codeProps={{
                              language: cmd.nestedCodeLang || "text",
                              onChange(value) {
                                typingTimeout.current &&
                                  clearTimeout(typingTimeout.current);
                                typingTimeout.current = setTimeout(() => {
                                  cmd.nestedCallback({
                                    editor,
                                    targetAttribute: key,
                                    value: value,
                                  });
                                }, 300);
                              },
                              onMount(mEditor) {
                                mEditor.setValue(js_beautify(obj[key].value));
                              },
                            }}
                          />
                        )}

                        {cmd.nestedInputType == "select" && (
                          <Select
                            placeholder="Value"
                            value={obj[key].value}
                            keywords={cmd.nestedInputKeywords || []}
                            onAll={(value) => {
                              typingTimeout.current &&
                                clearTimeout(typingTimeout.current);
                              typingTimeout.current = setTimeout(() => {
                                cmd.nestedCallback({
                                  editor,
                                  targetAttribute: key,
                                  value: value,
                                });
                              });
                            }}
                          />
                        )}

                        <SmallButton
                          onClick={(ev) => {
                            removeAttribute(key);
                          }}
                        >
                          {Icons.trash("white")}
                        </SmallButton>
                      </section>
                    );
                  })}
                  {/* <div className="w-full p-2 bg-slate-800 rounded-lg min-h-[40px]"></div> */}
                </section>
              )}
            </AccordionItem>
          );
        })}
      </InfAccordion>
    </section>
  );
});
