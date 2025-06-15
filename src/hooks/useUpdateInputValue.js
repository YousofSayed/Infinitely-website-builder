import { useEffect } from "react";
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
} from "../helpers/functions";
import { inf_symbol_Id_attribute } from "../constants/shared";
import { InfinitelyEvents } from "../constants/infinitelyEvents";

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
  const cssPropForAM = useRecoilValue(cssPropForAssetsManagerState);

  const handler = ({ isDeviceEvent = false }) => {
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);

    function getRuleStyle () {
      // console.log("currentSelector : ", currentSelector);
      // console.log("rule.ruleString : ", rule.ruleString);
      // console.log("rule.atRuleParams : ", rule.atRuleParams);
      // console.log("rule.atRuleType : ", rule.atRuleType);
      // console.log("rule.is : ", rule.is);
      // console.log("rules : ", rule);

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
    //   console.log("outPut : ", outPut );
    //   console.log("rule : ", rule.ruleString);
    //   console.log('currentSelector is heare' , `${currentSelector}${rule.ruleString}`);
    //   console.log('rule editor' , editor.Css.getRule(
    //     `${currentSelector}${rule.ruleString}`,
    //     // mediaAccordingToRule
    //   ));
    //   console.log('media : ' ,{
    //     atRuleParams: rule.atRuleParams,
    //     atRuleType: rule.atRuleType,
    //   }
    // , { ...Media });
      

      return outPut || {};
    };

    if (!slEL || !getRuleStyle()[cssProp]) {
      // console.log('!sadsadsa' , cssProp , getRuleStyle());
      
      setVal("");
      onEffect(cssProp, "");
      return;
    }
    if (slEL && !showAnimationsBuilder) {
      const slElStyles = slEL.getStyle();
      // const infSymbolAttrValue = slEL.getAttributes()[inf_symbol_Id_attribute];
      
     

      if (currentSelector || rule.is) {
        const value = returnPropsAsIt
          ? getRuleStyle()
          : getRuleStyle()[cssProp] || "";
        setVal(value);
        onEffect(cssProp, value);
      } else if (Object.keys(slElStyles).length) {
        const value = returnPropsAsIt ? slElStyles : slElStyles[cssProp] || "";

        setVal(value);
        onEffect(cssProp, value);
      } else {
        setVal("");
        onEffect(cssProp, "");
      }
    }

    if (showAnimationsBuilder) {
      const value = returnPropsAsIt
        ? framesStyles
        : framesStyles[cssProp] || "";
      setVal(value);
      onEffect(cssProp, value);
    }

    editor.trigger("inf:rules:update");
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    handler({});
  }, [currentElObj, selector, rule, showAnimationsBuilder, framesStyles , cssPropForAM]);
};
