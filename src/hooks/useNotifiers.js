import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  asideControllersNotifiresState,
  cmpRulesState,
  currentElState,
} from "../helpers/atoms";
import {
  interactionId,
  mainInteractionId,
  mainMotionId,
  motionId,
} from "../constants/shared";

export const useNotifiers = () => {
  const editor = useEditorMaybe();
  const [select, setSelect] = useState("style");
  const sle = useRecoilValue(currentElState);
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [cmp, setCmp] = useState("");
  const [notify, setNotify] = useRecoilState(asideControllersNotifiresState);

  useEffect(() => {
    if (!editor || !sle || !sle.currentEl) return;
    const selectedCmp = editor?.getSelected();
    if (!selectedCmp) return;
    const callback = () => {
      /**
       *
       * @param {import('grapesjs').Component} selectedCmp
       */
      const checkers = (selectedCmp) => {
        const attributes = selectedCmp.getAttributes();
        const checkCommands = () =>
          Object.keys(attributes).some((attrKey) => attrKey.startsWith("v-"));
        const checkTraits = () =>
          selectedCmp
            .getTraits()
            .some((trait) => Boolean(trait.attributes.value));
        const checkInteractions = () =>
          attributes[interactionId] || attributes[mainInteractionId];
        const checkMotion = () =>
          attributes[motionId] || attributes[mainMotionId];
        const checkStyling = () =>
          cmpRules.length > 0 || selectedCmp.getClasses().length > 0;

        return {
          commands: checkCommands(),
          traits: checkTraits(),
          interactions: checkInteractions(),
          motion: checkMotion(),
          styling: checkStyling(),
        };
      };
      try {
        setCmp(selectedCmp);
        setNotify(checkers(selectedCmp));
      } catch (error) {
        console.error(`Error : ${error.message}`);
      }
    };

    callback();

    editor.on('component:update' , callback);
    
    return () => {
      setNotify((old) =>
        Object.fromEntries(Object.keys(old).map((key) => [key, false]))
    );
    editor.off('component:update' , callback);
    };
  }, [sle, cmpRules, editor]);
};
