import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { inf_symbol_Id_attribute } from "@/constants/shared";
import {
  animationsState,
  cmpRulesState,
  cssPropForAssetsManagerState,
  currentElState,
  framesStylesState,
  ruleState,
  selectorState,
  showAnimationsBuilderState,
  showComponentsInLeftPanelState,
  showStylesBuilderForMotionBuilderState,
} from "@/helpers/atoms";
import { infinitelyCallback } from "@/helpers/bridge";
import {
  extractAllRulesWithChildRules,
  getCurrentMediaDevice,
  getCurrentSelector,
  getStyles,
} from "@/helpers/functions";
import { useEditorMaybe } from "@grapesjs/react";
import { isFunction } from "lodash";
import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

let saveTimeout;
let idleId;

// 🚀 CACHE: Prevents heavy GrapesJS queries from running 100 times per click
let styleCache = {
  key: null,
  styles: {},
  version: 0,
};
let currentCssVersion = 0;

export const clearStyleCache = () => {
  currentCssVersion++;
};

let propsWillChangeForTimeout = {};

/**
 *
 * @param {{ cssProp:string ,setVal:Function ,returnPropsAsIt:boolean, getAllStyles:(styles:CSSStyleDeclaration)=>void, onEffect :(cssProp:string , value : string )=>{} , debs:any[]}}} param0
 */
