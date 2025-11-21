import { editorIcons } from "../components/Icons/editorIcons";
import { selectTagName } from "../constants/traits";
import { defineTraits } from "../helpers/functions";


/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const Block = ({ editor }) => {
  editor.Components.addType("block", {
    isComponent: (el) => el.tagName == "DIV",
    view: {
      // onRender({ model }) {
      //   model.set({
      //     droppable: true,
      //     draggable: true,
      //   });
      // },
    },
    model: {
      defaults: {
        icon: editorIcons.block({ width: 25, height: 25, fill: "white" }),
        tagName: "div",
        attributes: {
          class: "inf-block p-10 drop",
        },
        // components: [
        //   {
        //     type: "drop-area",
        //   },
        // ],
        resizable: true,
        draggable: true,
        droppable: true,
        traits:defineTraits([
          selectTagName
        ])
        // traits: defineTraits([
        //   {
        //     placeholder: "select tag",
        //     label: "Select tag",
        //     name: "select-tag",
        //     role: "handler",

        //     keywords: tagNames,
        //     type: "select",
        //     callback({ editor, trait, newValue }) {
        //       editor.getSelected().set("tagName", newValue);
        //     },
        //   },
        //   {
        //     name: "enable-loop",
        //     label: "Enable Loop",
        //     type: "switch",
        //     role: "handler",
        //     default: false,
        //     onSwitch(value) {
        //       const sle = editor.getSelected();
        //       const loopItem = sle.getTrait("loop-item")?.attributes?.value;
        //       const loopValue = sle.getTrait("loop-value")?.attributes?.value;
        //       if (value) {
        //         sle.addAttributes({
        //           "v-for": `(${loopItem}) in ${loopValue}`,
        //         });
        //       } else {
        //         sle.removeAttributes("v-for");
        //       }
        //     },
        //   },

        //   {
        //     name: "loop-item",
        //     label: "Loop Item",
        //     type: "text",

        //     placeholder: "Enter loop item",
        //     // value: "item",
        //     role: "handler",
        //     showCallback: () => {
        //       const sle = editor.getSelected();
        //       return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
        //     },
        //     callback({ editor, oldValue, newValue }) {
        //       const sle = editor.getSelected();
        //       const loopValue =
        //         sle.getTrait("loop-value")?.attributes?.value || "data";
        //       const loopIndex =
        //         sle.getTrait("loop-index")?.attributes?.value || "index";
        //       sle.addAttributes({
        //         "v-for": `(${newValue}${
        //           loopIndex ? `,${loopIndex}` : ""
        //         }) in ${loopValue}`,
        //       });
        //     },
        //   },

        //   {
        //     name: "loop-index",
        //     label: "Loop Index",
        //     type: "text",
        //     placeholder: "Enter loop index",
        //     role: "handler",
        //     showCallback: () => {
        //       const sle = editor.getSelected();
        //       return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
        //     },
        //     callback({ editor, trait, newValue }) {
        //       const sle = editor.getSelected();
        //       const loopItem = sle.getTrait("loop-item")?.attributes?.value;
        //       const loopValue = sle.getTrait("loop-value")?.attributes?.value;
        //       sle.addAttributes({
        //         "v-for": `(${loopItem} ${newValue ? `,${newValue}` : ""}) in ${loopValue}`,
        //       });
        //     },
        //   },

        //   {
        //     name: "loop-value",
        //     label: "Loop Value",
        //     type: "textarea",
        //     textareaLanguage: "javascript",
        //     allowCmdsContext: true,
        //     keywords: () => [
        //       editor
        //         .getSelected()
        //         .parents()
        //         .find((el) => el.get("type") === "looper")
        //         .getTrait("loop-name")?.attributes?.value,
        //     ],
        //     // value: "",
        //     showCallback: () => {
        //       const sle = editor.getSelected();
        //       return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
        //     },
        //     callback({ editor, oldValue, newValue }) {
        //       const sle = editor.getSelected();
        //       const loopItem =
        //         sle.getTrait("loop-item")?.attributes?.value || "item";
        //       const loopIndex =
        //         sle.getTrait("loop-index")?.attributes?.value || "index";

        //       sle.addAttributes({
        //         "v-for": `(${loopItem} ${
        //           loopIndex ? `,${loopIndex}` : ""
        //         }) in ${newValue}`,
        //       });
        //     },
        //     role: "handler",
        //   },
        //   // {
        //   //   name: "destention",
        //   //   label: "Destination",
        //   //   type: "text",
        //   //   // value: "",
        //   //   placeholder: "Enter destination , Ex: data|products|images",
        //   //   role: "handler",
        //   //   showCallback: () => {
        //   //     const sle = editor.getSelected();
        //   //     return Boolean(sle?.getTrait?.("enable-loop")?.attributes?.value);
        //   //   },
        //   //   callback({ editor, oldValue, newValue }) {
        //   //     const sle = editor.getSelected();
        //   //     const loopItem =
        //   //       sle.getTrait("loop-item")?.attributes?.value || "item";
        //   //     const loopValue =
        //   //       sle.getTrait("loop-value")?.attributes?.value || "data";
        //   //     sle.addAttributes({
        //   //       "v-for": `${loopItem} in ${loopValue}${newValue
        //   //         .split("|")
        //   //         .map((dest) => `[${dest}]`)
        //   //         .join("")}`,
        //   //     });
        //   //   },
        //   // },
        // ]),
      },
    },
  });
};
