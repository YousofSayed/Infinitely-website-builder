import React, { memo, useEffect, useRef, useState } from "react";
import { Input } from "./Protos/Input";
import { useEditorMaybe } from "@grapesjs/react";
import { Button } from "../Protos/Button";
import { componentType, traitsType } from "../../helpers/jsDocs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { assetTypeState, currentElState } from "../../helpers/atoms";
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
import { doDocument, isValidAttribute } from "../../helpers/functions";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { InfAccordion } from "../Protos/InfAccordion";
import { AccordionItem } from "@heroui/accordion";

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

  useEffect(() => {
    if (!editor || !editor.getSelected()) return;
    const selectedEl = editor.getSelected();
    // console.log('traits : ' ,editor.getSelected().getTraits());

    setCmpTextContent(editor.getSelected().getInnerHTML());
    const buildFileName = selectedEl.getAttributes()[inf_build_url];
    setFileName(buildFileName);
    setSelectedCmp(selectedEl);
    setSelectedValue(selectedEl.getInnerHTML());
    getAndSetTraits();
  }, [selectedEl]);

  useEffect(() => {
    const selectedEl = editor?.getSelected?.();
    if (!editor || !selectedEl) return;
    const callback = () => {
      console.log("trait updated");
      getAndSetTraits();
    };
    const buildAttrUrlCallback = () => {
      setFileName(selectedEl.getAttributes()[inf_build_url]);
    };
    editor.on("trait:value", callback);
    editor.on(InfinitelyEvents.attributes.buildUrl, buildAttrUrlCallback);
    return () => {
      editor.off("trait:value", callback);
      editor.off(InfinitelyEvents.attributes.buildUrl, buildAttrUrlCallback);
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
    setTraits(traits);
    setAttributesTraits(attributesTraits);
    setHandlerTraits(handlerTraits);
    setAttributes(elementAttributes);
  };

  const updateTraitValue = ({ name = "", key = "", value = "" }) => {
    const sle = editor.getSelected();
    sle.updateTrait(name, { [key]: value });
    console.log("update should be done");
    editor.trigger("trait:value");
  };

  const addAttribute = ({ key, value }) => {
    const sle = editor.getSelected();
    if (isValidAttribute(key, value)) {
      sle.addAttributes({ [key]: value || "" }, { avoidTransformers: true });
      setAttributes(getFilterdAttributes());
    } else {
      // const { document } = parseHTML(
      //   doDocument(sle.toHTML({ withProps: true }))
      // );
      // document.body.children[0].setAttribute(key.trim(), "sda");
      // const newComp = sle.replaceWith(document.body.children[0].outerHTML)[0];
      // editor.select(newComp);
      // console.log(document.body.children[0].outerHTML);
      toast.error(<ToastMsgInfo msg={`Attribute has invalid character`} />);
    }

    try {
    } catch (error) {
    } finally {
    }

    console.log(key, value);
  };

  const removeAttribute = (key) => {
    const sle = editor.getSelected();
    sle.removeAttributes([key]);
    setAttributes(getFilterdAttributes());
  };

  return (
    <InfAccordion>
      {/* <AsideControllers /> */}
      <AccordionItem title={"Type Content"}>
        <Select
          isCode
          className="px-[unset] py-[unset] "
          value={selectedValue || ""}
          codeProps={{
            language: "html",
            // onMount(mEditor) {
            //   console.log('mouted' ,  editor
            //     ?.getSelected?.()
            //     ?.components()
            //     ?.models?.[0]?.toHTML?.());

            //   mEditor.setValue(
            //    selectedValue
            //   );
            // },
            value: selectedValue,
            onChange(value) {
              const sle = editor.getSelected();
              const type = sle.get("type");
              if (
                type.toLowerCase() == "text" ||
                !type ||
                type.toLowerCase() == "link"
              ) {
                console.log(
                  value,
                  editor.getSelected().get("type"),
                  type.toLowerCase() == "text"
                );

                sle.components(`${value}`);
                setSelectedValue(value);
                // sle.getEl().innerHTML = `${value}`;

                editor.refresh();
                editor.Canvas.refresh();
                editor.Canvas.refreshSpots();
              }
            },
          }}
        />
      </AccordionItem>

      <AccordionItem title={"Attributes"}>
        <section className="p-2 flex flex-col gap-2">
          {!![...attributesTraits, ...handlerTraits].length && (
            <MiniTitle className={`py-3 w-full`}>Options</MiniTitle>
          )}
          {[...attributesTraits, ...handlerTraits].map((trait, i) => {
            console.log("trait type:", trait);

            return (
              <li
                key={i}
                className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg"
              >
                <h1 className="text-[14px!important] px-2 text-white capitalize font-semibold">
                  {trait.name}
                </h1>
                {trait.type == "text" && (
                  <Input
                    value={trait.value}
                    placeholder={trait.placeholder || trait.name}
                    className="py-3 w-full bg-slate-800"
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

                {trait.type == "select" && (
                  <Select
                    placeholder={trait.placeholder || trait.name}
                    keywords={trait.keywords}
                    value={trait.value}
                    onAll={(value) => {
                      console.log(value);

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
                      // if (trait.role == "attribute") {
                      //   addAttribute({ [trait.name]: value });
                      // }
                    }}
                  />
                )}

                {trait.type.toLowerCase() == "media" && (
                  <section className="flex gap-2 w-full">
                    <Input
                      placeholder="Url"
                      className="w-full bg-slate-900"
                      value={fileName}
                    />
                    <SmallButton
                      onClick={(ev) => {
                        setAssetType(trait.mediaType);
                        editor.runCommand(open_files_manager_modal);
                      }}
                    >
                      {Icons.gallery("white")}
                    </SmallButton>
                  </section>
                )}
              </li>
            );
          })}

          <MiniTitle className={`py-3 w-full`}>Attributes</MiniTitle>
          {!!Object.keys(attributes).length &&
            Object.keys(attributes).map((key, i) => {
              return (
                <li key={i} className="flex flex-col gap-2">
                  <h1 className="text-[14px!important] px-2 text-white capitalize font-semibold">
                    {key}
                  </h1>
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
              Add
            </Button>
          </section>
        </section>
      </AccordionItem>
    </InfAccordion>
  );
});
