
/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const infProps = (editor) => {

    editor.on('component:update',
    /**
       *
       * @param {import('grapesjs').Component} cmp
       * @returns
    */
        (cmp) => {
            console.log('compo update : ', cmp);
            const attrs = cmp.getAttributes();
            
        });
};

