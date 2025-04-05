import { editorIcons } from "../components/Icons/editorIcons";
import { html, parseToHTML } from "../helpers/cocktail";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const Template = ({ editor }) => {
  editor.Components.addType("template", {
    model: {
      icon: editorIcons.looper,

      defaults: {
        icon: editorIcons.looper,
        tagName: "template",
        attributes: {
          class: "parent minh-60",
          // "x-data": `{posts : ['post-1' , 'post-2'] }`,
        },

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
