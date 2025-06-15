import { Icons } from "../components/Icons/Icons";
import { heading_tags } from "../constants/shared";
import { defineTraits } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {import('grapesjs').Editor} param0
 * @returns
 */
export const Heading = ({ editor }) => {
  editor.Components.addType("heading", {
    extend: "text",
    model: {
      defaults: {
        icon:reactToStringMarkup(Icons.heading({fill:'white'})),
        tagName:'h1',
        attributes: {
          class: "p-10",
        },
        components:'Heading',
        traits: defineTraits([
          {
            name: "level",
            label: "Heading level",
            type: "select",
            role:'attribute',
            keywords: heading_tags,
            callback({ editor, newValue }) {
              const sle = editor.getSelected();
              if (!sle) {
                console.error("No selected element..!");
                return;
              }
              sle.set({
                tagName: newValue,
              });
            },
          },
        ]),
        droppable: false,
      },
    },
  });
};
