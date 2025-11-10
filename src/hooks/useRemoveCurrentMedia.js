import { useEditorMaybe } from "@grapesjs/react";
import React from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  cmpRulesState,
  currentElState,
  ruleState,
  selectorState,
} from "../helpers/atoms";
import {
  getComponentRules,
  getCurrentMediaDevice,
  getCurrentSelector,
} from "../helpers/functions";
import { useRemoveCssProp } from "./useRemoveCssProp";

export const useRemoveCurrentMedia = () => {
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const [selector, setSelector] = useRecoilState(selectorState);
  const removeProp = useRemoveCssProp();
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [currentEl, setCurrentEl] = useRecoilState(currentElState);

  return () => {
    const Media = getCurrentMediaDevice(editor);
    const sle = editor.getSelected();

    let currentSelector = getCurrentSelector(selector, sle);
    console.log("from set style current selector is : ", currentSelector);
    const ruleWillRemoved = editor.CssComposer.getRule(
      `${currentSelector}${rule.ruleString}`,
      {
        ...Media,
        addStyles: true,
        validate: false,
        // inline:true,
        addStyle: true,
      }
    );
    editor.CssComposer.remove(ruleWillRemoved);

    setCmpRules(
      getComponentRules({
        editor,
        cmp: editor.getSelected(),
      }).rules || []
    );

    setCurrentEl({
        currentEl: JSON.parse(JSON.stringify(editor.getSelected() || {})),
      });
  };
};
