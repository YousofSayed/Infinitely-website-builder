import { defaultAttributeNames } from "@/constants/hsValues";
import { current_project_id } from "@/constants/shared";
import { restModelState } from "@/helpers/atoms";
import { db } from "@/helpers/db";
import {
  getModelResAndKeys,
  parseDynamicContent,
  viewDynamicContent,
} from "@/helpers/functions";
import { dynamicAttributesType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { HighlightContentEditable } from "@/components/Editor/Protos/HighlightContentEditable";
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

export const DynamicAttributes = () => {
  const editor = useEditorMaybe();
  // const models = useRecoilValue(restModelState);
  const models = useLiveQuery(async () => {
    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await db.projects.get(projectId);
    return await projectData.restAPIModels;
  });
  const [dynmaicValuesKeywords, setDynamicValuesKeywords] = useState([]);
  const [attributes, setAttributes] = useState(dynamicAttributesType);
  const [attributeName, setAttributeName] = useState("");
  const editorRef = useRef();

  useEffect(() => {
    if (!models) return;
    setDynamicValuesKeywords(getModelResAndKeys(models).keys);
  }, [models]);

  useEffect(() => {
    const sle = editor?.getSelected();
    if (!editor || !sle || !Object.keys(attributes).length) return;
  }, [attributes]);

  useLayoutEffect(() => {
    getAllAtrributes();
  }, []);

  const getAllAtrributes = () => {
    const sle = editor?.getSelected();
    if (!sle || !Object.keys(sle.getAttributes()).length) return;
    const attrs = {};
    Object.keys(sle.getAttributes()).forEach((attr) => {
      if (attr.startsWith("inf-dynamic-content")) return;
      if (attr.startsWith("inf-dynamic-")) {
        const attrName = attr.replace("inf-dynamic-", "");
        attrs[attrName] = {
          show: false,
          value: sle.getAttributes()[attr],
          lastDynamicValue: "",
        };
      }
    });
    setAttributes(attrs);
  };

  const addAttribute = ({ attrName }) => {
    if (!attrName || !attrName.toString()) return;
    setAttributes({
      ...attributes,
      [attrName]: {
        show: false,
        value: "",
        lastDynamicValue: "",
      },
    });
    setAttributeName(new String(""));
  };

  const addDynmaicValue = ({ value, attrName }) => {
    if (!value || !value.toString()) return;
    console.log("attr val : ", value);

    // const newValue = attributes[attrName].value + `{${value}}`;
    const newValue = value;

    setAttributes({
      ...attributes,
      [attrName]: {
        ...attributes[attrName],
        lastDynamicValue: new String(""),
        value: newValue,
      },
    });
    setAttributeContent({ attrName, value: newValue });
  };

  const setAttributeContent = ({ attrName, value = '' }) => {
    const sle = editor?.getSelected();
    if (!sle) return;

    sle.addAttributes({
      [`inf-dynamic-${attrName}`]: value.startsWith('\`') && value.endsWith('\`') ? value.slice(1,-1) : 'No valid',
    });

    sle.getEl().setAttribute(
      attrName,
      viewDynamicContent(models, value)
      // parseDynamicContent(value, getModelResAndKeys(models).res)
    );
    // console.log('value arttr : ' ,attrName,
    //   parseDynamicContent(value, getModelResAndKeys(models).res));
  };

  const removeAttributeContent = ({ attrName }) => {
    const sle = editor?.getSelected();
    if (!sle) return;

    sle.removeAttributes([`inf-dynamic-${attrName}`]);

    sle.getEl().removeAttribute(attrName);
    if (sle.get("type").toLowerCase() == "image") {
      sle
        .getEl()
        .setAttribute(
          "src",
          `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+`
        );
    }
  };

  const closeAllTabs = ({ attrName }) => {
    const clone = structuredClone(attributes);
    Object.keys(clone).forEach((attr) => {
      clone[attr].show = attrName == attr ? !clone[attr].show : false;
    });
    setAttributes(clone);
  };

  const deleteAttribute = ({ attrName }) => {
    const clone = structuredClone(attributes);
    delete clone[attrName];
    setAttributes(clone);
    removeAttributeContent({ attrName });
  };

  return (
    <main className="flex flex-col gap-2">
      <section className="p-2 bg-surface-tertiary rounded-lg ">
        <article className="flex flex-col gap-1">
          <p className="w-fit p-1 bg-surface-tertiary rounded-lg custom-font-size text-text-primary font-semibold">
            Choose Attribute :{" "}
          </p>{" "}
          <section className="flex gap-2">
            <Select
              value={attributeName}
              placeholder="Select Attribute"
              className="bg-surface-secondary"
              keywords={defaultAttributeNames}
              onInput={(value) => {
                setAttributeName(value);
              }}
              onEnterPress={(value) => {
                addAttribute({ attrName: value });
              }}
              onItemClicked={(value) => {
                addAttribute({ attrName: value });
              }}
            />

            <SmallButton
              className="bg-surface-secondary"
              onClick={() => {
                addAttribute({ attrName: attributeName });
              }}
            >
              {Icons.plus("white")}
            </SmallButton>
          </section>
        </article>
      </section>

      {!!Object.keys(attributes).length && <MiniTitle>Attributes</MiniTitle>}

      {Object.keys(attributes).map((attrName, i) => {
        // const { show, value } = attributes[attrName];
        return (
          <section
            key={i}
            className={`p-2 bg-surface-tertiary rounded-lg flex flex-col gap-2 ${
              attributes[attrName].show ? "border-2 border-blue-500" : ""
            }`}
          >
            <section className=" flex flex-col gap-2  rounded-lg">
              <article className="flex gap-2 w-full justify-between items-center">
                <MiniTitle className="text-xl w-full text-text-primary font-semibold">
                  {attrName}
                </MiniTitle>

                <SmallButton
                  className="shrink-0 py-2 bg-surface-secondary"
                  onClick={(ev) => {
                    deleteAttribute({ attrName });
                  }}
                >
                  {Icons.trash("white")}
                </SmallButton>

                <SmallButton
                  className="shrink-0 py-2 bg-surface-secondary"
                  onClick={(ev) => {
                    closeAllTabs({ attrName });
                  }}
                >
                  {Icons.edite({ fill: "white", width: 25 })}
                </SmallButton>
              </article>

              {attributes[attrName].show && (
                <>
                  {/* <section className="flex gap-2 ">
                    <Select
                      className="bg-surface-secondary"
                      keywords={dynmaicValuesKeywords}
                      placeholder="Choose Dynamic Value"
                      // isTextarea

                      value={attributes[attrName].lastDynamicValue}
                      onInput={(value) => {
                        setAttributes({
                          ...attributes,
                          [attrName]: {
                            ...attributes[attrName],
                            lastDynamicValue: value,
                          },
                        });
                      }}
                      onEnterPress={(value) => {
                        addDynmaicValue({ value, attrName });
                      }}
                      onItemClicked={(value) => {
                        addDynmaicValue({ value, attrName });
                      }}
                    />
                    <SmallButton
                      className="bg-surface-secondary"
                      onClick={(ev) => {
                        addDynmaicValue({
                          value: attributes[attrName].lastDynamicValue,
                          attrName,
                        });
                      }}
                    >
                      {Icons.plus("white")}
                    </SmallButton>
                  </section> */}
                  <Select
                    // isTextarea
                    keywords={dynmaicValuesKeywords}
                    isCode
                    isTemplateEngine
                    allowCmdsContext
                    allowRestAPIModelsContext
                    placeholder="Type dynamic content..."
                    className="bg-surface-secondary "
                    inputClassName="py-3 bg-surface-secondary"
                    replaceLastWorld
                    codeProps={{
                      language: "javascript",
                      value: attributes[attrName].value,
                      onChange: (value) => {
                        setAttributes({
                          ...attributes,
                          [attrName]: {
                            ...attributes[attrName],
                            value: value,
                          },
                        });

                        setAttributeContent({ attrName, value: value });
                      },
                    }}
                    value={attributes[attrName].value}
                    onInput={(value) => {
                      setAttributes({
                        ...attributes,
                        [attrName]: {
                          ...attributes[attrName],
                          value: value,
                        },
                      });

                      setAttributeContent({ attrName, value: value });
                    }}
                    onEnterPress={(value) => {
                      console.log("val entered : ", value);

                      addDynmaicValue({ value, attrName });
                    }}
                    onItemClicked={(value) => {
                      addDynmaicValue({ value, attrName });
                    }}
                  />
                  {/* <HighlightContentEditable
                    innerStt={attributes[attrName].value}
                    onInput={(ev) => {
                      setAttributes({
                        ...attributes,
                        [attrName]: {
                          ...attributes[attrName],
                          value: ev.target.value,
                        },
                      });

                      setAttributeContent({ attrName, value: ev.target.value });
                    }}
                    className="bg-surface-secondary"
                    placeholder="Type dynamic content"
                  /> */}
                </>
              )}
            </section>
          </section>
        );
      })}

      <footer className="flex flex-col gap-2">
        <Select
          value={attributeName}
          placeholder="Attribute Name"
          className="w-full bg-surface-tertiary py-1 px-1"
          keywords={defaultAttributeNames}
          onInput={(value) => {
            setAttributeName(value);
          }}
        />
        <Button
          onClick={() => {
            addAttribute({ attrName: attributeName });
          }}
          title={"Add Atrribute"}
          className="self-center px-3 py-2 font-semibold flex gap-2 items-center"
        >
          Add Attribute {Icons.plus("white")}
        </Button>
      </footer>
    </main>
  );
};
