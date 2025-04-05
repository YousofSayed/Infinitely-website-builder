import { editorIcons } from "../components/Icons/editorIcons";
import { html } from "../helpers/cocktail";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const DynamicContainer = ({ editor }) => {
  editor.Components.addType("dynamic container", {
    model: {
      icon: editorIcons.dynamicTemp,

      defaults: {
        icon: editorIcons.dynamicTemp,
        tagName: "section",
        components: html`
          <style>
            .dynamic-temp {
              min-height: 350px;
              min-width: 310px;
              width: fit-content;
              padding: 10px;
              margin:auto;
            }
          </style>
        `,
        attributes: {
          class: " dynamic-temp",
        //   style: `width:fit-content; min-width:300px; min-height:350px;`,
        },
        // components:html`Insert Dynamic Text`
      },
    },
  });
};