export const useUpdateInputValue = ({
  cssProp,
  setVal = (_) => {},
  returnPropsAsIt = false,
  getAllStyles,
  onEffect = (cssProp, setVal) => {},
  debs = [],
}) => {
  // ✅ KEEP Recoil subscriptions — they are what make values appear immediately
  const currentElObj = useRecoilValue(currentElState);
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const selector = useRecoilValue(selectorState);
  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);
  const [showStylesBuilder, setShowStylesBuilder] = useRecoilState(
    showStylesBuilderForMotionBuilderState,
  );
  const framesStyles = useRecoilValue(framesStylesState);
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [animations, setAnimations] = useRecoilState(animationsState);
  const conditionalCmpRules = isFunction(getAllStyles) ? cmpRules : null;
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  // 🚀 BAIL-OUT REF: Prevents useless re-renders when value hasn't changed
  const prevValueRef = useRef(null);

  function getRuleStyle(isDeviceEvent) {
    if (!editor) return {};
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);

    if (!currentSelector) return {};

    const mediaAccordingToRule =
      (rule.atRuleParams && rule.atRuleType && !isDeviceEvent) ||
      (rule.is && !isDeviceEvent)
        ? { atRuleParams: rule.atRuleParams, atRuleType: rule.atRuleType }
        : { ...Media };

    // 🚀 CACHE KEY
    const mediaKey = JSON.stringify(mediaAccordingToRule);
    const currentCacheKey = `${currentSelector}-${rule.ruleString}-${mediaKey}-${rule.is}`;

    // 🚀 RETURN CACHED STYLES INSTANTLY IF MATCH
    if (
      styleCache.key === currentCacheKey &&
      styleCache.version === currentCssVersion
    ) {
      return styleCache.styles;
    }

    // 🐢 HEAVY GRAPESJS QUERY (Only runs ONCE per element selection)
    const outPut =
      editor.Css.getRule(
        `${currentSelector}${rule.ruleString}`,
        mediaAccordingToRule,
      )?.toJSON()?.style || {};

    // 🚀 UPDATE CACHE
    styleCache.key = currentCacheKey;
    styleCache.styles = outPut;
    styleCache.version = currentCssVersion;

    return outPut;
  }

  const handler = ({ isDeviceEvent = false, keepStylesAsObj = false }) => {
    if (!editor) return;
    const slEL = editor?.getSelected();
    const currentSelector = getCurrentSelector(selector, slEL);

    if (keepStylesAsObj) {
      return getRuleStyle(isDeviceEvent);
    }

    if (isFunction(getAllStyles)) {
      getAllStyles(
        showsComponents.animationsBuilder || showsComponents.stylesBuilder
          ? framesStyles
          : getRuleStyle(isDeviceEvent) || {},
      );
      return;
    }

    let valueToSet = "";
    let shouldUpdate = false;

    if (
      !currentSelector &&
      !showsComponents.animationsBuilder &&
      !showsComponents.stylesBuilder
    ) {
      valueToSet = "";
      shouldUpdate = true;
    } else if (
      !slEL &&
      !getRuleStyle(isDeviceEvent)[cssProp] &&
      !returnPropsAsIt &&
      !Object.values(framesStyles || {}).length &&
      !showsComponents.stylesBuilder
    ) {
      valueToSet = "";
      shouldUpdate = true;
    } else if (
      slEL &&
      !showsComponents.animationsBuilder &&
      !showsComponents.stylesBuilder
    ) {
      if (currentSelector || rule.is) {
        valueToSet = returnPropsAsIt
          ? getRuleStyle(isDeviceEvent)
          : getRuleStyle(isDeviceEvent)[cssProp] || "";
        shouldUpdate = true;
      } else {
        valueToSet = "";
        shouldUpdate = true;
      }
    } else if (
      showsComponents.animationsBuilder ||
      showsComponents.stylesBuilder
    ) {
      valueToSet = returnPropsAsIt ? framesStyles : framesStyles[cssProp] || "";
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      // 🚀 BAIL OUT: Skip if the value hasn't actually changed
      const isObject = typeof valueToSet === "object" && valueToSet !== null;
      const isSame = isObject
        ? JSON.stringify(prevValueRef.current) === JSON.stringify(valueToSet)
        : prevValueRef.current === valueToSet;

      if (!isSame) {
        prevValueRef.current = valueToSet;
        setVal(valueToSet);
        onEffect(cssProp, valueToSet);
      }
    }

    // ❌ REMOVED: editor.trigger("inf:rules:update");
    // This was firing 100 times per click and freezing the app
  };

  // 🚀 EVENT LISTENERS: Attached once, stable reference
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const runHandler = useCallback(() => {
    // Yield to browser so it can paint the selection highlight first
    setTimeout(() => {
      if (handlerRef.current) handlerRef.current({});
    }, 16);
  }, []);

  useEffect(() => {
    if (!editor) return;

    editor.on("component:selected", runHandler);
    editor.on("component:deselected", runHandler);
    editor.on("device:change", runHandler);
    editor.on("inf:rules:set", runHandler);
    editor.on(InfinitelyEvents.pages.select, runHandler);

    if (editor.getSelected()) {
      setTimeout(() => {
        if (handlerRef.current) handlerRef.current({});
      }, 16);
    }

    return () => {
      editor.off("component:selected", runHandler);
      editor.off("component:deselected", runHandler);
      editor.off("device:change", runHandler);
      editor.off("inf:rules:set", runHandler);
      editor.off(InfinitelyEvents.pages.select, runHandler);
    };
  }, [editor, runHandler]);

    // 🚀 RECOIL-DRIVEN UPDATE: Runs IMMEDIATELY when selector/rule/currentEl changes
  // This is what makes SelectClass and SelectState work - they call setSelector/setRule
  // and the style inputs must react instantly
  useEffect(() => {
    if (!editor) return;
    if (
      !currentElObj?.currentEl &&
      !showsComponents.animationsBuilder &&
      !showsComponents.stylesBuilder &&
      !editor.getSelected()
    )
      return;

    saveTimeout && clearTimeout(saveTimeout);

    // ✅ NO setTimeout here - must run immediately for class/state selection
    handler({});
  }, [
    editor,
    currentElObj,
    selector,
    rule,
    showsComponents.animationsBuilder,
    showsComponents.stylesBuilder,
    framesStyles,
    conditionalCmpRules,
    ...debs,
  ]);
};
// import { InfinitelyEvents } from "@/constants/infinitelyEvents";
// import { inf_symbol_Id_attribute } from "@/constants/shared";
// import {
//   animationsState,
//   cmpRulesState,
//   cssPropForAssetsManagerState,
//   currentElState,
//   framesStylesState,
//   ruleState,
//   selectorState,
//   showAnimationsBuilderState,
//   showComponentsInLeftPanelState,
//   showStylesBuilderForMotionBuilderState,
// } from "@/helpers/atoms";
// import { infinitelyCallback } from "@/helpers/bridge";
// import {
//   extractAllRulesWithChildRules,
//   getCurrentMediaDevice,
//   getCurrentSelector,
//   getStyles,
// } from "@/helpers/functions";
// import { useEditorMaybe } from "@grapesjs/react";
// import { isFunction } from "lodash";
// import { useEffect, useMemo } from "react";
// import { useRecoilState, useRecoilValue } from "recoil";

// let saveTimeout;
// let idleId;

