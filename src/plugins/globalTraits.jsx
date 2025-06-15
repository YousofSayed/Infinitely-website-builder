import { defaultAttributeNames, tagNames } from "../constants/hsValues";
import {
  DollarBracePlaceholderRgx,
  DoubleBracePlaceholderRgx,
} from "../constants/rgxs";
import { parse } from "../helpers/cocktail";
import {
  defineTraits,
  mount,
  preventSelectNavigation,
  unMount,
} from "../helpers/functions";

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

    // isLoop &&
    //   sleType === "text" &&
    //   sle.setTraits(
    //     defineTraits([
    //       ...sle.getTraits().map((tr) => tr.attributes),
    //       {
    //         name: "loop-content",
    //         label: "Loop Content",
    //         type: "textarea",
    //         value: sle.getEl().textContent,
    //         placeholder: "Enter loop value",
    //         textareaLanguage: "javascript",
    //         allowCmdsContext: true,
    //         onMountHandler(mEditor, monaco) {
    //           //   const value = mEditor.getValue();
    //           const value =
    //             editor?.getSelected()?.getTrait?.("loop-content")?.attributes
    //               ?.value || "";

    //           let newValue = value;
    //           const isTemplateEngine =
    //             value.startsWith("`") && value.endsWith("`");
    //           !isTemplateEngine && (newValue = `\`\n${value}\n\``);
    //           newValue = newValue.replaceAll(
    //             DoubleBracePlaceholderRgx,
    //             (value) => {
    //               return `\${${value.slice(2, -2)}}`;
    //             }
    //           );
    //           mEditor.setValue(newValue);
    //         },
    //         callback({ editor, trait, newValue }) {
    //           const isTemplateEngine =
    //             newValue.startsWith("`") && newValue.endsWith("`");
    //           isTemplateEngine && (newValue = newValue.slice(1, -1));

    //           //   console.log("match...........", newValue.match(templateRgx));

    //           newValue = newValue.replaceAll(
    //             DollarBracePlaceholderRgx,
    //             (value) => {
    //               return `{${value.slice(1)}}`;
    //             }
    //           );
    //           //   sle.getEl().textContent = newValue;

    //           editor.getSelected().components(newValue);
    //         },
    //         role: "handler",
    //       },
    //     ])
    //   );
    isLoop &&
      sle.setTraits(
        defineTraits([
          ...sle.getTraits().map((tr) => tr.attributes),
          {
            placeholder: "select tag",
            label: "Select tag",
            name: "select-tag",
            role: "attribute",

            keywords: tagNames,
            type: "select",
            callback({ editor, trait, newValue }) {
              editor.getSelected().set("tagName", newValue);
            },
          },
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
            showCallback: () => {
              const sle = editor.getSelected();
              return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
            },
            callback({ editor, oldValue, newValue }) {
              const sle = editor.getSelected();
              const loopValue =
                sle.getTrait("loop-value")?.attributes?.value || "data";
              const loopIndex =
                sle.getTrait("loop-index")?.attributes?.value || "index";
              sle.addAttributes({
                "v-for": `(${newValue}${
                  loopIndex ? `,${loopIndex}` : ""
                }) in ${loopValue}`,
              });
            },
          },

          {
            name: "loop-index",
            label: "Loop Index",
            type: "text",
            placeholder: "Enter loop index",
            role: "attribute",
            showCallback: () => {
              const sle = editor.getSelected();
              return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
            },
            callback({ editor, trait, newValue }) {
              const sle = editor.getSelected();
              const loopItem = sle.getTrait("loop-item")?.attributes?.value;
              const loopValue = sle.getTrait("loop-value")?.attributes?.value;
              sle.addAttributes({
                "v-for": `(${loopItem} ${
                  newValue ? `,${newValue}` : ""
                }) in ${loopValue}`,
              });
            },
          },

          {
            name: "loop-value",
            label: "Loop Value",
            type: "textarea",
            textareaLanguage: "javascript",
            allowCmdsContext: true,
            keywords: () => [
              editor
                .getSelected()
                .parents()
                .find((el) => el.get("type") === "looper")
                .getTrait("loop-name")?.attributes?.value,
            ],
            // value: "",
            showCallback: () => {
              const sle = editor.getSelected();
              return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
            },
            callback({ editor, oldValue, newValue }) {
              const sle = editor.getSelected();
              const loopItem =
                sle.getTrait("loop-item")?.attributes?.value || "item";
              const loopIndex =
                sle.getTrait("loop-index")?.attributes?.value || "index";

              sle.addAttributes({
                "v-for": `(${loopItem} ${
                  loopIndex ? `,${loopIndex}` : ""
                }) in ${newValue}`,
              });
            },
            role: "attribute",
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
            stateProp: "",
            keywords: defaultAttributeNames,
            value: JSON.stringify(
              Object.fromEntries(
                Object.entries(
                  editor.getSelected().getAttributes() || {}
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
                  `v-bind:${key}`,
                  value,
                ])
              );
              console.log("value trait", newValue, parse(`${newValue || {}}`));

              sle.addAttributes(bindedAttributes);
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
