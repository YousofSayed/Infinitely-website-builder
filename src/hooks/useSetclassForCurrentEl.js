import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
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
import {
  current_project_id,
  current_symbol_id,
  inf_class_name,
} from "../constants/shared";
import { db } from "../helpers/db";
import { dynamicTemplatesType } from "../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { keyBy, random, uniqueId } from "lodash";
import { keyframeStylesInstance } from "../constants/InfinitelyInstances";
import { uniqueID } from "../helpers/cocktail";
let setStyleTimeout = null;

/**
 *
 * @param {{ifrDocument:Document , currentEl:HTMLElement , cssProp:string , value:string}} param0
 */
export function useSetClassForCurrentEl() {
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const [selector , setSelector] = useRecoilState(selectorState);
  const removeProp = useRemoveCssProp();

  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);

  // const setAnimeStyles = useSetRecoilState(animeStylesState);

  return ({ cssProp, value }) => {
    const setter = () => {
      let newCssProps = {};

      if (Array.isArray(cssProp) && Array.isArray(value)) {
        cssProp.forEach((prop, i) => {
          if (!CSS.supports(prop, value[i]) && value[i]) {
            removeProp({ cssProp: prop });
            return;
          }

          newCssProps = { ...newCssProps, [prop]: value[i] };
        });
      } else if (Array.isArray(cssProp) && !Array.isArray(value)) {
        cssProp.forEach((prop, i) => {
          if (!CSS.supports(prop, value) && value) {
            removeProp({ cssProp: prop });
            return;
          }

          newCssProps = { ...newCssProps, [prop]: value };
        });
      } else {
        newCssProps =
          CSS.supports(cssProp, value) && value
            ? { ...newCssProps, [cssProp]: value }
            : { ...newCssProps };
        // !value && removeProp({ cssProp })
        !value && (newCssProps[cssProp] = "");
        // console.log("elssssssssssssooooooooooo", newCssProps, !value);
      }

      if (showAnimationsBuilder) {
        newCssProps = newCssProps ? newCssProps : { [cssProp]: "" };
        // setAnimeStyles((old) => ({ ...old, ...newCssProps }));
        // setAnimeStyles({ ...newCssProps });
        console.log(newCssProps, "from animations");

        keyframeStylesInstance.emit(InfinitelyEvents.keyframe.set, newCssProps);
        return;
      } //stop any action if animation builder is on

      if (
        rule.ruleString.endsWith("before") ||
        rule.ruleString.endsWith("after")
      ) {
        newCssProps.content = " '' ";
      }

      const Media = getCurrentMediaDevice(editor);
      const sle = editor.getSelected();

      let currentSelector = getCurrentSelector(selector, sle); 
      console.log("from set style current selector is : ", currentSelector);
      const classes = [...sle.getClasses()];
      const isCurrentSelectorAdded = classes.some(
        (cls) => cls === currentSelector
      );

      if (!currentSelector) {
        const newClassName = uniqueId(
          `infcls-${uniqueID()}-${random(100, 9999)}-`
        );
        sle.addClass(newClassName);
        sle.addAttributes({ [inf_class_name]: newClassName });
        const classes = [...sle.getClasses()];
        const isNewAdded = classes.some((cls) => cls === newClassName);
        if (isNewAdded) {
          currentSelector = `.${newClassName}`;
        } else {
          throw new Error(`New class not added!`);
        }
      } else if (currentSelector && !isCurrentSelectorAdded) {
        sle.addClass(currentSelector);
      }
      console.log('current selector from updater : ' , currentSelector);
      
      // const symbolInfo = getInfinitelySymbolInfo(sle);
      // console.log(
      //   "from updater  : ",
      //   // editor.getSelectedAll(),
      //   newCssProps,
      //   // editor.DeviceManager.get(editor.getDevice()).attributes,
      //   // `${currentSelector}${rule.ruleString}`,
      //   // cssProp,
      //   // newCssProps,
      //   // {
      //   //   ...Media,
      //   //   addStyles: true,

      //   //   // addStyle: true,
      //   // }
      // );

      editor.CssComposer.setRule(
        `${currentSelector}${rule.ruleString}`,
        newCssProps || { [cssProp]: "" },
        {
          ...Media,
          addStyles: true,
          validate: false,
          // inline:true,
          addStyle: true,
        }
      );

      editor.trigger("inf:rules:update", {
        rules: newCssProps,
      });

      // editor.getSelected().addStyle(newCssProps)

      // console.log(cssProp, rule.ruleString, "%$%%$#$", editor.getCss());
      // console.log("Editor Css:", editor.getDevice());
      // console.log(editor.Devices.get("tablet").getWidthMedia());
    };

    setStyleTimeout && clearTimeout(setStyleTimeout);
    setStyleTimeout = setTimeout(() => {
      // if ("requestIdleCallback" in window) {
      //   requestIdleCallback(setter);
      // } else {
      // }
      setter();
    }, 100);
  };
}
