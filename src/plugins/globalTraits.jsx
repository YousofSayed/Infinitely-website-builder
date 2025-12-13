import { defaultAttributeNames, tagNames } from "../constants/hsValues";
import parseObjectLiteral from "object-literal-parse";

import { parse } from "../helpers/cocktail";
import {
  defineTraits,
  mount,
  preventSelectNavigation,
  unMount,
} from "../helpers/functions";
import { parseStringObjToKV } from "../helpers/bridge";
import { isBoolean, isFunction } from "lodash";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";

/**
 *
 * @param {import('grapesjs').Component} sle
 * @returns
 */
export const getLoopComponent = (sle) => {
  if (!sle) return;
  if (sle.get("type") == "looper") return sle;

  return sle.parents().find((parent) => parent.get("type") === "looper");
};

/**
 *
 * @param {[string,string]} param0
 * @param {string} oldValue
 * @param {import('grapesjs').Component} sle
 * @param {import('../helpers/types').InfinitelyTrait} trait
 * @returns
 */
/**
 *
 * @param {[string,string]} param0
 * @param {string} oldValue
 * @param {import('grapesjs').Component} sle
 * @param {{
 * trait : import('../helpers/types').InfinitelyTrait ,
 * editor : import('grapesjs').Editor ,
 * isValueUpdater : boolean
 * }} props
 * @returns
 */
