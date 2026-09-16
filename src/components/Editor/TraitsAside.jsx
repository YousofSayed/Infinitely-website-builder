import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import {
  editorComponentProps,
  inf_build_url,
  inf_tokens_ignore,
} from "@/constants/shared";
import {
  asideControllersNotifiresState,
  currentElState,
} from "@/helpers/atoms";
import { addClickClass, parse, stringify } from "@/helpers/cocktail";
import {
  getMediaBreakpoint,
  getProjectData,
  initToolbar,
  isValidAttribute,
  preventSelectNavigation,
  triggerSymbolEvent,
} from "@/helpers/functions";
import { componentType, traitsType } from "@/helpers/jsDocs";
import { useCmdsContext } from "@/hooks/useCmdsContext";
import { Icons } from "@/components/Icons/Icons";
import { Accordion } from "@/components/Protos/Accordion";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import { Button } from "@/components/Protos/Button";
import { ChooseFile } from "@/components/Protos/ChooseFile";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Hint } from "@/components/Protos/Hint";
import { SwitchButton } from "@/components/Protos/SwitchButton";
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import { isBoolean, isFunction, isString, throttle } from "lodash";
import React, {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "react-toastify";
import { Virtuoso } from "react-virtuoso";
import { useRecoilState, useRecoilValue } from "recoil";
import { ShowIf } from "../ShowIf";
import { VList } from "virtua";

/**
 * PERFORMANCE FIX:
 *
 * Trait updates were triggering layers.update synchronously every keystroke.
 * That caused layers panel to re-render while typing.
 *
 * We throttle it.
 */
const triggerLayersUpdate = throttle(
  (editor) => {
    editor?.trigger?.(InfinitelyEvents.layers.update);
  },
  250,
  { leading: false, trailing: true },
);

const TraitItem = memo(({ trait, traits, mediaBreakpoint }) => {
  const editor = useEditorMaybe();

  const traitType = String(trait?.type || "").toLowerCase();

  /**
   * Keep same callback shape as your old logic.
   */
  const mainCallbackProps = useMemo(() => {
    return {
      editor,
      trait,
      traits,
      mediaBreakpoint: mediaBreakpoint,
      model: editor?.getSelected?.(),
      oldValue: trait.value,
    };
  }, [editor, trait, traits, mediaBreakpoint]);

  const updateTraitValue = ({ name = "", key = "", value = "" }) => {
    const sle = editor?.getSelected?.();
    if (!sle) return;

    const currentTrait = sle.getTrait(name);
    if (!currentTrait) return;

    currentTrait.set(key, value);

    const role = currentTrait.get("role");

    if (role == "attribute") {
      sle.addAttributes({
        [name]: isString(value)
          ? value
          : JSON.stringify(currentTrait.get("value")),
      });
    }

    /**
     * PERFORMANCE FIX:
     * old: editor.trigger(InfinitelyEvents.layers.update)
     *
     * Now throttled.
     */
    triggerLayersUpdate(editor);
  };

  return (
    <li
      inf-tokens-container="true"
      style={{
        marginLeft:
          trait.isChild && trait?.nestedKeys?.length
            ? `${trait.nestedKeys.length * 0.5}rem`
            : undefined,
      }}
      /**
       * PERFORMANCE FIX:
       * removed animate-go-to.
       * Animation on every trait item is expensive.
       */
      className={`relative animate-go-to flex mt-2 ${
        !["switch"].includes(traitType) ? "flex-col" : ""
      } justify-between items-center gap-2 bg-surface-main p-2 rounded-lg`}
    >
      {trait.hint ? (
        <Hint>
          {isFunction(trait.hint)
            ? trait.hint({ ...mainCallbackProps })
            : trait.hint}
        </Hint>
      ) : null}

      {trait.label && (
        <FitTitle className="custom-font-size self-stretch flex justify-center items-center">
          {trait.label}
        </FitTitle>
      )}

      {(traitType == "text" || traitType == "number") && (
        <Input
          type={trait.type || "text"}
          value={trait.value || trait.default || ""}
          placeholder={trait.placeholder || trait.label}
          className="py-2 w-full bg-surface-tertiary"
          onBlur={(ev) => {
            trait?.onBlur?.({
              ...mainCallbackProps,
              newValue: ev.target.value,
            });
          }}
          onInput={(ev) => {
            updateTraitValue({
              name: trait.name,
              key: "value",
              value: ev.target.value,
            });

            trait.callback &&
              trait.callback({
                ...mainCallbackProps,
                mediaBreakpoint,
                newValue: ev.target.value,
              });

            trait.command && editor.runCommand(trait.command);
          }}
        />
      )}

      {traitType == "select" && (
        <Select
          placeholder={trait.placeholder || trait.label}
          keywords={trait.keywords}
          onBlur={(ev) => {
            trait?.onBlur?.({
              ...mainCallbackProps,
              newValue: ev.target.value,
            });
          }}
          value={trait.value || trait.default || ""}
          onAll={(value) => {
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

            trait.command && editor.runCommand(trait.command);
          }}
        />
      )}

      {traitType == "textarea" && (
        <Select
          placeholder={trait.placeholder || trait.label}
          value={trait.value || trait.default || ""}
          allowCmdsContext={trait?.allowCmdsContext}
          allowRestAPIModelsContext={trait?.allowCmdsContext}
          isCode
          codeProps={{
            language: trait.textareaLanguage || "text",
            value: trait.allowToSetTraitValueToEditor ? trait.value : "",
            ...(trait?.codeEditorProps || {}),
            onMount(ed, mon) {
              trait?.onMountHandler?.(ed, mon);

              ed?.onDidBlurEditorWidget?.((e) => {
                trait?.onBlur?.({
                  ...mainCallbackProps,
                  newValue: ed.getValue(),
                });
              });
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
                  ...mainCallbackProps,
                  newValue: value,
                });

              trait.command && editor.runCommand(trait.command);
            },
          }}
        />
      )}

      {traitType == "add-props" && (
        <section className="flex justify-between w-full items-center flex-wrap gap-2">
          <section className="flex justify-between gap-2 w-full">
            <Select
              placeholder={trait.placeholder || trait.label}
              className="w-full bg-surface-tertiary"
              value={trait.stateProp}
              /**
               * trait.keywords is already computed in visibleTraits.
               */
              keywords={trait.keywords || []}
              onInput={(value) => {
                updateTraitValue({
                  name: trait.name,
                  key: "stateProp",
                  value,
                });
              }}
              onBlur={(ev) => {
                trait?.onBlur?.({
                  ...mainCallbackProps,
                  newValue: ev.target.value,
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
                    ...mainCallbackProps,
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
                    ...mainCallbackProps,
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
                    ...mainCallbackProps,
                    newValue: newVal,
                  });

                trait.command && editor.runCommand(trait.command);
              }}
            >
              {Icons.plus("white")}
            </SmallButton>
          </section>

          {Boolean(
            Object.entries(parse(trait.value || trait.default) || {}).length,
          ) && (
            <section className="flex flex-col gap-2 w-full">
              {Object.entries(parse(trait.value || trait.default) || {}).map(
                ([key, value], i) => {
                  return (
                    <section key={i} className="flex flex-col gap-2">
                      <FitTitle>{key}</FitTitle>

                      <section className="flex gap-2">
                        {(trait.addPropsInputType == "text" ||
                          !trait.addPropsInputType) && (
                          <Input
                            placeholder={key}
                            className="w-full bg-surface-tertiary"
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
                                  ...mainCallbackProps,
                                  newValue: newVal,
                                });

                              trait.command && editor.runCommand(trait.command);
                            }}
                          />
                        )}

                        {trait.addPropsInputType == "code" && (
                          <Select
                            placeholder={key}
                            value={value || ""}
                            isCode
                            allowCmdsContext
                            allowRestAPIModelsContext
                            codeProps={{
                              language: trait.addPropsCodeLanguage || "text",
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
                                    ...mainCallbackProps,
                                    newValue: newVal,
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
                          }}
                          className="[&_path]:stroke-white bg-surface-tertiary hover:bg-[crimson!important]"
                        >
                          {Icons.trash()}
                        </SmallButton>
                      </section>
                    </section>
                  );
                },
              )}
            </section>
          )}
        </section>
      )}

      {traitType == "switch" && (
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
          }}
        >
          {trait.label}
        </SwitchButton>
      )}

      {traitType == "button" && (
        <Button
          className="flex justify-center items-center py-2 w-full"
          {...(trait.buttonEvents?.({ editor, trait }) || {})}
        >
          {trait.label}
        </Button>
      )}

      {traitType == "media" && (
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

            trait.callback?.({
              ...mainCallbackProps,
              newValue: url,
              asset: asset,
            });

            trait?.command && editor.runCommand(trait.command);
          }}
        />
      )}

      {traitType == "custom" && trait.component ? <trait.component /> : null}
    </li>
  );
});

