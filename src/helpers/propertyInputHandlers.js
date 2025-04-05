import { transformToNumInput } from "./cocktail";
import { isValidCssUnit } from "./functions";

/**
 *
 * @param {{ev : InputEvent , isCurrentELChange :{current: boolean}  ,setClass:Function , setVal:Function  ,special:boolean , currentElObj:{currentEl:HTMLElement} , cssProp:string}} param0
 * @returns
 */
export const onInput = ({
  ev,
  isCurrentELChange,
  setClass,
  setVal,
  special = false,
  currentElObj,
  cssProp,
}) => {
  special && transformToNumInput(ev.target);
  if (isCurrentELChange.current) {
    return;
  }
  console.log('inputttttttttttttttt');
  
  
  setClass({
    cssProp: cssProp,
    value: ev.target.value,
  });
  setVal(ev.target.value);
};

/**
 *
 * @param {{ev:KeyboardEvent , setClass:Function , cssProp:string, setVal:Function , isCurrentELChange:{current:boolean}}} param0
 */
export const onKeyDown = ({ ev, setClass, setVal ,cssProp  , isCurrentELChange}) => {
  /**
   *
   * @param {{ev:KeyboardEvent , increase:boolean}} ev
   */
  const handleChange = ({ ev, increase }) => {
    const finalVal = `${
      increase
        ? +parseInt(ev.target.value || 0) + 1
        : +parseInt(ev.target.value || 0) <= 0
        ? 0
        : +parseInt(ev.target.value || 0) - 1
    }${
      CSS.supports(cssProp , ev.target.value)
        ? ev.target.value.split(/\d+/g).join("")
        : "px"
    }`;

    setClass({
      cssProp,
      value: +parseInt(ev.target.value)
        ? finalVal
        : isValidCssUnit(ev.target.value)
        ? ev.target.value
        : 0,
    });

    setVal(finalVal);
  };

  if (ev.key == "ArrowUp") {
    ev.preventDefault();
    handleChange({ ev, increase: true });
  } else if (ev.key == "ArrowDown") {
    ev.preventDefault();
    handleChange({ ev, increase: false });
  }

  if ((ev.ctrlKey && ev.key == "z") || (ev.ctrlKey && ev.key == "y")) {
    isCurrentELChange.current = true;
  }
};

/**
 *
 * @param {{ev:KeyboardEvent , isCurrentELChange:{current:boolean}}} param0
 */
export const onKeyUp = ({ ev, isCurrentELChange }) => {
  if ((ev.ctrlKey && ev.key == "z") || (ev.ctrlKey && ev.key == "y")) {
    isCurrentELChange.current = false;
  }
};

/**
 *
 * @param {{ev:FocusEvent , setUndoAndRedoStatesVal : Function}} param0
 */
export const onFocus = ({ ev }) => {
  ev.target.select();

};
