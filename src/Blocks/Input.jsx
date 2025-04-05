import { inputTypes } from "../constants/hsValues";
import { open_files_manager_modal } from "../constants/InfinitelyCommands";
import { traitCallback } from "../helpers/functions";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const Input = ({ editor }) => {
  editor.Components.addType("input", {
    model: {
      defaults: {
        tagName: "input",
        attributes: {
          type: "text",
          name: "default-name",
          placeholder: "Insert text here",
        },
        traits: [
          {
            name: "type",
            label: "select type",
            type: "select",
            role: "attribute",
            keywords: inputTypes,
            // options: inputTypes.map((type) => ({ id: type, label: type })),
            // command:open_files_manager_modal, //for testing
            callback: traitCallback(({ editor, newValue, oldValue, trait }) => {
              const sle = editor.getSelected();
              sle.addAttributes({ [trait.name]: newValue });
            }),
          },
        ],
      },
    },
  });
};