// let propsWillChangeForTimeout = {};
// /**
//  *
//  * @param {{ cssProp:string ,setVal:Function ,returnPropsAsIt:boolean, getAllStyles:(styles:CSSStyleDeclaration)=>void, onEffect :(cssProp:string , value : string )=>{} , debs:any[]}}} param0
//  */
// export const useUpdateInputValue = ({
//   cssProp,
//   setVal = (_) => {},
//   returnPropsAsIt = false,
//   getAllStyles,
//   onEffect = (cssProp, setVal) => {},
//   debs = [],
// }) => {
//   const currentElObj = useRecoilValue(currentElState);
//   const editor = useEditorMaybe();
//   const rule = useRecoilValue(ruleState);
//   const selector = useRecoilValue(selectorState);
//   const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);
//   const [showStylesBuilder, setShowStylesBuilder] = useRecoilState(
//     showStylesBuilderForMotionBuilderState
//   );
//   const framesStyles = useRecoilValue(framesStylesState);
//   const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
//   const [animations, setAnimations] = useRecoilState(animationsState);
//   const conditionalCmpRules = isFunction(getAllStyles) ? cmpRules : null;
//   const [showsComponents, setShowsComponents] = useRecoilState(
//     showComponentsInLeftPanelState,
//   );

//   // const cssPropForAM = useRecoilValue(cssPropForAssetsManagerState);
//   function getRuleStyle(isDeviceEvent) {
//     if (!editor) return;
//     const slEL = editor?.getSelected();
//     const Media = getCurrentMediaDevice(editor);
//     const currentSelector = getCurrentSelector(selector, slEL);
//     console.log("currentSelector : ", currentSelector, rule);
//     // console.log("rule.ruleString : ", rule.ruleString);
//     // console.log("rule.atRuleParams : ", rule.atRuleParams);
//     // console.log("rule.atRuleType : ", rule.atRuleType);
//     // console.log("rule.is : ", rule.is);
//     // console.log("rules : ", rule);

//     if (!currentSelector) {
//       return {
//         [cssProp]: "",
//       };
//     }

//     const mediaAccordingToRule =
//       (rule.atRuleParams && rule.atRuleType && !isDeviceEvent) ||
//       (rule.is && !isDeviceEvent)
//         ? {
//             atRuleParams: rule.atRuleParams,
//             atRuleType: rule.atRuleType,
//           }
//         : { ...Media };
//     // console.log("mediaAccordingToRule  : ", mediaAccordingToRule);

//     //==========
//     const outPut = editor.Css.getRule(
//       `${currentSelector}${rule.ruleString}`,
//       mediaAccordingToRule
//     )?.toJSON()?.style;

//     // console.log("style output : ", outPut , cssProp , selector , mediaAccordingToRule);

//     return outPut || {};
//   }

//   const handler = ({ isDeviceEvent = false , keepStylesAsObj = false }) => {
//     if (!editor) return;
//     const slEL = editor?.getSelected();
//     const Media = getCurrentMediaDevice(editor);
//     const currentSelector = getCurrentSelector(selector, slEL);
//     console.log("styles : ", cssProp, currentSelector);
    
//     if(keepStylesAsObj){
//       return getRuleStyle(isDeviceEvent);
//     }

//     if (isFunction(getAllStyles)) {
//       (showsComponents.animationsBuilder || showsComponents.stylesBuilder) && console.log("framesStyles : ", framesStyles);
//       getAllStyles(
//         showsComponents.animationsBuilder || showsComponents.stylesBuilder ? framesStyles : getRuleStyle(isDeviceEvent) || {}
//       );
//       return;
//     }

    
    
//     if (!currentSelector && !showsComponents.animationsBuilder && !showsComponents.stylesBuilder) {
//       setVal("");
//       onEffect(cssProp, "");
//       return;
//     }
//     // console.log("rrrrrrule gog: ", currentSelector , rule.is, cssProp);

//     if (
//       !slEL &&
//       !getRuleStyle(isDeviceEvent)[cssProp] &&
//       !returnPropsAsIt &&
//       !Object.values(framesStyles || {}).length &&
//       !showsComponents.stylesBuilder
//     ) {
//       // console.log("rrrrrrule gog: sd", cssProp, getRuleStyle());

//       setVal("");
//       onEffect(cssProp, "");
//       return;
//     }
    
//     if (slEL && !showsComponents.animationsBuilder && !showsComponents.stylesBuilder) {
//       const slElStyles = slEL.getStyle();
//       // const infSymbolAttrValue = slEL.getAttributes()[inf_symbol_Id_attribute];
//       // console.log("styles : ");

