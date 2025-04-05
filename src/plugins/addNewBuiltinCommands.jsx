import { select_page } from '../constants/InfinitelyCommands';
import { InfinitelyEvents } from '../constants/infinitelyEvents';
import { current_page_id } from '../constants/shared';

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const addNewBuiltinCommands = (editor) => {
 

  editor.Commands.add("open:symbols-manager", (editor, sender, options) => {
    editor.runCommand("open:symbols:modal");
  });


  editor.Commands.add("close:current:modal", (editor, sender, options) => {
    editor.runCommand("close:custom:modal");
  });

  
  editor.Commands.add(select_page, (editor, sender, options) => {
     const pageId = options.pageId;
     if(pageId == localStorage.getItem(current_page_id))return;
     localStorage.setItem(current_page_id , pageId);
    //  editor.store();
     editor.load()
  });
};
