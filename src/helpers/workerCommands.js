import { parseHTML } from "linkedom";
import { db } from "./db";
import { inf_cmds_id, inf_symbol_Id_attribute } from "../constants/shared";
// import { doDocument } from "./functions";
// import monacoLoader from "@monaco-editor/loader";
// import { buildDynamicTemplate, buildScriptFromCmds } from "./worker_functions";
import { doDocument } from "./bridge";
import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";

const html = String.raw;
const css = String.raw;
/**
 *
 * @param {{projectId : number }} props
 */
export async function updateAllPages(props) {
  try {
    const projectData = await db.projects.get(props.projectId);
    const pages = structuredClone(Object.values(projectData.pages));
    const updatedPages = {};
    await Promise.all(
      pages.map(async (page) => {
        const pageSymbols = [];
        const pageContent = await page.html.text();
        if (!pageContent) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        const { document } = parseHTML(doDocument(pageContent));
        const oldSymbols = document.body.querySelectorAll(
          `[${inf_symbol_Id_attribute}]`
        );

        if (!oldSymbols.length) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        await Promise.all(
          [...oldSymbols].map(async (oldSybmol) => {
            const symbolId = oldSybmol.getAttribute(inf_symbol_Id_attribute);
            pageSymbols.push(symbolId);
            const dbSymbol = projectData.symbols[`${symbolId}`];

            oldSybmol.outerHTML = await dbSymbol.content.text();

            return await oldSybmol;
          })
        );

        page.html = new Blob([document.body.innerHTML], { type: "text/html" });
        page.symbols = pageSymbols;
        updatedPages[page.name] = page;
        return page;
      })
    );

    await db.projects.update(props.projectId, {
      pages: {
        ...updatedPages,
      },
    });

    console.log(`pages updated in worker successfully : `, updatedPages);
  } catch (error) {
    console.error(`From Worker : ${error}`);
  }
}

/**
 *
 * @param {{data : import('./types').Project , projectId : number}} props
 */
export async function storeGrapesjsDataIfSymbols(props) {
  try {
    const projectData = await props.data;
    const pages = structuredClone(Object.values(projectData.pages));
    const updatedPages = {};
    await Promise.all(
      pages.map(async (page) => {
        const pageSymbols = [];
        const pageContent = await page.html.text();
        if (!pageContent) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        const { document } = parseHTML(doDocument(pageContent));
        const oldSymbols = document.body.querySelectorAll(
          `[${inf_symbol_Id_attribute}]`
        );

        if (!oldSymbols.length) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        await Promise.all(
          [...oldSymbols].map(async (oldSybmol) => {
            const symbolId = oldSybmol.getAttribute(inf_symbol_Id_attribute);
            pageSymbols.push(symbolId);
            const dbSymbol = projectData.symbols[`${symbolId}`];

            oldSybmol.outerHTML = await dbSymbol.content.text();

            return await oldSybmol;
          })
        );

        page.html = new Blob([document.body.innerHTML], { type: "text/html" });
        page.symbols = pageSymbols;
        updatedPages[page.name] = page;
        return page;
      })
    );

    await db.projects.update(props.projectId, {
      ...props.data,
      pages: {
        ...updatedPages,
      },
    });

    console.log(`pages updated in worker successfully : `, updatedPages);
  } catch (error) {
    console.error(`From Worker : ${error}`);
  }
}

/**
 *
 * @param {{projectId : string , symbolId:string ,}} props
 */
export async function deleteAllSymbolsById(props) {
  const projectData = await db.projects.get(props.projectId);
  const pages = structuredClone(projectData.pages);
  const updatedPages = {};

  await Promise.all(
    Object.values(pages).map(async (page) => {
      const { document } = parseHTML(doDocument(await page.html.text()));
      const deleteSymbol = (id) => {
        const symbolsById = document.body.querySelectorAll(
          `[${inf_symbol_Id_attribute}="${id}"]`
        );
        symbolsById.forEach((symbol) => symbol.remove());
      };

      Array.isArray(props.symbolId)
        ? props.symbolId.forEach((id) => deleteSymbol(id))
        : deleteSymbol(props.symbolId);

      let pageSymbols = [
        ...document.body.querySelectorAll(`[${inf_symbol_Id_attribute}]`),
      ].map((symbol) => symbol.getAttribute(`[${inf_symbol_Id_attribute}]`));

      page.html = new Blob([document.body.innerHTML], { type: "text/html" });
      page.symbols = pageSymbols;
      updatedPages[page.name] = page;
      return page;
    })
  );

  await db.projects.update(props.projectId, {
    pages: updatedPages,
  });

  self.postMessage({ command: "deleteAllSymbolsById", props: { done: true } });
  console.log("From worker : deleted props is done");
}

/**
 *
 * @param {{data : import('./types').Project , projectId : number}} props
 */
