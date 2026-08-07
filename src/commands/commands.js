
/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const addCommand = (commandName , editor) => {
  editor.Commands.add(
    commandName,
   
    (ed) => {
        console.log('lollller');
        
    }
  );
};
