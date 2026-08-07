import { Icons } from '@/components/Icons/Icons';
import { open_symbol_code_editor_modal } from '@/constants/InfinitelyCommands';
import { addItemInToolBarForEditor, getComponentRules, getInfinitelySymbolInfo } from '@/helpers/functions';
import { reactToStringMarkup } from '@/helpers/reactToStringMarkup';
import React from 'react';

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const symbolCodeEditor =  (editor) => {
    const sle = editor.getSelected();
    if (!sle) return;

    const symbol = getInfinitelySymbolInfo(sle);
    // if (symbol.isSymbol) {
    //     await opfs.writeFiles([
    //         {
    //             path: defineRoot(`temp_symbol.html`),
    //             content: symbol.symbol.toHTML({
    //                 withProps: true,
    //                 keepInlineStyle: true,
    //             }),
    //         },
    //         {
    //             path: defineRoot(`temp_symbol.css`),
                // content: getComponentRules({
                //     editor,
                //     cmp: symbol.symbol,
                //     nested: true,
                // }).stringRules,
    //         }
    //     ])
    // }
    return addItemInToolBarForEditor({
        editor,
        label: reactToStringMarkup(Icons.code({  strokeColor: 'white' })),
        forAll: true,
        cond: Boolean(symbol.isSymbol),
        commandName: open_symbol_code_editor_modal,
        //   commandCallback(editor) {
        //     const sle = editor.getSelected();
        //     unMount({
        //       editor,
        //       specificCmp: sle,
        //       selectAfterUnMout:true
        //     });
        //   },
    });
}
