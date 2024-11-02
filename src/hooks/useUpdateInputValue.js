import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { currentElState, ruleState, selectorState } from "../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";

/**
 *
 * @param {{ cssProp:string ,setVal:Function , onEffect :(cssProp:string , Value : Function)=>{} }}} param0
 */
export const useUpdateInputValue = ({
  cssProp,
  setVal = (_) => {},
  onEffect = (cssProp, setVal) => {},
}) => {
  const currentElObj = useRecoilValue(currentElState);
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const selector = useRecoilValue(selectorState);

  useEffect(() => {
    if (currentElObj.currentEl) {
      const slEL = editor.getSelected();
      const slElStyles = slEL.getStyle();
      const getRuleStyle = () => {
        const currentSelector = selector
          ? selector
          : `#${currentElObj.currentEl.id}`;
        const outPut = editor.Css.getRule(
          `${currentSelector}${rule.ruleString}`
        )?.toJSON()?.style;
        return outPut || {};
      };

      if ((cssProp && selector) || (cssProp && rule.is)) {
        setVal(getRuleStyle()[cssProp] || "");
        onEffect(cssProp ,getRuleStyle()[cssProp] || "");
      } else if (slElStyles[cssProp]) {
        setVal(slElStyles[cssProp] || "");
        onEffect(cssProp , slElStyles[cssProp] || "");
      } else {
        setVal("");
        onEffect(cssProp, "");
      }
    }
  }, [currentElObj, rule, selector]);
};
