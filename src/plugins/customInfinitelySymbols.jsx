import { InfinitelyEvents } from "../constants/infinitelyEvents";
import {
  current_project_id,
  current_symbol_id,
  inf_class_name,
  inf_symbol_Id_attribute,
} from "../constants/shared";
import { defineRoot } from "../helpers/bridge";
import { uniqueID } from "../helpers/cocktail";
import { db } from "../helpers/db";
import { getInfinitelySymbolInfo, initSymbol, reorderCss } from "../helpers/functions";
import { opfs } from "../helpers/initOpfs";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const customInfinitelySymbols = (editor) => {
  let symbolTimeout;
  let firstLoad = true;

  editor.on("canvas:frame:load:body", async () => {
    // const projectId = +localStorage.getItem(current_project_id);

    // await db.projects.get(projectId).then((project) => {
    //   Object.keys(project.symbols).forEach((symbolId) => {
    //     initSymbol(symbolId, editor);
    //   });
    //   // console.log("cmps form load: ", project.data.symbols);
    //   firstLoad = false;
    // });

    editor.getWrapper().find(`[${inf_symbol_Id_attribute}]`).map(cmp => cmp.getAttributes()[inf_symbol_Id_attribute]).forEach(id => initSymbol(id, editor));
  });

  editor.on('component:add',
    /**
   *
   * @param {import('grapesjs').Component} cmp
   * @returns
   */
    async(cmp) => {
      console.log('component:add : ', cmp);
      if (!cmp)return;
      const symbolInf = getInfinitelySymbolInfo(cmp);
      if(symbolInf.isSymbol && symbolInf.isMain){
        initSymbol(symbolInf.mainId , editor);
        const style_file = await opfs.getFile(defineRoot(`temp/symbols/${symbolInf.mainId}/style.css`));
        if(!style_file)return;
        const style_file_content = await style_file.text();
        reorderCss(editor , `${style_file_content} ${editor.getCss()} ` , true);
        // editor.addComponents(`<style>${style_file_content}</style>`);
      } 
    })

  //update symbol
  /**
   *
   * @param {import('grapesjs').Component} cmp
   * @returns
   */
  const updateSymbols = (cmp) => {
    if (cmp.get("type").toLowerCase() == "wrapper") return;
    const sle = editor?.getSelected();
    const symbol = getInfinitelySymbolInfo(cmp);
    // console.log(`is equal : ` , cmp , cmp.getEl() , cmp.getId());
    const addedComponent = cmp.components().slice(-1)?.[0];

    if (!symbol.isSymbol) return;
    // console.log('componets addded : ' , cmp , cmp.getEl() , symbol.symbol?.getEl());
    console.log('from update symbol', addedComponent);
    const symbolId = symbol.symbol.getAttributes()[inf_symbol_Id_attribute];

    // console.log("what is problem?", cmp);
    const projectId = +localStorage.getItem(current_project_id);

    const updateSymbolInDb = () => {
      symbolTimeout && clearTimeout(symbolTimeout);
      setTimeout(async () => {
        // console.log("Component updated: ", cmp, symbol.symbol.getEl());

        const addedCmpSymbolInfo = getInfinitelySymbolInfo(addedComponent);
        if (addedComponent && addedComponent.get('type') != "textnode") {
          if (addedComponent.getAttributes()[inf_symbol_Id_attribute]) {
            editor.UndoManager.stop();
            addedComponent.removeAttributes(inf_symbol_Id_attribute, {
              avoidStore: true,
            });
            editor.UndoManager.start();
            // toast.warn(<ToastMsgInfo msg={`Symbols in symbols not allowed`}/>)
            // return;
          }

          addedComponent
            ? addedComponent.addAttributes(
              {
                [inf_class_name]: `inf-${uniqueID()}`,
              },
              { avoidStore: true }
            )
            : null;

        }

        sessionStorage.setItem(current_symbol_id, symbolId);

        editor.trigger(
          `${InfinitelyEvents.symbols.update}:${symbolId}`,
          symbolId,
          cmp,
          JSON.stringify(symbol.symbol)
        );
      }, 0);
    };

    updateSymbolInDb();
  };

  let changeAttrsCallback;

  editor.on(
    "component:selected",
    /**
     *
     * @param {import('grapesjs').Component} cmp
     * @returns
     */
    (cmp) => {
      const symbolInfo = getInfinitelySymbolInfo(cmp);
      if (symbolInfo.isSymbol) {
        changeAttrsCallback = () => {
          editor.trigger(
            `${InfinitelyEvents.symbols.update}:${symbolInfo.mainId}`,
            symbolInfo.mainId,
            cmp,
            JSON.stringify(symbolInfo.symbol)
          );
        };

        symbolInfo.symbol.on("change:attributes", changeAttrsCallback);
      }
    }
  );

  editor.on(
    "component:deselected",
    /**
     *
     * @param {import('grapesjs').Component} cmp
     * @returns
     */ (cmp) => {
      const symbolInfo = getInfinitelySymbolInfo(cmp);
      if (symbolInfo.isSymbol && changeAttrsCallback) {
        symbolInfo.symbol.off("change:attributes", changeAttrsCallback);
        changeAttrsCallback = null;
      }
    }
  );

  editor.on("component:update:components", updateSymbols);
  // editor.on("component:update:attributes", (model, attr) => {
  //   // console.log("attributes updated : ", model, attr);
  //   if (!model) return;
  //   const symbolInfo = getInfinitelySymbolInfo(model);
  //   if (!symbolInfo.isSymbol) return;
  //   editor.trigger(
  //     `${InfinitelyEvents.symbols.update}:${symbolInfo.mainId}`,
  //     symbolInfo.mainId,
  //     symbolInfo.symbol,
  //     JSON.stringify(symbolInfo.symbol)
  //   );
  //   // initSymbol(symbolInfo.mainId, editor);
  // });
};
