import { open_files_manager_modal } from "../constants/InfinitelyCommands";
import { defineTraits, traitCallback } from "../helpers/functions";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const Image = ({ editor }) => {
  editor.Components.addType("image", {
    extend:'image',
    view:{
      onActive(ev){
        ev.preventDefault();
        ev.stopPropagation();

        editor.runCommand(open_files_manager_modal)
      }
    },
    model: {
      defaults: {
        tagName: "img",
        // attributes: {
        //   type: "text",
        //   name: "default-name",
        //   placeholder: "Insert text here",
        // },
        traits:defineTraits([
            {type:'media' , role:'handler' , mediaType:'image' , label:'Select image' , name:'Select image'}
        ]),
      },
    },
  });
};
