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
        resizable:true,
        icon: editorIcons.container({width:20 , height:20 , fill:'white'}),
        tagName: "section",
        attributes: {
          class: "inf-container",
        },
        traits: defineTraits([
          {
            placeholder:'select tag',
            label:'Select tag',
            name:'Select tag',
            role:'attribute',
            
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
