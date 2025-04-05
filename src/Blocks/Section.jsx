import { editorIcons } from "../components/Icons/editorIcons";
import { tagNames } from "../constants/hsValues";
import { html, parseToHTML } from "../helpers/cocktail";
import { defineTraits } from "../helpers/functions";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const Section = ({ editor }) => {
  editor.Components.addType("section", {
    model: {
      defaults: {
        icon: editorIcons.section({ width: 25, height: 25, fill: "white" }),
        
        tagName: "section",
        attributes: {
          class: "parent minh-60",
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
        // components: html`
        //   <template
        //     id="is2d"
        //     x-for="(post, i) in posts"
        //   >
        //     <div >
        //       <span x-text="post"></span>
        //       <span x-text="i"></span>
        //     </div>
        //   </template>
        // `,
      },
    },
  });
};
