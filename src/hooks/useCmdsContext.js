import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { cmdsContextState } from "../helpers/atoms";
import { getProjectData, parseCmds } from "../helpers/functions";
import {
  current_dynamic_template_id,
  current_page_id,
} from "../constants/shared";
import { useEditorMaybe } from "@grapesjs/react";
import { getAlpineContext } from "../helpers/bridge";
// import { forIn } from "lodash";

/**
 * Custom hook to manage IndexedDB state using Recoil.
 * @returns {[string, () => void]} An array where:
 *   - The first element is the current CocktailDB instance (or null).
 *   - The second element is a setter function to set a new CocktailDB instance.
 */
export const useCmdsContext = () => {
  // const cmdsContext = useRecoilValue(cmdsContextState);
  // const setCmdsContextRv = useSetRecoilState(cmdsContextState);
  const [cmdsContext, setCmdsContextRv] = useRecoilState(cmdsContextState);
  const editor = useEditorMaybe();

  return [
    cmdsContext,

    /**
     * 
     * @param {import('grapesjs').Component} cmp 
     */
    async function setCmdsContext(cmp) {
      const sle = editor?.getSelected?.();
      if(editor && sle){
        console.log('sle : ' ,sle);
        
        const context = getAlpineContext(editor  ,cmp || sle)
        setCmdsContextRv((old) => context);
      }else{
        setCmdsContextRv((old) => '');
      }
      // const projectData = await getProjectData();
      // const pageName = localStorage.getItem(current_page_id);
      // const currentDynamicTemplateId = sessionStorage.getItem(
      //   current_dynamic_template_id
      // );
      // const pages = projectData.pages;
      // const dynamicTemplates = projectData.dynamicTemplates;

      // const getAllCmds = () => {
      //   /**
      //    * @type {import('../helpers/types').CMD[]}
      //    */
      //   const allCmds = [];

      //   for (const page of Object.values(pages)) {
      //     allCmds.push(...Object.values(page.cmds));
      //   }

      //   for (const dynamicTemplate of Object.values(dynamicTemplates)) {
      //     allCmds.push(...Object.values(dynamicTemplate.cmds));
      //   }

      //   return allCmds;
      // };
      // // currentDynamicTemplateId &&
      // const cmds = currentDynamicTemplateId
      //   ? getAllCmds()
      //   : Object.values(projectData.pages[`${pageName}`].cmds);
      // let context = { vars: {}, objectsKeys: {}, params: [], forIndexes: [] };

      // cmds.forEach((cmds) => {
      //   if (!cmds || !cmds.length) return;
      //   const parsedCmds = parseCmds(cmds);
      //   console.log("Cmd :", cmds, parsedCmds);

      //   context = {
      //     ...context,
      //     ...{
      //       vars: { ...context?.vars, ...parsedCmds.vars },
      //       objectskeys: { ...context?.objectsKeys, ...parsedCmds.objectskeys },
      //       params: [...new Set([...context?.params, ...parsedCmds.params])],
      //       forIndexes: [
      //         ...new Set([...context?.forIndexes, ...parsedCmds.forIndexes]),
      //       ],
      //     },
      //   };
      // });
      // setCmdsContextRv((old) => context);
      // {
      //   vars: { ...old.vars, ...parsedCmds.vars },
      //   objectskeys: { ...old.objectsKeys, ...parsedCmds.objectskeys },
      //   params: [...new Set([...old.params, ...parsedCmds.params])],
      //   forIndexes: [...new Set([...old.forIndexes, ...parsedCmds.forIndexes])],
      // }
      // const cmdsInfAttr = gjsComponent.getAttributes()["inf-cmds"];
      // const childs = gjsComponent.components().models;
      // if (!cmdsInfAttr) return;
      // const cmds = JSON.parse(cmdsInfAttr);

      // const parsedCmds = parseCmds(cmds);
      // console.log('parssed : ' , parsedCmds);
      // setCmdsContextRv((old) => ({
      //   vars: {  ...parsedCmds.vars },
      //   objectskeys: {  ...parsedCmds.objectskeys },
      //   params: [ ...parsedCmds.params],
      // }));
      // if (childs.length) {
      //   childs.forEach((child) => {
      //     setCmdsContext(child);
      //   });
      // }
    },
  ];
};

/**
 * Custom hook to manage IndexedDB state using Recoil.
 * @returns {[import('../helpers/types').CMDSContext|null, (dbName: string) => void]} An array where:
 *   - The first element is the current CocktailDB instance (or null).
 *   - The second element is a setter function to set a new CocktailDB instance.
 */
