import { Icons } from "../components/Icons/Icons";
import { media_types, text_tags } from "../constants/shared";
import { doActionAndPreventSaving, getParentNode } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 */
export const Text = ({ editor }) => {
  editor.Components.addType("text", {
    extend: "text",
    view: {
      // onRender({model}){
      //  doActionAndPreventSaving(editor , ()=>{
      //    model.set({
      //     droppable:false,
      //     editable:true,
      //   })
      //  })
      // }
    },
    isComponent: (el) => {
      const svg = getParentNode((el) => {
        el.tagName && el.tagName.toLowerCase() === "svg";
      }, el);
      const isSvg = svg && svg.tagName && svg.tagName.toLowerCase() === "svg";
      if (isSvg) return false;
      if (!el.tagName) return false;
      // Check if the element is a media type
      if (media_types.includes(el.tagName.toLowerCase())) return false;
      // If the element is not a media type, return true
      if (text_tags.includes(el.tagName.toLowerCase())) return true;
      // // Otherwise, return false
      // if (el.tagName.toLowerCase() === "p") return true;
      // // If the element is not a text or p tag, return false

      // return !media_types.includes(el.tagName.toLowerCase());
    },
    model: {
      defaults: {
        icon: reactToStringMarkup(Icons.text({ fill: "white" })),
        droppable: false,
        editable: true,
        tagName: "p",
        components: `Insert your text here`,
        attributes: {
          class: "p-10",
        },
      },
    },
  });
};
