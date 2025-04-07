import { editorIcons } from "../components/Icons/editorIcons";
import { tagNames } from "../constants/hsValues";
import { html, parseToHTML } from "../helpers/cocktail";
import { defineTraits } from "../helpers/functions";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const Block = ({ editor }) => {
  editor.Components.addType("block", {
    model: {
      defaults: {
        icon: editorIcons.block({ width: 25, height: 25, fill: "white" }),
        tagName: "div",
        attributes: {
          class: "inf-block",
        },
        traits:defineTraits([
          {
            placeholder:'select tag',
            label:'Select tag',
            name:'Select tag',
            role:'handler',
            
            keywords: tagNames,
            type: "select",
            callback({ editor, trait, newValue }) {
              editor.getSelected().set("tagName", newValue);
            },
          },
        ]),
      },
    },
  });
};
