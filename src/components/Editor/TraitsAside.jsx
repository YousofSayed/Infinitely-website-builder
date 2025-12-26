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
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  asideControllersNotifiresState,
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
import { editorComponentProps, inf_build_url } from "../../constants/shared";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { CodeEditor } from "./Protos/CodeEditor";
import { parseHTML } from "linkedom";
import {
  doDocument,
  generateBeautifulHexColor,
  getCurrentMediaDevice,
  getMediaBreakpoint,
  getProjectData,
  getProjectSettings,
  initToolbar,
  isValidAttribute,
  preventSelectNavigation,
} from "../../helpers/functions";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
// import { InfAccordion } from "../Protos/InfAccordion";
// import { AccordionItem } from "@heroui/accordion";
import { FitTitle } from "./Protos/FitTitle";
import { SwitchButton } from "../Protos/SwitchButton";
import { isBoolean, isFunction, isString } from "lodash";
import { addClickClass, parse, stringify } from "../../helpers/cocktail";
import { useCmdsContext } from "../../hooks/useCmdsContext";
import { useLiveQuery } from "dexie-react-hooks";
import { Popover } from "./Popover";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../Protos/VirtusoGridComponent";
import { FileView } from "../Protos/FileView";
import { ChooseFile } from "../Protos/ChooseFile";
import { AccordionItem } from "../Protos/AccordionItem";
import { Accordion } from "../Protos/Accordion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Hint } from "../Protos/Hint";

