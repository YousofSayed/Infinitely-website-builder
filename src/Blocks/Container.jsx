import { editorIcons } from "../components/Icons/editorIcons";
import { tagNames } from "../constants/hsValues";
import { html } from "../helpers/cocktail";
import { defineTraits } from "../helpers/functions";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const Container = ({ editor }) => {
  editor.Components.addType("container", {
    model: {

      defaults: {
        icon: editorIcons.container({width:20 , height:20 , fill:'white'}),
        tagName: "section",
        attributes: {
          class: "container",
        },
        traits: defineTraits([
          {
            keywords: tagNames,
            type: "select",
            callback({ editor, trait, newValue }) {
              editor.getSelected().set("tagName", newValue);
            },
          },
        ]),
        // components:html`Insert Dynamic Text`
      },
    },
  });
};
