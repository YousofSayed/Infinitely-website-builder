import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  ruleState,
  selectorState,
  showAnimationsBuilderState,
  animeStylesState,
  blocksStt,
} from "../helpers/atoms";

import { useEditorMaybe } from "@grapesjs/react";
import { useRemoveCssProp } from "./useRemoveCssProp";
import {
  getCurrentMediaDevice,
  getCurrentSelector,
  getInfinitelySymbolInfo,
  getProjectData,
} from "../helpers/functions";
import { current_project_id, current_symbol_id } from "../constants/shared";
import { db } from "../helpers/db";
import { dynamicTemplatesType } from "../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { InfinitelyEvents } from "../constants/infinitelyEvents";

/**
 *
 * @param {{ifrDocument:Document , currentEl:HTMLElement , cssProp:string , value:string}} param0
 */
export function useSetClassForCurrentEl() {
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const selector = useRecoilValue(selectorState);
  const blocks = useRecoilValue(blocksStt);
  const setBlocks = useSetRecoilState(blocksStt);
  const removeProp = useRemoveCssProp();



 
  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);
 
  const setAnimeStyles = useSetRecoilState(animeStylesState);
  

  return ({ cssProp, value }) => {
    let newCssProps = {};

    if (Array.isArray(cssProp) && Array.isArray(value)) {
      cssProp.forEach((prop, i) => {
        // if (showAnimationsBuilder) {
        //   setAnimeStyles({
        //     [prop]: CSS.supports(prop, value[i]) ? value[i] : "",
        //   });
        //   return;
        // }

        if (!CSS.supports(prop, value[i]) && value[i]) {
          removeProp({ cssProp: prop });
          return;
        }

        newCssProps = { ...newCssProps, [prop]: value[i] };
      });
    } else if (Array.isArray(cssProp) && !Array.isArray(value)) {
      cssProp.forEach((prop, i) => {
        // if (showAnimationsBuilder) {
        //   setAnimeStyles({
        //     [prop]: CSS.supports(prop, value) ? value : "",
        //   });

        //   return;
        // }

        if (!CSS.supports(prop, value) && value) {
          removeProp({ cssProp: prop });
          return;
        }

        newCssProps = { ...newCssProps, [prop]: value };
      });
    } else {
      // if (showAnimationsBuilder) {
      //   console.log("color", CSS.supports(cssProp, value));

      //   setAnimeStyles({
      //     [cssProp]: CSS.supports(cssProp, value) ? value : "",
      //   });

      //   return;
      // }

      newCssProps =
        CSS.supports(cssProp, value) || value
          ? { ...newCssProps, [cssProp]: value }
          : { ...newCssProps } && removeProp({ cssProp });
    }

    if (showAnimationsBuilder) {
      newCssProps = newCssProps ? newCssProps : { [cssProp]: null };
      // setAnimeStyles((old) => ({ ...old, ...newCssProps }));
      setAnimeStyles({ ...newCssProps });
      return;
    } //stop any action if animation builder is on

    if (
      rule.ruleString.includes("before") ||
      rule.ruleString.includes("after")
    ) {
      newCssProps.content = " '' ";
    }

    const Media = getCurrentMediaDevice(editor);
    const sle = editor.getSelected();
    const currentSelector = getCurrentSelector(selector, sle);
    const symbolInfo = getInfinitelySymbolInfo(sle);

    // const symbolInfo = editor.Components.getSymbolInfo(editor?.getSelected());
    // if (!selector && symbolInfo.isSymbol) {
    //   const instances = symbolInfo.instances
    //   //   .filter((instance) => instance.getEl())
    //   //   .map((instance) => instance.getEl());
    //   // instances.forEach((instance) => {
    //     // editor.Css.setRule(`#${instance.id}${rule.ruleString}`, newCssProps, {
    //     //   addStyles: true,
    //     //   ...Media,
    //     //   // atRuleParams:rule.atRuleParams,
    //     //   // atRuleType:rule.atRuleType
    //     // });

    //   // });

    //   instances.forEach((instance)=>{
    //     editor.Css.setRule(`#${instance.getId()}${rule.ruleString}`, newCssProps, {
    //       addStyles: true,
    //       ...Media,
    //       // atRuleParams:rule.atRuleParams,
    //       // atRuleType:rule.atRuleType
    //     });
    //   })

    //   // symbolInfo.instances.forEach(instance=>{
    //   //   instance.addStyle(newCssProps)
    //   // });

    // } else {
    //   editor.Css.setRule(`${currentSelector}${rule.ruleString}`, newCssProps, {
    //     addStyles: true,
    //     ...Media,
    //     // atRuleParams:rule.atRuleParams,
    //     // atRuleType:rule.atRuleType
    //   });
    // }

    // editor.getSelected().removeStyle(cssProp)
    // newCssProps &&  Object.keys(newCssProps).forEach((key) => {
    //     newCssProps[key] = `${newCssProps[key]}!important;`;
    //   });

    // console.log("props : ", newCssProps);

    editor.CssComposer.setRule(
      `${currentSelector}${rule.ruleString}`,
      newCssProps || { [cssProp]: "" },
      {
        ...Media,
        addStyles: true,
      }
    );

    // const updateDynamicTemplates = async () => {
    //   const selectedEl = getDynamicComponent(editor?.getSelected());
    //   // console.log('selectedEl : ' , selectedEl.getEl());

    //   const currentDynamicTemplateId = sessionStorage.getItem(
    //     current_dynamic_template_id
    //   );

    //   // console.log("id : ", currentDynamicTemplateId);

    //   if (!selectedEl || !currentDynamicTemplateId) {
    //     return;
    //   }
    //   // console.log("style update");

    //   updateDynamicTemplateTimeout &&
    //     clearTimeout(updateDynamicTemplateTimeout);

    //   // updateDynamicTemplateTimeout &&
    //   //   cancelAnimationFrame(updateDynamicTemplateTimeout) && (updateDynamicTemplateTimeout= null);

    //   updateDynamicTemplateTimeout = setTimeout(async () => {
    //     const image = await toSvg(selectedEl.getEl());
    //     setDynamicTemplates(
    //       {
    //         // parentRules: extractRulesById(
    //         //   editor.getCss(),
    //         //   `#${selectedEl.getId()}`
    //         // ),
    //         // childRuls: extractChildsRules(editor.getCss(), selectedEl),
    //         allRules: extractAllRulesWithChildRules(editor.getCss(), selectedEl)
    //           .asString,
    //         imgSrc: image,
    //       },
    //       currentDynamicTemplateId
    //     );
    //     // await html2canvas(document.body , {foreignObjectRendering:true , useCORS:true, })
    //     // console.log(await takeScreenshot(sle.getEl()));
    //   }, 50);
    // };

    // updateDynamicTemplates();

    // editor.trigger("component:style:update", {
    //   el: editor.getSelected(),
    //   newCssProps,
    //   Media,
    //   currentDynamicTemplateId,
    //   dynamicTemplates,
    // });

    editor.trigger("inf:rules:update", {
      rules: newCssProps,
    });

    // const updateTemplateImage = () => {
    //   const templateInfo = getTemplateInfo(editor.getSelected());
    //   const templateId = templateInfo.id;
    //   if (!templateInfo.isTemplate) return;
    //   sessionStorage.setItem(current_template_id, templateId);
    // };

    // updateTemplateImage();

    if (symbolInfo.isSymbol) {
      console.log("it is symbol");
      const symbolInfo = getInfinitelySymbolInfo(editor.getSelected());
      // editor.trigger(
      //   `${InfinitelyEvents.symbols.update}:${symbolInfo.mainId}`,
      //   symbolInfo.mainId,
      //   null,
      //   JSON.stringify(symbolInfo.symbol)
      // );

      const callback = async () => {
        // editor.trigger('block:add');
        sessionStorage.setItem(
          current_symbol_id,
          symbolInfo.mainId
        );
        // sessionStorage.setItem(
        //   current_symbol_rule,
        //   JSON.stringify({
        //     ruleName: `${currentSelector}${rule.ruleString}`,
        //     media: Media,
        //     currentSelector,
        //     states: rule.ruleString,
        //   })
        // );
      };

      callback();
    } else if (
      !symbolInfo.isSymbol &&
      sessionStorage.getItem(current_symbol_id)
    ) {
      sessionStorage.removeItem(current_symbol_id);
    }

    // editor.getSelected().addStyle(newCssProps)

    // console.log(cssProp, rule.ruleString, "%$%%$#$", editor.getCss());
    // console.log("Editor Css:", editor.getDevice());
    // console.log(editor.Devices.get("tablet").getWidthMedia());
  };
}
