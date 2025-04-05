import { InfinitelyEvents } from "../constants/infinitelyEvents";
import {
  current_project_id,
  current_symbol_id,
  inf_bridge_id,
  inf_class_name,
  inf_symbol_Id_attribute,
  inf_symbol_instance_Id_attribute,
} from "../constants/shared";
import { html, uniqueID } from "../helpers/cocktail";
import { db } from "../helpers/db";
import {
  getInfinitelySymbolInfo,
  initSymbol,
} from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const customInfinitelySymbols = (editor) => {
  let symbolTimeout;
  let firstLoad = true;

  editor.on("canvas:frame:load:body", async () => {
    const projectId = +localStorage.getItem(current_project_id);

    await db.projects.get(projectId).then((project) => {
      Object.keys(project.symbols).forEach((symbolId) => {
        // editor
        //   .getWrapper()
        //   .find(`[${inf_symbol_Id_attribute}="${symbolId}"]`)
        //   .forEach(async (symbol) => {
        //     // console.log("symbol: ", project.data.symbols[symbolId].content);
        //     symbol.replaceWith(
        //       // regenerateSymbol(JSON.parse(project.symbols[symbolId].content))
        //       // regenerateSymbol(await project.symbols[symbolId].content.text())
        //       await project.symbols[symbolId].content.text()
        //     );
        //   });

        initSymbol(symbolId, editor);
      });
      // console.log("cmps form load: ", project.data.symbols);
      firstLoad = false;
    });
  });

  //update symbol
  /**
   *
   * @param {import('grapesjs').Component} cmp
   * @returns
   */
  const updateSymbols = (cmp) => {
    const sle = editor?.getSelected();
    const symbol = getInfinitelySymbolInfo(cmp);
    // console.log(`is equal : ` , cmp , cmp.getEl() , cmp.getId());

    if (
      !symbol.isSymbol ||
      cmp.get("type").toLowerCase() == "wrapper"
      // symbol.symbol.get("type").toLowerCase() == "textnode" ||
      // cmp.get("type").toLowerCase() == "textnode"
    )
      return;
    // console.log('componets addded : ' , cmp , cmp.getEl() , symbol.symbol?.getEl());
    const symbolId = symbol.symbol.getAttributes()[inf_symbol_Id_attribute];

    // console.log("what is problem?", cmp);
    const projectId = +localStorage.getItem(current_project_id);

    const updateSymbolInDb = () => {
      symbolTimeout && clearTimeout(symbolTimeout);
      setTimeout(async () => {
        const projectData = await db.projects.get(projectId);
        // const blockId = projectData.symbols[`${symbolId}`].blockId;
        // const blockThumb = await new Promise(async (res, rej) => {
        //   await (
        //     await html2canvas(symbol.symbol.getEl())
        //   ).toBlob((blob) => {
        //     res(blob);
        //   }, "image/webp");
        // });
        // symbol.symbol.changedAttributes();
        // console.log("last : ", cmp.components().slice(-1)[0].getEl());

        const addedComponent = cmp.components().slice(-1)?.[0];
        addedComponent
          ? addedComponent.addAttributes({
              [inf_class_name]: `inf-${uniqueID()}`,
            },{avoidStore:true})
          : null;

        // await db.projects.update(projectId, {
        //   symbols: {
        //     ...projectData.symbols,
        //     [symbolId]: {
        //       ...projectData.symbols[symbolId],
        //       content: new Blob(
        //         [
        //           symbol.symbol.toHTML({
        //             withProps: true,
        //             keepInlineStyle: true,
        //           }),
        //         ],
        //         { type: "text/html" }
        //       ),
        //     },
        //   },
        //   blocks: {
        //     ...projectData.blocks,
        //     [symbolId]: {
        //       ...projectData.blocks[symbolId],
        //       // media: blockThumb,
        //       content: new Blob(
        //         [`${symbol.symbol.toHTML({ withProps: true })}`],
        //         { type: "text/html" }
        //       ),
        //     },
        //   },
        // });

        // infinitelyWorker.postMessage({
        //   command: "updateDB",
        //   props: {
        //     projectId,
        //     data: {
        //       symbols: {
        //         ...projectData.symbols,
        //         [symbolId]: {
        //           ...projectData.symbols[symbolId],
        //           content: new Blob(
        //             [
        //               symbol.symbol.toHTML({
        //                 withProps: true,
        //                 keepInlineStyle: true,
        //               }),
        //             ],
        //             { type: "text/html" }
        //           ),
        //         }, 
        //       },
        //       blocks: {
        //         ...projectData.blocks,
        //         [symbolId]: {
        //           ...projectData.blocks[symbolId],
        //           // media: blockThumb,
        //           content: new Blob(
        //             [`${symbol.symbol.toHTML({ withProps: true })}`],
        //             { type: "text/html" }
        //           ),
        //         },
        //       },
        //     },
        //   },
        // });

        sessionStorage.setItem(current_symbol_id , symbolId);
        editor.store();
        // infinitelyWorker.postMessage({
        //   command:'updateAllPages',
        //   props:{ 
        //     projectId,

        //   }
        // })
        editor.trigger("block:add");
        editor.trigger("block:update");
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

  editor.on("component:update:components", updateSymbols);
  // editor.on("component:update:attributes", updateSymbols);
  // editor.on("component:deselected", updateSymbols);
  // editor.on('component:clone',(cmp)=>{
  //   console.log('cloned trully' , cmp);
  //   updateSymbols(cmp);
  //   // addAttributes(cmp);
  // });
  // editor.on('component:deselected',(cmp)=>{
  //   console.log(cmp);

  //   updateSymbols(cmp);

  // });
  // editor.on('component:update:content', (component) => {
  //   console.log('Content updated globally:', component);
  // });

  // editor.on("component:deselected",updateSymbols);
  editor.on("component:add", (cmp) => {
    // const cmp = editor.Canvas.get();
    // if(!cmp || firstLoad)return;
    // updateSymbols(cmp)
    // const symbol = getInfinitelySymbolInfo(cmp);
    // if (symbol.isSymbol && !firstLoad) {
    //   console.log(firstLoad);
    //   initSymbol(symbol.mainId, editor);
    // }
    // addAttributes(cmp);
  });

  /**
   *
   * @param {import('grapesjs').Component} cmp
   */
  const addAttributes = (cmp) => {
    const symbolInfo = getInfinitelySymbolInfo(cmp);

    if (
      symbolInfo.isChild &&
      !symbolInfo.childId &&
      cmp.get("type").toLowerCase() != "textnode"
    ) {
      // console.log(
      //   cmp,
      //   "from drop",
      //   cmp.toHTML(),
      //   cmp.get("type"),
      //   symbolInfo.isChild,
      //   symbolInfo.childId
      // );

      const childId = uniqueID();
      cmp.addAttributes({
        // [`${inf_symbol_instance_Id_attribute}-${symbolInfo.mainId.toLowerCase()}`]:
        //   childId,
        // [inf_bridge_id]: childId,
        [inf_class_name]: `inf-${childId}`,
      });
    }
  };
};