export const TraitsAside = () => {
  const editor = useEditorMaybe();
  const [newAttributeName, setNewAttributeName] = useState("");
  const [traits, setTraits] = useState(traitsType);
  const [mediaBreakpoint, setMediaBreakpoint] = useState();
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
  const [traitsAnimate] = useAutoAnimate();
  const [notify, setNotify] = useRecoilState(asideControllersNotifiresState);

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
    const handler = () => {
      // console.log('traits : ' ,editor.getSelected().getTraits());

      setCmpTextContent(editor.getSelected().getInnerHTML());
      const buildFileName = selectedEl.getAttributes()[inf_build_url];
      const contentLangType =
        selectedEl.getAttributes()["content-lang"] || "html";
      setFileName(buildFileName);
      setSelectedCmp(selectedEl);

      const innerHtml = selectedEl.props().editable
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
      setSelectedCmp(editor?.getSelected?.());
      getAndSetTraits();
      setCmdsContext();
    };
    handler();
    editor.on(InfinitelyEvents.component.update_content, handler);

    return () => {
      editor.off(InfinitelyEvents.component.update_content, handler);
    };
  }, [selectedEl, editor]);

  useEffect(() => {
    if (!editor) return;
    const getAndSetMediaBreakpoint = () => {
      console.log("getMediaBreakpoint(editor) : ", getMediaBreakpoint(editor));

      setMediaBreakpoint(getMediaBreakpoint(editor));
    };
    getAndSetMediaBreakpoint(editor);
    editor.on("change:device", getAndSetMediaBreakpoint);
    return () => {
      editor.off("change:device", getAndSetMediaBreakpoint);
    };
  }, [editor]);

  useEffect(() => {
    const selectedEl = editor?.getSelected?.();
    console.log("sldoslso");

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
  }, [editor, selectedEl]);

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
    // delete elementAttributes["id"];
    delete elementAttributes["class"];

    return elementAttributes;
  };

  const getAndSetTraits = () => {
    const sle = editor.getSelected();

    const traits = sle
      .getTraits()
      .filter((tr) => tr.attributes.role)
      .map((tr) => tr.attributes);

    const elementAttributes = sle.getAttributes();

    traits.forEach((trait) => {
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

    delete elementAttributes["class"];
    setTraits(traits);
    if (Object.keys(elementAttributes).length) {
      setNotify((old) => ({ ...old, elementAttributes: true }));
    }
    setAttributes(elementAttributes);
    console.log("traits is me : ", traits);
  };

  const updateTraitValue = ({ name = "", key = "", value = "" }) => {
    const sle = editor.getSelected();
    // sle.updateTrait(name, { [key]: value });
    const trait = sle.getTrait(name);

    // trait.set({
    //   [key]: value,
    // });
    trait.set(key, value);

    console.log(trait);

    const role = trait.get("role");
    if (role == "attribute") {
      console.log("this is attribute");

      sle.addAttributes({
        [name]: isString(value) ? value : JSON.stringify(trait.get("value")),
      });
    }
    // isString(value) ? value : JSON.stringify(trait.get("value"))
    // sle.addAttributes({ [name]: isString(value) ? value : stringify(value) });
    editor.trigger("trait:value");
    console.log("update should be done");
  };

  const addAttribute = ({ key, value }) => {
    const sle = editor.getSelected();
    const type = sle.get("type").toLowerCase();
    if (isValidAttribute(key, value)) {
      sle.addAttributes({ [key]: value || "" }, { partial: true });
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
    // if (type == "video" || type == "iframe" || type == "source") {
    //   const newSle = sle.replaceWith(sle.clone())[0];
    //   getProjectSettings().set({
    //     navigate_to_style_when_Select: false,
    //   });
    //   editor.select(newSle);
    //   getProjectSettings().set({
    //     navigate_to_style_when_Select: true,
    //   });
    // }
  };

  return (
    <section className="flex flex-col gap-2 h-full mt-2">
      <Accordion>
        {/* <AsideControllers /> */}
        <AccordionItem title={"Type Content"}>
          <section className="flex flex-col gap-2 p-1 bg-slate-900 rounded-lg">
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
                    codeSettings.defaultLanguage == "javascript" &&
                    "bg-blue-600"
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
                value:
                  codeSettings.defaultLanguage == "html" &&
                  !codeSettings.enableTemplateEngine
                    ? codeSettings.htmlValueState ||
                      codeSettings.templateEngineValueState
                    : codeSettings.defaultLanguage == "javascript" &&
                      codeSettings.enableTemplateEngine
                    ? `\`${codeSettings.templateEngineValueState}\``
                    : "",
                // value: codeSettings.htmlValueState || codeSettings.templateEngineValueState,
                // onMount(ed, mon) {
                //   // console.log("mouted", ed, mon);
                //   setCmdsContext();
                //   if (
                //     codeSettings.defaultLanguage == "html" &&
                //     !codeSettings.enableTemplateEngine
                //   ) {
                //     ed.setValue(
                //       codeSettings.htmlValueState ||
                //         codeSettings.templateEngineValueState
                //     );
                //     // setCodeSettings({
                //     //   ...codeSettings,
                //     //   htmlValueState: selectedValue,
                //     // });
                //   } else if (
                //     codeSettings.defaultLanguage == "javascript" &&
                //     codeSettings.enableTemplateEngine
                //   ) {
                //     const templateEngineValue = `\`${codeSettings.templateEngineValueState}\``;
                //     ed.setValue(templateEngineValue);
                //     // setCodeSettings({
                //     //   ...codeSettings,
                //     //   templateEngineValueState: templateEngineValue,
                //     // });
                //   }
                // },
                onChange(value) {
                  const sle = editor.getSelected();
                  const type = sle.get("type");
                  console.log(
                    type,
                    sle.isInstanceOf("text"),
                    sle.props().editable
                  );

                  if (!sle.props().editable) return;

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

        <AccordionItem title={"Props (Advanced)"}>
          <ul className="flex flex-col gap-2 p-1 bg-slate-900 rounded-lg">
            {editorComponentProps
              .map((prop) =>
                selectedCmp ? [prop, selectedCmp?.props()[prop]] : null
              )
              .filter(Boolean)
              .map(([prop, val], i) => {
                return (
                  <li
                    key={i}
                    className="p-1 bg-slate-800 rounded-lg flex items-center justify-between gap-2"
                  >
                    <FitTitle className="custom-font-size">{prop}</FitTitle>
                    <SwitchButton
                      defaultValue={val}
                      onSwitch={(value) => {
                        console.log("switch : ", value);

                        const selectedCmp = editor.getSelected();

                        selectedCmp.set(prop, value);
                        // console.log(
                        //   "switch after set: ",
                        //   selectedCmp.get(prop),
                        //   selectedCmp.props()
                        // );
                        selectedCmp.view.render();
                        editor.trigger("component:update", selectedCmp);

                        // editor.refresh({tools:true});
                        // const newCmp = selectedCmp.clone();
                        initToolbar(editor, selectedCmp);
                        // selectedCmp.replaceWith(newCmp);
                        // preventSelectNavigation(editor, newCmp);
                        editor.trigger(InfinitelyEvents.layers.update);
                        editor.trigger(InfinitelyEvents.component.update_content);
                      }}
                    />
                  </li>
                );
              })}
          </ul>
        </AccordionItem>

        {!!traits.length && (
          <AccordionItem title={"Traits"} notify={notify.traits}>
            <ul
              ref={traitsAnimate}
              className="p-1 flex flex-col gap-2 bg-slate-900 rounded-lg"
            >
              <MiniTitle className={`py-3 w-full`}>Traits</MiniTitle>

              {traits.map((trait, i) => {
                // console.log("trait type:", trait);
                // console.log("is function ? ", isFunction(trait?.showCallback));
                /**
                 * @type {import('../../helpers/types').TraitCallProps}
                 */
                const mainCallbackProps = {
                  editor,
                  trait,
                  traits,
                  mediaBreakpoint: mediaBreakpoint,
                  model: editor.getSelected(),
                  oldValue: trait.value,
                };
                // console.log(
                //   isBoolean(trait.value || trait.default)
                //     ? trait.value || trait.default
                //     : Boolean(parse(trait.value || trait.default)),
                //   trait.name,
                //   trait.value
                // );
                trait?.mustValue && (trait.value = trait.mustValue);
                isFunction(trait.value) &&
                  (trait.value = trait.value({
                    attributes: selectedCmp.getAttributes(),
                  }));
                const isShow =
                  trait?.showCallback && isFunction(trait?.showCallback)
                    ? isBoolean(trait?.showCallback?.(trait))
                      ? Boolean(trait?.showCallback?.(trait))
                      : Boolean(parse(trait?.showCallback?.(trait)))
                    : true;

                return isShow ? (
                  <li
                    key={i}
                    style={{
                      marginLeft:
                        trait.isChild && trait?.nestedKeys?.length
                          ? `${
                              trait.isChild && trait?.nestedKeys?.length * 0.5
                            }rem`
                          : "",
                    }}
                    className={`relative flex  ${
                      !["switch"].includes(trait.type) ? "flex-col" : ""
                    } justify-between items-center gap-2 bg-slate-950 p-2 rounded-lg `}
                  >
                    {/* <h1 className="text-[14px!important] px-2 text-white capitalize font-semibold">
                    {trait.name}
                  </h1> */}
                    {trait.hint ? (
                      <Hint>
                        {isFunction(trait.hint)
                          ? trait.hint({ ...mainCallbackProps })
                          : trait.hint}
                      </Hint>
                    ) : null}
                    {trait.label && (
                      <FitTitle className="custom-font-size self-stretch flex justify-center  items-center">
                        {trait.label}
                      </FitTitle>
                    )}

                    {(trait.type == "text" || trait.type == "number") &&
                      isShow && (
                        <Input
                          type={trait.type || "text"}
                          value={trait.value || trait.default || ""}
                          placeholder={trait.placeholder || trait.label}
                          className="py-2 w-full bg-slate-800"
                          onInput={(ev) => {
                            updateTraitValue({
                              name: trait.name,
                              key: "value",
                              value: ev.target.value,
                            });

                            trait.callback &&
                              trait.callback({
                                // editor,
                                // trait,
                                ...mainCallbackProps,
                                mediaBreakpoint,
                                newValue: ev.target.value,
                              });
                            trait.command && editor.runCommand(trait.command);

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
                          updateTraitValue({
                            name: trait.name,
                            key: "value",
                            value,
                          });

                          trait.callback &&
                            trait.callback({
                              // editor,
                              // trait,
                              ...mainCallbackProps,
                              newValue: value,
                            });
                          trait.command && editor.runCommand(trait.command);
                        }}
                      />
                    )}

                    {trait.type == "textarea" && isShow && (
                      <Select
                        placeholder={trait.placeholder || trait.label}
                        // keywords={trait.keywords}
                        value={trait.value || trait.default || ""}
                        allowCmdsContext={trait?.allowCmdsContext}
                        allowRestAPIModelsContext={trait?.allowCmdsContext}
                        isCode
                        codeProps={{
                          language: trait.textareaLanguage || "text",
                          value: trait.allowToSetTraitValueToEditor
                            ? trait.value
                            : "",
                          ...(trait?.codeEditorProps || {}),
                          onMount(ed, mon) {
                            trait?.onMountHandler?.(ed, mon);
                          },
                          onChange(value) {
                            updateTraitValue({
                              name: trait.name,
                              key: "value",
                              value,
                            });
                            trait?.onChangeHandler?.(value);
                            trait.callback &&
                              trait.callback({
                                // editor,
                                // trait,
                                ...mainCallbackProps,
                                // oldValue: trait.value,
                                newValue: value,
                              });

                            trait.command && editor.runCommand(trait.command);
                          },
                        }}
                      />
                    )}

                    {trait.type == "add-props" && isShow && (
                      <section className="flex justify-between w-full items-center flex-wrap gap-2">
                        <section className="flex justify-between gap-2 w-full">
                          <Select
                            placeholder={trait.placeholder || trait.label}
                            className="w-full bg-slate-800"
                            value={trait.stateProp}
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

                              updateTraitValue({
                                name: trait.name,
                                key: "value",
                                value: newVal,
                              });

                              trait.callback &&
                                trait.callback({
                                  // editor,
                                  // trait,
                                  ...mainCallbackProps,
                                  // oldValue: trait.value,
                                  newValue: newVal,
                                });
                              trait.command && editor.runCommand(trait.command);
                            }}
                            onItemClicked={(value) => {
                              const newVal = stringify({
                                ...parse(trait.value || {}),
                                [value]: "",
                              });

                              updateTraitValue({
                                name: trait.name,
                                key: "value",
                                value: newVal,
                              });

                              trait.callback &&
                                trait.callback({
                                  // editor,
                                  // trait,
                                  ...mainCallbackProps,
                                  // oldValue: trait.value,
                                  newValue: newVal,
                                });

                              trait.command && editor.runCommand(trait.command);
                            }}
                          />
                          <SmallButton
                            onClick={() => {
                              const newVal = stringify({
                                ...parse(trait.value || {}),
                                [trait.stateProp]: "",
                              });

                              updateTraitValue({
                                name: trait.name,
                                key: "value",
                                value: newVal,
                              });

                              trait.callback &&
                                trait.callback({
                                  // editor,
                                  // trait,
                                  ...mainCallbackProps,
                                  // oldValue: trait.value,
                                  newValue: newVal,
                                });
                              trait.command && editor.runCommand(trait.command);
                            }}
                          >
                            {Icons.plus("white")}
                          </SmallButton>
                        </section>

                        {Boolean(
                          Object.entries(
                            parse(trait.value || trait.default) || {}
                          ).length
                        ) && (
                          <section className="flex flex-col gap-2 w-full">
                            {Object.entries(
                              parse(trait.value || trait.default) || {}
                            ).map(([key, value], i) => {
                              return (
                                <section
                                  key={i}
                                  className="flex flex-col gap-2"
                                >
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

                                          updateTraitValue({
                                            name: trait.name,
                                            key: "value",
                                            value: newVal,
                                          });

                                          trait.callback &&
                                            trait.callback({
                                              // editor,
                                              // trait,
                                              ...mainCallbackProps,
                                              // oldValue: trait.value,
                                              newValue: newVal,
                                            });

                                          trait.command &&
                                            editor.runCommand(trait.command);
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
                                            trait.addPropsCodeLanguage ||
                                            "text",
                                          value: value || "",
                                          onChange: (value) => {
                                            const newVal = stringify({
                                              ...parse(trait.value || {}),
                                              [key]: value,
                                            });

                                            updateTraitValue({
                                              name: trait.name,
                                              key: "value",
                                              value: newVal,
                                            });

                                            trait.callback &&
                                              trait.callback({
                                                editor,
                                                // oldValue: trait.value,
                                                newValue: newVal,
                                                trait,
                                              });

                                            trait.command &&
                                              editor.runCommand(trait.command);
                                          },
                                        }}
                                      />
                                    )}

                                    <SmallButton
                                      onClick={() => {
                                        isFunction(trait.deleteCallback) &&
                                          trait.deleteCallback({
                                            ...mainCallbackProps,
                                            newValue: key,
                                          });
                                        // const parsedVal = parse(
                                        //   trait.value || {}
                                        // );
                                        // delete parsedVal[key];
                                        // const newVal = stringify({
                                        //   ...parsedVal,
                                        // });

                                        // updateTraitValue({
                                        //   name: trait.name,
                                        //   key: "value",
                                        //   value: newVal,
                                        // });

                                        // trait.callback &&
                                        //   trait.callback({
                                        //     editor,
                                        //     // oldValue: trait.value,
                                        //     newValue: newVal,
                                        //   });
                                        // trait.command &&
                                        //   editor.runCommand(trait.command);
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
                        )}
                      </section>
                    )}

                    {trait.type.toLowerCase() == "switch" && isShow && (
                      <SwitchButton
                        defaultValue={
                          isBoolean(trait.value || trait.default)
                            ? trait.value || trait.default
                            : Boolean(parse(trait.value || trait.default))
                        }
                        onSwitch={(value) => {
                          updateTraitValue({
                            name: trait.name,
                            key: "value",
                            value,
                          });

                          trait.callback &&
                            trait.callback({
                              ...mainCallbackProps,
                              newValue: value,
                            });
                          trait.onSwitch && trait.onSwitch(value);
                          trait.command && editor.runCommand(trait.command);
                          console.log("switch :", value);
                        }}
                        // onActive={() => {
                        //   trait?.onSwitch?.(true);
                        //   trait.command && editor.runCommand(trait.command);
                        //   updateTraitValue({
                        //     name: trait.name,
                        //     key: "value",
                        //     value: true,
                        //   });
                        // }}
                        // onUnActive={() => {
                        //   trait?.onSwitch?.(false);
                        //   trait.command && editor.runCommand(trait.command);
                        //   updateTraitValue({
                        //     name: trait.name,
                        //     key: "value",
                        //     value: false,
                        //   });
                        // }}
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
                        ext={trait.ext}
                        placeholder={trait.placeholder || trait.label}
                        mediaType={trait.mediaType}
                        callback={(asset, url) => {
                          updateTraitValue({
                            name: trait.name,
                            key: "value",
                            value: url,
                          });
                          trait.callback({
                            // editor,
                            // trait,
                            ...mainCallbackProps,
                            newValue: url,
                            // oldValue: trait.value,
                            asset: asset,
                          });
                          console.log("url : ", url);

                          trait?.command && editor.runCommand(trait.command);
                        }}
                      />
                    )}

                    {trait.type.toLowerCase() == "custom" && isShow ? (
                      <trait.component />
                    ) : null}
                  </li>
                ) : null;
              })}
            </ul>
          </AccordionItem>
        )}

        <AccordionItem title={"Attributes"} notify={notify.elementAttributes}>
          <section className="p-1 flex flex-col gap-2 bg-slate-900 rounded-lg">
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
      </Accordion>
    </section>
  );
};
