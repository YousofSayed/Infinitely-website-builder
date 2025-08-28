import { useEffect, useMemo } from "react";
import { useRecoilValue } from "recoil";
import {
  cssPropForAssetsManagerState,
  currentElState,
  framesStylesState,
  ruleState,
  selectorState,
  showAnimationsBuilderState,
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
import { useDebounce } from "use-debounce";
let saveTimeout;
/**
 *
 * @param {{ cssProp:string ,setVal:Function ,returnPropsAsIt:boolean, onEffect :(cssProp:string , Value : Function)=>{} }}} param0
 */
export const useUpdateInputValue = ({
  cssProp,
  setVal = (_) => {},
  returnPropsAsIt = false,
  onEffect = (cssProp, setVal) => {},
}) => {
  const currentElObj = useRecoilValue(currentElState);
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const selector = useRecoilValue(selectorState);
  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);
  const framesStyles = useRecoilValue(framesStylesState);
  const setter = (value) => (old) => {
    //  const safeValue = value ?? "";
     
     if (old !== value) return value;
  //    console.log(safeValue , old || "");
  // return old || "";
  };
  ///Debounce
  // const currentElObjDeb = useDebounce(currentElObj , 1000);
  // const editorDeb = useDebounce(editor , 1000);
  // const ruleDeb = useDebounce(currentElObj , 1000);
  // const selectorDev = useDebounce(selector , 1000);
  // const showAnimationsBuilderDeb = useDebounce(showAnimationsBuilder , 1000);
  // const frameStylesDeb = useDebounce(framesStyles , 1000);

  // const cssPropForAM = useRecoilValue(cssPropForAssetsManagerState);
  function getRuleStyle(isDeviceEvent) {
    if (!editor) return;
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);
    // console.log("currentSelector : ", currentSelector);
    // console.log("rule.ruleString : ", rule.ruleString);
    // console.log("rule.atRuleParams : ", rule.atRuleParams);
    // console.log("rule.atRuleType : ", rule.atRuleType);
    // console.log("rule.is : ", rule.is);
    // console.log("rules : ", rule);

    if(!currentSelector){
      return {
        [cssProp]:''
      }
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

    return outPut || {};
  }

  const handler = ({ isDeviceEvent = false }) => {
    if (!editor) return;
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);

    // console.log('styles : ' , getRuleStyle() , framesStyles , !Object.values(framesStyles || {}).length);
    if(!currentSelector)return;
    if (
      !slEL &&
      !getRuleStyle(isDeviceEvent)[cssProp] &&
      !returnPropsAsIt &&
      !Object.values(framesStyles || {}).length
    ) {
      // console.log("!sadsadsa", cssProp, getRuleStyle());

      setVal((old) => {
        if (old) return "";
      });
      onEffect(cssProp, "");
      return;
    }
    if (slEL && !showAnimationsBuilder) {
      const slElStyles = slEL.getStyle();
      // const infSymbolAttrValue = slEL.getAttributes()[inf_symbol_Id_attribute];

      // console.log("rrrrrrule : ", currentSelector || rule.is, cssProp);

      if (currentSelector || rule.is) {
        const value = returnPropsAsIt
          ? getRuleStyle(isDeviceEvent)
          : getRuleStyle(isDeviceEvent)[cssProp] || "";
        // console.log('valueee : ' , value , getRuleStyle() , cssProp);

        setVal(setter(value));
        onEffect(cssProp, value);
      } else if (Object.keys(slElStyles).length) {
        const value = returnPropsAsIt ? slElStyles : slElStyles[cssProp] || "";

        setVal(setter(value));
        onEffect(cssProp, value);
      } else {
        setVal(setter(""));
        onEffect(cssProp, value);
      }
    }

    if (showAnimationsBuilder) {
      const value = returnPropsAsIt
        ? framesStyles
        : framesStyles[cssProp] || "";

      setVal(setter(value));
      onEffect(cssProp, setter(value));
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

    return () => {
      editor.off(InfinitelyEvents.pages.select, pageHandler);
      editor.off("device:change", deviceHandler);
      editor.off("inf:rules:set", setRuleHandler);
    };
  }, [editor]);

  useMemo(() => {
    // console.log(!currentElObj?.currentEl  && !showAnimationsBuilder && !editor.getSelected());
    if (!editor) return;
    if (
      !currentElObj?.currentEl &&
      !showAnimationsBuilder &&
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
    handler({});
  }, [
    editor,
    currentElObj,
    selector,
    rule,
    showAnimationsBuilder,
    framesStyles,

    // editorDeb,
    // currentElObjDeb,
    // selectorDev,
    // ruleDeb,
    // showAnimationsBuilderDeb,
    // frameStylesDeb,

    // cssPropForAM,
  ]);
};