export const setPropToLoopCmp = ([key, value], oldValue, sle, props = {}) => {
  const loopCmp = getLoopComponent(sle);
  if (!loopCmp) {
    console.error("loop cmp not founded");
    return;
  }
  const { editor, trait, isValueUpdater } = props;
  const attributes = loopCmp.getAttributes();
  const loopValue = loopCmp.getTrait("loop-name")?.attributes?.value;

  const scope = attributes["v-scope"];
  const returnValue = (value) => {
    return isBoolean(value) ? value || `""` : value;
  };

  if (!scope) {
    console.log("scope obj (not)");

    loopCmp.addAttributes({
      "v-scope": JSON.stringify({
        [key]: value,
      }),
    });
  } else {
    let parsedScope = parseStringObjToKV(scope);
    console.log(
      "scope obj ",
      key || undefined,
      value || undefined,
      oldValue || undefined
    );

    if (!key && oldValue) {
      parsedScope = parsedScope.filter(([k, v]) => k !== oldValue);
      const updatedScope = `{ ${parsedScope
        .map(
          ([k, v]) => `${k}: ${k == key ? returnValue(value) : returnValue(v)}`
        )
        .join(", ")} }`;
      loopCmp.addAttributes({
        "v-scope": updatedScope,
      });
      return;
    }

    if (oldValue) {
      parsedScope = parsedScope.filter(([k, v]) => k !== oldValue);
    }
    parsedScope.push([key, value]);
    parsedScope = [
      ...new Set(parsedScope.map(([k, v]) => `${k}-(?)-${v}`)),
    ].map((item) => item.split(`-(?)-`).filter(Boolean));
    // if (!parsedScope.some(([k, v]) => k == (oldValue || key))) {
    // }

    console.log(
      "scope obj 1",
      !parsedScope.some(([k, v]) => k == oldValue || key),
      parsedScope,
      key,
      value || undefined,
      oldValue || undefined
    );

    if (parsedScope.filter(([k, v]) => k === key).length >= 2) {
      const firstIndex = parsedScope.findIndex(([k, v]) => k === key);
      const lastIndex = parsedScope.findLastIndex(([k, v]) => k === key);
      if (isValueUpdater) {
        parsedScope.splice(firstIndex, 1);
        const updatedScope = `{ ${parsedScope
          .map(
            ([k, v]) =>
              `${k}: ${k == key ? returnValue(value) : returnValue(v)}`
          )
          .join(", ")} }`;

        console.log(
          "scope obj",
          parsedScope,
          updatedScope,
          value || undefined,
          oldValue || undefined
        );
        loopCmp.addAttributes({
          "v-scope": updatedScope,
        });
      } else {
        sle.getTrait(trait.name).set({
          value: oldValue,
        });
        // editor.trigger("trait:value");
        toast.warn(<ToastMsgInfo msg={`You already entered this key`} />);
      }
      // parsedScope.splice(lastIndex, 1);
    } else {
      const updatedScope = `{ ${parsedScope
        .map(
          ([k, v]) => `${k}: ${k == key ? returnValue(value) : returnValue(v)}`
        )
        .join(", ")} }`;

      console.log(
        "scope obj",
        parsedScope,
        updatedScope,
        value || undefined,
        oldValue || undefined
      );
      loopCmp.addAttributes({
        "v-scope": updatedScope,
      });
    }
  }
};

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const globalTraits = (editor) => {
  editor.on("component:selected", () => {
    const sle = editor.getSelected();
    // const sleType = sle.get("type");
    // const getLoopComponent = (cmp) =>
    //   (editor.getSelected() || cmp)
    //     .parents()
    //     .find((parent) => parent.get("type") === "looper");
    // let loopComponent = sle
    //   .parents()
    //   .find((parent) => parent.get("type") === "looper");

    const isLoop = sle
      .parents()
      .some((parent) => parent.get("type") === "looper");

    window.isLoop = isLoop;
    const getLoopComponent = () => {
      if (!sle) return;
      if (sle.get("type") == "looper") return sle;

      return sle.parents().find((parent) => parent.get("type") === "looper");
    };

    const showCallback = () => {
      const sle = editor.getSelected();
      return Boolean(parse(sle?.getTrait?.("enable-loop")?.attributes?.value));
    };

    const getTraitsAsKV = (traitsFromCallback) => {
      const sle = editor.getSelected();
      if (!sle) return;
      if (traitsFromCallback) {
        return Object.fromEntries(
          traitsFromCallback.map((trait) => [trait.name, trait.value])
        );
      }
      return Object.fromEntries(
        sle
          .getTraits()
          .map((trait) => [trait.attributes.name, trait.attributes.value])
      );
    };

    // -----------------------------------------
    // CENTRAL LOOP BUILDER (ONE FUNCTION TO RULE THEM ALL)
    // -----------------------------------------
    const updateVFor = (traitsFromCallback) => {
      const sle = editor.getSelected();
      if (!sle) return;

      const traits = getTraitsAsKV(traitsFromCallback);

      if (!parse(traits["enable-loop"])) {
        sle.removeAttributes("v-for");
        return;
      }

      const loopItem = traits["loop-item"] || "item";
      const loopIndex = traits["loop-index"];
      const loopValue = traits["loop-value"] || "data";
      const countName = traits["loop-count-name"];
      const countValue = traits["loop-count-value"];
      const filterProp = traits["loop-filter-prop"];
      const filterName = traits["loop-filter-name"];

      // Build source
      let source = `(Array.isArray(${loopValue}) ? ${loopValue} : [])`;

      // Apply count if available
      if (countName || countValue) {
        source = `${source}.slice(${countName ? `start${countName}` : "0"}, ${
          countName || `${countValue}.length`
        })`;
      }

      // Apply filter if available
      if (filterProp && filterName) {
        source = `${source}.filter(${loopItem} => ${filterName} && ${filterProp} ? typeof ${filterProp} === \`string\` ? toLowerCase(${filterProp})?.includes(toLowerCase(${filterName})||\`\`) :  new String(${filterProp}).includes(${filterName}) : true)`;
      }

      sle.addAttributes({
        "v-for": `(${loopItem}${
          loopIndex ? `, ${loopIndex}` : ""
        }) in ${source}`,
      });
    };

    isLoop &&
      sle.setTraits(
        defineTraits([
          ...sle.getTraits().map((tr) => tr.attributes),

          {
            name: "enable-loop",
            label: "Enable Loop",
            type: "switch",
            role: "attribute",
            default: false,
            onSwitch(value) {
              const sle = editor.getSelected();
              const loopItem = sle.getTrait("loop-item")?.attributes?.value;
              const loopValue = sle.getTrait("loop-value")?.attributes?.value;
              const loopIndex = sle.getTrait("loop-index")?.attributes?.value;
              if (value) {
                sle.addAttributes({
                  "v-for": `(${loopItem} ${
                    loopIndex ? `,${loopIndex}` : ""
                  }) in ${loopValue}`,
                });
              } else {
                const cnfrm = confirm(`Are you sure to remove for loop ?`);
                if (!cnfrm) return;
                sle.removeAttributes("v-for");
              }
            },
          },

          {
            name: "loop-item",
            label: "Loop Item",
            type: "text",

            placeholder: "Enter loop item",
            // value: "item",
            role: "attribute",
            showCallback,
            callback({ editor, oldValue, newValue, traits }) {
              updateVFor(traits);
              // sle.addAttributes({
              //   "v-for": `(${newValue}${
              //     loopIndex ? `,${loopIndex}` : ""
              //   }) in ${loopValue}`,
              // });
            },
          },

          {
            name: "loop-index",
            label: "Loop Index",
            type: "text",
            placeholder: "Enter loop index",
            role: "attribute",
            showCallback,
            callback({ editor, trait, newValue, traits }) {
              updateVFor(traits);
              // sle.addAttributes({
              //   "v-for": `(${loopItem} ${
              //     newValue ? `,${newValue}` : ""
              //   }) in ${loopValue}`,
              // });
            },
          },

          {
            name: "loop-value",
            label: "Loop Value",
            type: "textarea",
            textareaLanguage: "javascript",
            allowCmdsContext: true,

            allowToSetTraitValueToEditor: true,
            keywords: () => [
              editor
                .getSelected()
                .parents()
                .find((el) => el.get("type") === "looper")
                .getTrait("loop-name")?.attributes?.value,
            ],
            // value: "",
            showCallback,
            callback({ editor, oldValue, newValue, traits }) {
              updateVFor(traits);
            },
            role: "attribute",
          },

          {
            name: "loop-count-name",
            label: "Loop Count Name",
            type: "text",
            placeholder: "Enter Name of Count",
            role: "attribute",
            showCallback,
            callback({ editor, newValue, oldValue, traits, model, trait }) {
              const sle = editor.getSelected();
              if (!sle) return;

              const loopCountValue =
                model.getTrait("loop-count-value")?.attributes?.value;
              setPropToLoopCmp(
                [newValue, loopCountValue || undefined],
                oldValue,
                model,
                { editor, trait }
              );
              setPropToLoopCmp(
                [`start${newValue}`, 0],
                `start${oldValue}`,
                model,
                { editor, trait }
              );
              updateVFor(traits);
              const loopCmp = getLoopComponent(model);
              const looperPrevNext = loopCmp.find(`looper-next-prev-button`)[0];

              const looperPrevNextTraitCallback =
                looperPrevNext.getTrait("count-name")?.attributes?.callback;
              if (looperPrevNext.getTrait("count-name")) {
                looperPrevNext.getTrait("count-name").attributes.value =
                  newValue;
              }
              isFunction(looperPrevNextTraitCallback) &&
                looperPrevNextTraitCallback({
                  editor,
                  model: looperPrevNext,
                  newValue: newValue,
                  oldValue: oldValue,
                  // props: {
                  //   oldValue,
                  // },
                });
            },
          },

          {
            name: "loop-count-value",
            label: "Loop Count Value",
            type: "number",
            placeholder: "Enter number of loops",
            role: "attribute",
            showCallback,
            callback({ editor, newValue, traits, oldValue, model, trait }) {
              const sle = editor.getSelected();
              if (!sle) return;
              const count = Number(newValue) || 0;

              const loopCountName =
                sle.getTrait("loop-count-name")?.attributes?.value ||
                "loopCount";

              const loopCmp = getLoopComponent(model);
              setPropToLoopCmp([loopCountName, count], undefined, model, {
                editor,
                trait,
                isValueUpdater: true,
              });
              updateVFor(traits);
              const looperPrevNext = loopCmp.find(`looper-next-prev-button`)[0];

              const looperPrevNextTraitCallback =
                looperPrevNext.getTrait("count-name")?.attributes?.callback;
              isFunction(looperPrevNextTraitCallback) &&
                looperPrevNextTraitCallback({
                  editor,
                  model: looperPrevNext,
                  newValue:
                    looperPrevNext.getTrait("count-name")?.attributes?.value ||
                    "",
                  oldValue:
                    looperPrevNext.getTrait("count-name")?.attributes?.value ||
                    "",
                  props: {
                    oldValue,
                  },
                });
              // Instead of looping over a data array, we generate one inline
              // sle.addAttributes({
              //   "loop-count-value": count,
              //   "v-for": `(${loopItem}${
              //     loopIndex ? `, ${loopIndex}` : ""
              //   }) in (Array.isArray(${loopValue}) ? ${loopValue} : []).slice(0,${
              //     loopCountName ? loopCountName : `${loopValue}.length`
              //   })`,
              // });
            },
          },

          {
            name: "loop-filter-prop",
            role: "attribute",
            placeholder: "Enter filter prop",
            label: "Loop Filter Prop",
            type: "textarea",
            textareaLanguage: "javascript",
            allowCmdsContext: true,
            allowToSetTraitValueToEditor: true,

            showCallback,
            callback({ editor, model, newValue, oldValue, traits }) {
              // const traitsKV = getTraitsAsKV();

              updateVFor(traits);
              // if (!newValue || !traitsKV["loop-filter-name"]) {
              //   model.addAttributes({
              //     "v-for": `(${traitsKV["loop-item"]}${
              //       traitsKV["loop-index"] ? `, ${traitsKV["loop-index"]}` : ""
              //     }) in (Array.isArray(${traitsKV["loop-value"]}) ? ${
              //       traitsKV["loop-value"]
              //     } : []).slice(0,${
              //       traitsKV["loop-count-name"]
              //         ? traitsKV["loop-count-name"]
              //         : `${traitsKV["loop-value"]}.length`
              //     })`,
              //   });
              // }

              // model.addAttributes({
              //   "v-for": `(${traitsKV["loop-item"]}${
              //     traitsKV["loop-index"] ? `, ${traitsKV["loop-index"]}` : ""
              //   }) in (Array.isArray(${traitsKV["loop-value"]}) ? ${
              //     traitsKV["loop-value"]
              //   } : []).filter(${traitsKV["loop-item"]}=>${newValue} === ${
              //     traitsKV["loop-filter-name"]
              //   }).slice(0,${
              //     traitsKV["loop-count-name"]
              //       ? traitsKV["loop-count-name"]
              //       : `${traitsKV["loop-value"]}.length`
              //   })`,
              // });
            },
          },

          {
            name: "loop-filter-name",
            role: "attribute",
            placeholder: "Enter filter name",
            label: "Loop Filter Name",
            type: "text",
            showCallback,
            callback({ editor, model, newValue, oldValue, traits, trait }) {
              setPropToLoopCmp([newValue, `""`], oldValue, model, {
                editor,
                trait,
              });
              updateVFor(traits);
            },
          },

          {
            name: "loop-attributes",
            label: "Loop Attributes",
            placeholder: "Enter loop attributes",
            type: "add-props",
            addPropsInputType: "code",
            addPropsCodeLanguage: "javascript",
            role: "handler",
            // default: "{}",
            mustValue: ({ attributes }) =>
              JSON.stringify(
                Object.fromEntries(
                  Object.entries(attributes || {}).filter(([key, value]) => {
                    return key.startsWith(`v-bind`) || key.startsWith(`:`);
                  })
                )
              ),
            stateProp: "",
            keywords: defaultAttributeNames,
            value: JSON.stringify(
              Object.fromEntries(
                Object.entries(
                  editor.getSelected()?.getAttributes() || {}
                ).filter(([key, value]) => {
                  return key.startsWith(`v-bind`) || key.startsWith(`:`);
                })
              )
            ),
            // showCallback: () => {
            //   const sle = editor.getSelected();
            //   return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
            // },
            callback({ editor, trait, newValue }) {
              const sle = editor.getSelected();
              const attributes = parse(`${newValue || {}}`);
              const bindedAttributes = Object.fromEntries(
                Object.entries(attributes).map(([key, value]) => [
                  key.startsWith("v-bind") ? key : `v-bind:${key}`,
                  value,
                ])
              );
              console.log("value trait", newValue, parse(`${newValue || {}}`));

              sle.addAttributes(bindedAttributes);
            },

            deleteCallback({ trait, newValue, model, editor }) {
              model.removeAttributes([newValue]);
              model.removeTrait(trait.name);
              // editor.trigger("trait:value");
            },
          },

          // {
          //   name: "destention",
          //   label: "Destination",
          //   type: "text",
          //   // value: "",
          //   placeholder: "Enter destination , Ex: data|products|images",
          //   role: "handler",
          //   showCallback: () => {
          //     const sle = editor.getSelected();
          //     return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
          //   },
          //   callback({ editor, oldValue, newValue }) {
          //     const sle = editor.getSelected();
          //     const loopItem =
          //       sle.getTrait("loop-item")?.attributes?.value || "item";
          //     const loopValue =
          //       sle.getTrait("loop-value")?.attributes?.value || "data";
          //     sle.addAttributes({
          //       "v-for": `${loopItem} in ${loopValue}${newValue
          //         .split("|")
          //         .map((dest) => `[${dest}]`)
          //         .join("")}`,
          //     });
          //   },
          // },
        ])
      );
  });
};
