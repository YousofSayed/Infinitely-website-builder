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
        resizable: {
          tl: 0, // Top-left handle (0 = disabled, 1 = enabled)
          tc: 1, // Top-center
          tr: 0, // Top-right
          cl: 1, // Center-left
          cr: 1, // Center-right
          bl: 0, // Bottom-left
          bc: 1, // Bottom-center
          br: 0, // Bottom-right
          minDim: 50, // Minimum width/height in px
          step: 1, // Resize step in px
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