//       // console.log("rrrrrrule gog: ", currentSelector || rule.is, cssProp);

//       if (currentSelector || rule.is) {
//         const value = returnPropsAsIt
//           ? getRuleStyle(isDeviceEvent)
//           : getRuleStyle(isDeviceEvent)[cssProp] || "";
//         // console.log('valueee : ' , value , getRuleStyle(isDeviceEvent) , cssProp);

//         setVal(value);
//         onEffect(cssProp, value);
//       } else {
//         setVal("");
//         onEffect(cssProp, value);
//       }
//     }
//       // console.log("rrrrrrule gog: ", currentSelector || rule.is, cssProp);

//     if (showsComponents.animationsBuilder || showsComponents.stylesBuilder) {
//       const value = returnPropsAsIt
//         ? framesStyles
//         : framesStyles[cssProp] || "";

//       setVal(value);
//       onEffect(cssProp, value);
//       console.log("rrrrrrule gog: 0", currentSelector || rule.is, cssProp);

//       // console.log('mounted' , value , cssProp);
//     }

//     editor.trigger("inf:rules:update");
//   };

//   useEffect(() => {
//     if (!editor) return;
//     const pageHandler = () => {
//       handler({});
//     };
//     const deviceHandler = () => {
//       handler({ isDeviceEvent: true });
//     };
//     const setRuleHandler = () => {
//       handler({});
//     };
//     editor.on(InfinitelyEvents.pages.select, pageHandler);
//     editor.on("device:change", deviceHandler);
//     editor.on("inf:rules:set", setRuleHandler);
//     // const frameStylesHandler = (ev) => {
//     //   console.log('lol');

//     //   const framesStyles = ev.detail;
//     //   handler({ framesStyles });
//     // };
//     // keyframeStylesInstance.on(
//     //   InfinitelyEvents.keyframe.set,
//     //   frameStylesHandler
//     // );
//     return () => {
//       editor.off(InfinitelyEvents.pages.select, pageHandler);
//       editor.off("device:change", deviceHandler);
//       // editor.off("inf:rules:set", setRuleHandler);
//       // keyframeStylesInstance.off(
//       //   InfinitelyEvents.keyframe.set,
//       //   frameStylesHandler
//       // );
//     };
//   }, [
//     editor,
//     currentElObj,
//     selector,
//     rule,
//     showsComponents.animationsBuilder,
//     // showAnimationsBuilder,
//     // showStylesBuilder,
//     // animations,
//     framesStyles,
//     conditionalCmpRules,
//     // isFunction(getAllStyles) ? cmpRules : null,
//     ...debs,
//   ]);

//   useEffect(() => {
//     //(isFunction(getAllStyles) ? useEffect : useMemo)
//     // console.log(!currentElObj?.currentEl  && !showAnimationsBuilder && !editor.getSelected());
//     if (!editor) return;
//     // if(showAnimationsBuilder)return;
//     // if(showStylesBuilder){
//     //   handler({});
//     //   return;
//     // }
//     if (
//       !currentElObj?.currentEl &&
//       !showsComponents.animationsBuilder &&
//       !showsComponents.stylesBuilder &&
//       !editor.getSelected()
//     )
//       return;

//     // if(!editor.getSelected()) return;
//     saveTimeout && clearTimeout(saveTimeout);
//     // if(`requestIdleCallback` in window){
//     //   requestIdleCallback(() => {
//     //     handler({});
//     //   });
//     // }
//     // else {
//     //   setTimeout(() => {
//     //     handler({});
//     //   }, 0);
//     // }
//     //  saveTimeout = setTimeout(() => {
//     // }, 5);
//     // console.log("i should work", cssProp);
//     // if (idleId) {
//     //   window.cancelIdleCallback && cancelIdleCallback(idleId);
//     //   clearTimeout(idleId);
//     // }
//     // idleId = infinitelyCallback(() => {
//     //   console.log('updating display effect :' ,cssProp);

//     // handler({});
//     // }, 10);
//     handler({});
//   }, [
//     editor,
//     currentElObj,
//     selector,
//     rule,
//     // showAnimationsBuilder,
//     // showStylesBuilder,
//     showsComponents.animationsBuilder,
//     showsComponents.stylesBuilder,
//     framesStyles,
//     // animations,
//     // cmpRules,
//     conditionalCmpRules,
//     // isFunction(getAllStyles) ? cmpRules : null,
//     ...debs,
//   ]);
// };
