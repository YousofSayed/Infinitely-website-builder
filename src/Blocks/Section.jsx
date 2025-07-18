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
    isComponent:(el)=>el.tagName == 'SECTION',
    model: {
      // init(){
      //   this.updateTrait('tag-name', {value: this.tagName});
      // },
      defaults: {
        icon: editorIcons.section({ width: 25, height: 25, fill: "white" }),
        resizable:true,
        tagName: "section",
        attributes: {
          class: "section",
        },
        traits: defineTraits([
          {
            placeholder:'select tag',
            label:'Select tag',
            name:'tag-name',
            role:'attribute',
            value : '',
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
