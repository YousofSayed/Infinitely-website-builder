import { current_symbol_id, inf_template_id } from "@/constants/shared";
import { defineRoot } from "@/helpers/bridge";
import {
  doInWordpress,
  doInWordpressAsync,
  getInfinitelySymbolInfo,
  initSymbol,
  reorderCss,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const updateEditorStyleAfterTemplateOrBlockAdded = (editor) => {
  editor.on(
    "component:add",
    /**
     *
     * @param {import('grapesjs').Component} cmp
     * @returns
     */
    async (cmp) => {
      console.log("component:add : ", cmp);
      if (!cmp) return;
      const symbolInf = getInfinitelySymbolInfo(cmp);
      symbolInf.isSymbol &&
        sessionStorage.setItem(current_symbol_id, symbolInf.mainId);

      const templateId = cmp.getAttributes()[inf_template_id];

      doInWordpressAsync(async () => {
        if (symbolInf.isSymbol && symbolInf.isMain) {
          initSymbol(symbolInf.mainId, editor);
          const style_file = await opfs.getFile(
            defineRoot(`temp/symbols/${symbolInf.mainId}/style.css`),
          );
          
          if (!style_file) return;
          const style_file_content = await style_file.text();
          console.log('style_file : ' , style_file , style_file_content || undefined  , symbolInf.mainId);
          // sessionStorage.removeItem(current_symbol_id)/;
          reorderCss(editor, `${style_file_content} ${editor.getCss()} `, true);
          // editor.addComponents(`<style>${style_file_content}</style>`);
        }

        if (templateId) {
          const style_file = await opfs.getFile(
            defineRoot(`temp/templates/${templateId}/style.css`),
          );
          if (!style_file) return;
          const style_file_content = await style_file.text();
          reorderCss(editor, `${style_file_content} ${editor.getCss()} `, true);
          // editor.addComponents(`<style>${style_file_content}</style>`);
        }
      });
    },
  );
};
