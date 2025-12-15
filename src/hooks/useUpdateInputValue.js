import { useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  animationsState,
  cmpRulesState,
  cssPropForAssetsManagerState,
  currentElState,
  framesStylesState,
  ruleState,
  selectorState,
  showAnimationsBuilderState,
  showStylesBuilderForMotionBuilderState,
} from "../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";
import {
  extractAllRulesWithChildRules,
  getCurrentMediaDevice,
  getCurrentSelector,
  getStyles,
} from "../helpers/functions";
import { inf_symbol_Id_attribute } from "../constants/shared";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { isFunction } from "lodash";
import { infinitelyCallback } from "../helpers/bridge";

let saveTimeout;
let idleId;

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
  const currentElObj = useRecoilValue(currentElState);
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const selector = useRecoilValue(selectorState);
  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);
  const [showStylesBuilder, setShowStylesBuilder] = useRecoilState(
    showStylesBuilderForMotionBuilderState
  );
  const framesStyles = useRecoilValue(framesStylesState);
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [animations, setAnimations] = useRecoilState(animationsState);
  const conditionalCmpRules = isFunction(getAllStyles) ? cmpRules : null;

  // const cssPropForAM = useRecoilValue(cssPropForAssetsManagerState);
  function getRuleStyle(isDeviceEvent) {
    if (!editor) return;
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);
    console.log("currentSelector : ", currentSelector, rule);
    // console.log("rule.ruleString : ", rule.ruleString);
    // console.log("rule.atRuleParams : ", rule.atRuleParams);
    // console.log("rule.atRuleType : ", rule.atRuleType);
    // console.log("rule.is : ", rule.is);
    // console.log("rules : ", rule);

    if (!currentSelector) {
      return {
        [cssProp]: "",
      };
    }

    const mediaAccordingToRule =
      (rule.atRuleParams && rule.atRuleType && !isDeviceEvent) ||
      (rule.is && !isDeviceEvent)
        ? {
            atRuleParams: rule.atRuleParams,
            atRuleType: rule.atRuleType,
          }
        : { ...Media };
    // console.log("mediaAccordingToRule  : ", mediaAccordingToRule);

    //==========
    const outPut = editor.Css.getRule(
      `${currentSelector}${rule.ruleString}`,
      mediaAccordingToRule
    )?.toJSON()?.style;

    // console.log("style output : ", outPut , cssProp , selector , mediaAccordingToRule);

    return outPut || {};
  }

  const handler = ({ isDeviceEvent = false , keepStylesAsObj = false }) => {
    if (!editor) return;
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);
    console.log("styles : ", cssProp, currentSelector);
    
    if(keepStylesAsObj){
      return getRuleStyle(isDeviceEvent);
    }

    if (isFunction(getAllStyles)) {
      (showAnimationsBuilder || showStylesBuilder) && console.log("framesStyles : ", framesStyles);
      getAllStyles(
        showAnimationsBuilder || showStylesBuilder ? framesStyles : getRuleStyle(isDeviceEvent) || {}
      );
      return;
    }

    
    
    if (!currentSelector && !showAnimationsBuilder && !showStylesBuilder) {
      setVal("");
      onEffect(cssProp, "");
      return;
    }
    // console.log("rrrrrrule gog: ", currentSelector , rule.is, cssProp);

    if (
      !slEL &&
      !getRuleStyle(isDeviceEvent)[cssProp] &&
      !returnPropsAsIt &&
      !Object.values(framesStyles || {}).length &&
      !showStylesBuilder
    ) {
      // console.log("rrrrrrule gog: sd", cssProp, getRuleStyle());

      setVal("");
      onEffect(cssProp, "");
      return;
    }
    
    if (slEL && !showAnimationsBuilder && !showStylesBuilder) {
      const slElStyles = slEL.getStyle();
      // const infSymbolAttrValue = slEL.getAttributes()[inf_symbol_Id_attribute];
      // console.log("styles : ");

      // console.log("rrrrrrule gog: ", currentSelector || rule.is, cssProp);

      if (currentSelector || rule.is) {
        const value = returnPropsAsIt
          ? getRuleStyle(isDeviceEvent)
          : getRuleStyle(isDeviceEvent)[cssProp] || "";
        // console.log('valueee : ' , value , getRuleStyle(isDeviceEvent) , cssProp);

        setVal(value);
        onEffect(cssProp, value);
      } else {
        setVal("");
        onEffect(cssProp, value);
      }
    }
      // console.log("rrrrrrule gog: ", currentSelector || rule.is, cssProp);

    if (showAnimationsBuilder || showStylesBuilder) {
      const value = returnPropsAsIt
        ? framesStyles
        : framesStyles[cssProp] || "";

      setVal(value);
      onEffect(cssProp, value);
      console.log("rrrrrrule gog: 0", currentSelector || rule.is, cssProp);

      // console.log('mounted' , value , cssProp);
    }

    editor.trigger("inf:rules:update");
  };

  useEffect(() => {
    if (!editor) return;
    const pageHandler = () => {
      handler({});
    };
    const deviceHandler = () => {
      handler({ isDeviceEvent: true });
    };
    const setRuleHandler = () => {
      handler({});
    };
    editor.on(InfinitelyEvents.pages.select, pageHandler);
    editor.on("device:change", deviceHandler);
    editor.on("inf:rules:set", setRuleHandler);
    // const frameStylesHandler = (ev) => {
    //   console.log('lol');

    //   const framesStyles = ev.detail;
    //   handler({ framesStyles });
    // };
    // keyframeStylesInstance.on(
    //   InfinitelyEvents.keyframe.set,
    //   frameStylesHandler
    // );
    return () => {
      editor.off(InfinitelyEvents.pages.select, pageHandler);
      editor.off("device:change", deviceHandler);
      // editor.off("inf:rules:set", setRuleHandler);
      // keyframeStylesInstance.off(
      //   InfinitelyEvents.keyframe.set,
      //   frameStylesHandler
      // );
    };
  }, [
    editor,
    currentElObj,
    selector,
    rule,
    showAnimationsBuilder,
    // showStylesBuilder,
    // animations,
    framesStyles,
    conditionalCmpRules,
    // isFunction(getAllStyles) ? cmpRules : null,
    ...debs,
  ]);

  useEffect(() => {
    //(isFunction(getAllStyles) ? useEffect : useMemo)
    // console.log(!currentElObj?.currentEl  && !showAnimationsBuilder && !editor.getSelected());
    if (!editor) return;
    // if(showAnimationsBuilder)return;
    // if(showStylesBuilder){
    //   handler({});
    //   return;
    // }
    if (
      !currentElObj?.currentEl &&
      !showAnimationsBuilder &&
      !showStylesBuilder &&
      !editor.getSelected()
    )
      return;

    // if(!editor.getSelected()) return;
    saveTimeout && clearTimeout(saveTimeout);
    // if(`requestIdleCallback` in window){
    //   requestIdleCallback(() => {
    //     handler({});
    //   });
    // }
    // else {
    //   setTimeout(() => {
    //     handler({});
    //   }, 0);
    // }
    //  saveTimeout = setTimeout(() => {
    // }, 5);
    // console.log("i should work", cssProp);
    // if (idleId) {
    //   window.cancelIdleCallback && cancelIdleCallback(idleId);
    //   clearTimeout(idleId);
    // }
    // idleId = infinitelyCallback(() => {
    //   console.log('updating display effect :' ,cssProp);

    // handler({});
    // }, 10);
    handler({});
  }, [
    editor,
    currentElObj,
    selector,
    rule,
    showAnimationsBuilder,
    showStylesBuilder,
    framesStyles,
    // animations,
    // cmpRules,
    conditionalCmpRules,
    // isFunction(getAllStyles) ? cmpRules : null,
    ...debs,
  ]);
};
