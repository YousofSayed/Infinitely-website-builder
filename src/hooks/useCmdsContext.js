import {
  current_dynamic_template_id,
  current_page_id,
} from "@/constants/shared";
import { cmdsContextState } from "@/helpers/atoms";
import { getAlpineContext } from "@/helpers/bridge";
import { getProjectData, parseCmds } from "@/helpers/functions";
import { useEditorMaybe } from "@grapesjs/react";
import { forIn } from "lodash";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

// 

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
      window.monacoLoaded = false;
    },
  ];
};
