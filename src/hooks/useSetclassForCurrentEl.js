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
  const removeProp = useRemoveCssProp();

  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);

  const setAnimeStyles = useSetRecoilState(animeStylesState);

  return ({ cssProp, value }) => {
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

    editor.CssComposer.setRule(
      `${currentSelector}${rule.ruleString}`,
      newCssProps || { [cssProp]: "" },
      {
        ...Media,
        addStyles: true,
      }
    );

    editor.trigger("inf:rules:update", {
      rules: newCssProps,
    });

    if (symbolInfo.isSymbol) {
      console.log("it is symbol");
      const symbolInfo = getInfinitelySymbolInfo(editor.getSelected());

      const callback = async () => {
        sessionStorage.setItem(current_symbol_id, symbolInfo.mainId);
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