export async function updateDB(props) {
  await db.projects.update(props.projectId, props.data);
  console.log(
    "From worker : Update project is done",
    props.projectId,
    props.data
  );
}

/**
 *
 * @param {{projectId : number , dynamicTemplateId: string, data : import('./types').CMD[]}} props
 */
// export async function updateDynamicTemplates(props) {
//   const projectData = await db.projects.get(props.projectId);
//   const dynamicTemplates = projectData.dynamicTemplates;
//   const targetDynamicTemplate = dynamicTemplates[props.dynamicTemplateId];
//   const pages = projectData.pages;

//   console.log("from worker : ", props);

//   for (const pageKey in pages) {
//     const page = pages[pageKey];
//     const pageCmds = page.cmds;
//     const { document } = parseHTML(doDocument(await page.html.text()));

//     for (const cmdsKey in pageCmds) {
//       for (const cmd of pageCmds[cmdsKey]) {
//         if (cmd.name.toLowerCase() != "put_dynamic_template") continue;

//         for (const param of cmd.params) {
//           if (
//             !param?.renderDynamicElement &&
//             param?.dynamicTemplateId != props?.dynamicTemplateId
//           )
//             continue;

//           param.value = buildDynamicTemplate(
//             html` ${await targetDynamicTemplate.cmp.text()} `,
//             html`
//               <style id="style-of-${targetDynamicTemplate.id}-dynamic-template">
//                 ${await targetDynamicTemplate.allRules.text()}
//               </style>
//             `
//           );
//         }
//       }

//       document
//         .querySelectorAll(`[${inf_cmds_id}="${cmdsKey}"]`)
//         .forEach((el) => {
//           el.setAttribute("_", buildScriptFromCmds(pageCmds[cmdsKey]));
//         });
//     }

//     page.html = new Blob([document.body.innerHTML], { type: "text/html" });
//   }

//   for (const key in dynamicTemplates) {
//     const template = dynamicTemplates[key];
//     if (template.id == props.dynamicTemplateId) continue;
//     const { document } = parseHTML(doDocument(await template.cmp.text()));
//     const cmdsObj = template.cmds;

//     for (const cmdKey in cmdsObj) {
//       const cmds = cmdsObj[cmdKey];

//       for (const cmd of cmds) {
//         if (cmd.name != "put_dynamic_template") continue;

//         for (const param of cmd.params) {
//           console.log("paaarraam : ", param);

//           if (
//             !param.renderDynamicElement ||
//             param?.dynamicTemplateId?.toLowerCase?.() != props.dynamicTemplateId
//           )
//             continue;
//           param.value = buildDynamicTemplate(
//             html` ${await targetDynamicTemplate.cmp.text()} `,
//             html`
//               <style id="style-of-${targetDynamicTemplate.id}-dynamic-template">
//                 ${await targetDynamicTemplate.allRules.text()}
//               </style>
//             `
//           );
//         }
//       }

//       document
//         .querySelectorAll(`[${inf_cmds_id}="${cmdKey}"]`)
//         .forEach((el) => {
//           el.setAttribute("_", buildScriptFromCmds(cmds));
//         });
//     }

//     template.cmp = new Blob([document.body.innerHTML], { type: "text/html" });
//   }

//   await db.projects.update(props.projectId, {
//     pages,
//     dynamicTemplates,
//   });

//   console.log(`From worker all dynamics templates update done 👍`);
// }

/**
 *
 * @param {{projectId:number , key:string}} props
 */
export async function getDataFromDB(props) {
  const projectData = await db.projects.get(props.projectId);

  self.postMessage({
    command: "getDataFromDB",
    props: {
      key: props.key,
      data: projectData[props.key],
    },
  });
  console.log(`From worker ${props.key} geted done 👍`);
}

/**
 *
 * @param {{projectId : number }} props
 */
// workerCommands.js
export function keepSwLive(props) {
  console.log("alive");

  initDBAssetsSw(() => {}).then(async () => {
    // Ensure the SW is registered and active
    // const registration = await navigator.serviceWorker.getRegistration();

    // if (!registration || !registration.active) {
    //   console.log("No active SW, registering...");
    //   await navigator.serviceWorker.register('/dbAssets-sw.js');
    //   keepSwLive(props)
    //   return; // Wait for next interval to post message
    // }

    // const controller = navigator.serviceWorker.controller;
    // if (controller) {
    self.postMessage({
      command: "setVar",
      props: {
        obj: {
          projectId: props.projectId,
          projectData: await db.projects.get(props.projectId),
        },
      },
    });
    // } else {
    //   console.log("SW controller not available yet");
    // }
  });

  fetch("/keep-alive", { mode: "no-cors" });
}

/**
 *
 * @param {{file:File , cssProp , }} props
 */
export function toDataURL(props) {}