export const TraitsAside = memo(() => {
  const editor = useEditorMaybe();

  const [newAttributeName, setNewAttributeName] = useState("");
  const [traits, setTraits] = useState(traitsType);
  const [mediaBreakpoint, setMediaBreakpoint] = useState();
  const [attributes, setAttributes] = useState({});
  const [cmpTextContent, setCmpTextContent] = useState("");
  const [selectedCmp, setSelectedCmp] = useState(componentType);
  const [fileName, setFileName] = useState("");

  /**
   * IMPORTANT:
   * We keep currentElState dependency here.
   * This component still depends on your currentElState.
   */
  const selectedEl = useRecoilValue(currentElState);

  const [cmdsContext, setCmdsContext] = useCmdsContext();
  const [projectData, setProjectData] = useState(null);

  const [notify, setNotify] = useRecoilState(asideControllersNotifiresState);

  /**
   * PERFORMANCE FIX:
   *
   * useTransition makes traits rendering lower priority.
   * Selection click stays responsive.
   */
  const [isTraitsPending, startTraitsTransition] = useTransition();

  const [codeSettings, setCodeSettings] = useState({
    defaultLanguage: "html",
    enableTemplateEngine: false,
    htmlValueState: "",
    templateEngineValueState: "",
  });

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    setProjectData(projectData);
  }, []);

  /**
   * Keep same trait visibility logic.
   */
  const visibleTraits = useMemo(() => {
    if (!selectedCmp) return [];

    return traits.filter((trait) => {
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

      trait.keywords = isFunction(trait.keywords)
        ? trait.keywords({ projectData: projectData })
        : trait.keywords || [];

      return isShow;
    });
  }, [traits, selectedCmp, projectData]);

  /**
   * PERFORMANCE FIX:
   *
   * Deferred list prevents trait list from blocking selection.
   */
  const deferredVisibleTraits = useDeferredValue(visibleTraits);

  const getFilterdAttributes = () => {
    const sle = editor.getSelected();
    if (!sle) return {};

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

    delete elementAttributes["class"];

    return elementAttributes;
  };

  const getAndSetTraits = () => {
    const sle = editor.getSelected();
    if (!sle) return;

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
  };

  /**
   * Selection/content update handler.
   *
   * Keep same logic, but wrap heavy traits rendering in startTraitsTransition.
   */
  useEffect(() => {
    if (!editor || !editor.getSelected()) return;

    const handler = () => {
      const selectedEl = editor.getSelected();
      if (!selectedEl) return;

      const buildFileName = selectedEl.getAttributes()[inf_build_url];
      const contentLangType =
        selectedEl.getAttributes()["content-lang"] || "html";

      const innerHtml = selectedEl.props().editable
        ? selectedEl.getInnerHTML()
        : "";

      startTraitsTransition(() => {
        setCmpTextContent(selectedEl.getInnerHTML());
        setFileName(buildFileName);
        setSelectedCmp(selectedEl);

        setCodeSettings((old) => ({
          ...old,
          defaultLanguage: contentLangType,
          htmlValueState: contentLangType == "html" ? innerHtml : "",
          templateEngineValueState:
            contentLangType == "javascript" ? innerHtml : "",
          enableTemplateEngine: contentLangType == "javascript",
        }));

        getAndSetTraits();
        setCmdsContext();
      });
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
      setMediaBreakpoint(getMediaBreakpoint(editor));
    };

    getAndSetMediaBreakpoint(editor);

    editor.on("change:device", getAndSetMediaBreakpoint);

    return () => {
      editor.off("change:device", getAndSetMediaBreakpoint);
    };
  }, [editor]);

  /**
   * PERFORMANCE FIX:
   *
   * trait:value was calling getAndSetTraits synchronously every input.
   * Now throttled + transition.
   */
  useEffect(() => {
    const selectedEl = editor?.getSelected?.();
    if (!editor || !selectedEl) return;

    const callback = throttle(() => {
      startTraitsTransition(() => {
        getAndSetTraits();
      });
    }, 200);

    editor.on("trait:value", callback);

    return () => {
      editor.off("trait:value", callback);
      callback.cancel();
    };
  }, [editor, selectedEl]);

  useEffect(() => {
    if (!editor) return;

    editor.trigger(InfinitelyEvents.traits.start);

    return () => {
      editor.trigger(InfinitelyEvents.traits.end);
    };
  }, [editor]);

  const addAttribute = ({ key, value }) => {
    const sle = editor.getSelected();
    if (!sle) return;

    const type = sle.get("type").toLowerCase();

    if (isValidAttribute(key, value || "")) {
      sle.addAttributes({ [key]: value || "" });
      setAttributes(getFilterdAttributes());

      if (type == "video" || type == "iframe" || type == "source") {
        const newSle = sle.replaceWith(sle.clone())[0];
        preventSelectNavigation(editor, newSle);
      }
    } else {
      toast.error(<ToastMsgInfo msg={`Attribute has invalid character`} />);
    }
  };

  const removeAttribute = (key) => {
    const sle = editor.getSelected();
    if (!sle) return;

    sle.removeAttributes([key]);
    setAttributes(getFilterdAttributes());
  };

  return (
    <section
      className="flex flex-col gap-2 h-full mt-2 animate-go-to auto-animate"
      inf-tokens-container="true"
    >
      <Accordion>
        <AccordionItem title={"Type Content"}>
          <section className="flex flex-col gap-2 p-1 bg-surface-secondary rounded-lg">
            <section className="flex items-center gap-2 justify-between">
              <FitTitle className="custom-font-size">Type Content</FitTitle>

              <nav className="flex items-center gap-3 p-1 px-2 bg-surface-tertiary w-fit rounded-lg self-end text-text-primary">
                <button
                  className={`w-[22.5px] h-[22.5px] cursor-pointer flex items-center justify-center rounded-md transition-colors ${
                    codeSettings.defaultLanguage == "html" && "bg-brand-primary"
                  }`}
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");

                    const sle = editor?.getSelected?.();
                    if (!sle) return;

                    sle.addAttributes({
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
                    "bg-brand-primary"
                  }`}
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");

                    const sle = editor?.getSelected?.();
                    if (!sle) return;

                    sle.addAttributes({
                      "content-lang": "javascript",
                    });

                    setCodeSettings({
                      ...codeSettings,
                      defaultLanguage: "javascript",
                      enableTemplateEngine: true,
                    });
                  }}
                >
                  {"${}"}
                </button>
              </nav>
            </section>

            <Select
              isCode
              className="px-[unset] py-[unset]"
              inputClassName="bg-surface-tertiary"
              containerClassName="bg-surface-tertiary"
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
                value:
                  codeSettings.defaultLanguage == "html" &&
                  !codeSettings.enableTemplateEngine
                    ? codeSettings.htmlValueState ||
                      codeSettings.templateEngineValueState
                    : codeSettings.defaultLanguage == "javascript" &&
                        codeSettings.enableTemplateEngine
                      ? `\`${codeSettings.templateEngineValueState}\``
                      : "",
                onChange(value) {
                  const sle = editor.getSelected();
                  if (!sle) return;

                  if (!sle.props().editable) return;

                  if (
                    !codeSettings.enableTemplateEngine &&
                    codeSettings.defaultLanguage == "html"
                  ) {
                    sle.set({ content: "" });
                    sle.components(`${value}`);

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

                      sle.set({ content: "" });
                      sle.components(newValue);

                      setCodeSettings({
                        ...codeSettings,
                        templateEngineValueState: newValue,
                      });
                    }
                  }

                  editor.refresh();
                  editor.Canvas?.refresh?.();
                  editor.Canvas?.refreshSpots?.();
                },
              }}
            />
          </section>
        </AccordionItem>

        <AccordionItem title={"Props (Advanced)"}>
          <ul className="flex flex-col gap-2 p-1 bg-surface-secondary rounded-lg">
            {editorComponentProps
              .map((prop) =>
                selectedCmp ? [prop, selectedCmp?.props()[prop]] : null,
              )
              .filter(Boolean)
              .map(([prop, val], i) => {
                return (
                  <li
                    key={i}
                    className="p-1 bg-surface-tertiary rounded-lg flex items-center justify-between gap-2"
                  >
                    <FitTitle className="custom-font-size">{prop}</FitTitle>

                    <SwitchButton
                      defaultValue={val}
                      onSwitch={(value) => {
                        const selectedCmp = editor.getSelected();
                        if (!selectedCmp) return;

                        selectedCmp.set(prop, value);
                        selectedCmp.view?.render?.();

                        editor.trigger("component:update", selectedCmp);
                        initToolbar(editor, selectedCmp);
                        editor.trigger(InfinitelyEvents.layers.update);
                        editor.trigger(
                          InfinitelyEvents.component.update_content,
                        );
                        triggerSymbolEvent(editor, selectedCmp);
                      }}
                    />
                  </li>
                );
              })}
          </ul>
        </AccordionItem>

        <ShowIf
          condition={Boolean(
            Object.values(projectData || {}).length && visibleTraits.length,
          )}
        >
          <AccordionItem title={"Traits"} notify={notify.traits}>
            <section
              className="p-1 flex flex-col gap-2 bg-surface-secondary rounded-lg "
              inf-tokens-container="true"
            >
              <MiniTitle className={`py-3 w-full`}>Traits</MiniTitle>

              {/**
               * PERFORMANCE FIX:
               *
               * Use virtualized list.
               * This renders only visible traits.
               */}
              {/* <div
                style={{
                  height: `calc(100vh - 400px)`,
                  opacity: isTraitsPending ? 0.7 : 1,
                  pointerEvents: isTraitsPending ? "none" : "auto",
                }}
              >
                <Virtuoso
                  className="hideScrollBar h-full"
                  data={deferredVisibleTraits}
                  overscan={{ main: 6, reverse: 6 }}
                  computeItemKey={(index, trait) => trait?.name || index}
                  itemContent={(index, trait) => {
                    return (
                      <TraitItem
                        trait={trait}
                        traits={traits}
                        mediaBreakpoint={mediaBreakpoint}
                      />
                    );
                  }}
                />
              </div> */}

              {Object.values(projectData || {}).length > 0 &&
              visibleTraits.length > 0 ? (
                <VList
                  inf-tokens-container="true"
                  style={{
                    height:
                      visibleTraits.length > 3
                        ? "calc(100vh - 400px)"
                        : `${visibleTraits.length * 55}px`,
                  }}
                  overscan={6}
                  className="hideScrollBar flex !flex-col !gap-2 "
                >
                  {visibleTraits.map((trait, i) => (
                    <TraitItem
                      key={trait.name || i}
                      trait={trait}
                      traits={traits}
                      mediaBreakpoint={mediaBreakpoint}
                    />
                  ))}
                </VList>
              ) : null}
            </section>
          </AccordionItem>
        </ShowIf>

        <AccordionItem title={"Attributes"} notify={notify.elementAttributes}>
          <section className="p-1 flex flex-col gap-2 bg-surface-secondary rounded-lg">
            <MiniTitle className={`py-3 w-full`}>Attributes</MiniTitle>

            {!!Object.keys(attributes).length &&
              Object.keys(attributes).map((key, i) => {
                return (
                  <li key={i} className="flex flex-col gap-2">
                    <FitTitle>{key}</FitTitle>

                    <section className="flex gap-2 h-fit">
                      <Input
                        placeholder={key}
                        className="bg-surface-tertiary w-full"
                        value={attributes[key]}
                        onInput={(ev) => {
                          addAttribute({ key, value: ev.target.value });
                        }}
                      />

                      <Button
                        className="h-[38px] shrink-0 flex-grow"
                        onClick={() => {
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
                {...{ [inf_tokens_ignore]: "true" }}
                value={newAttributeName}
                className="w-full text-center bg-surface-tertiary"
                placeholder="Add Attribute"
                onInput={(ev) => {
                  setNewAttributeName(ev.target.value);
                }}
              />

              <Button
                onClick={() => {
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
});
