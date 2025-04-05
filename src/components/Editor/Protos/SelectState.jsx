import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { statesKeys } from "../../../constants/cssProps";
import { Select } from "./Select";
import { refType, statesType, stateType } from "../../../helpers/jsDocs";
import { Icons } from "../../Icons/Icons";
import { Choices } from "./Choices";
import {
  addClickClass,
  cloneObject,
  uniqueID,
} from "../../../helpers/cocktail";
import { SmallButton } from "./SmallButton";
import { ChoicesForStates } from "./ChoicesForStates";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentElState,
  ruleState,
  selectorState,
} from "../../../helpers/atoms";
import {
  extractRulesById,
  extractRulesByIdWithDetails,
  getCurrentMediaDevice,
  getCurrentSelector,
} from "../../../helpers/functions";
import { minify } from "csso";

// console.log({0:[],1:[]});

export const SelectState = ({ placeholder }) => {
  const editor = useEditorMaybe();
  const setRule = useSetRecoilState(ruleState);
  const rule = useRecoilValue(ruleState);
  const selector = useRecoilValue(selectorState);
  const selectedEl = useRecoilValue(currentElState);
  const [states, setStates] = useState(statesType);
  const [state, setState] = useState("");
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const chicesRefEl = useRef(refType);

  useEffect(() => {
    if (!selectedEl.currentEl || selectedEl.currentEl.tagName == "body") return;
    extractRules();
    updateCurrentIndex();
  }, [selectedEl, selector]);

  useEffect(() => {
    const callback = () => {
      const rules = extractRules(false);
      rules.length && states.length && setStates(rules);
    };

    // editor.on("inf:rules:update", callback);
    editor.on("device:change", updateCurrentIndex);

    return () => {
      editor.off("inf:rules:update", callback);
      editor.off("device:change", updateCurrentIndex);
    };
  });

  const updateCurrentIndex = () => {
    const rules = extractRules(false);
    const media = getCurrentMediaDevice(editor);
    console.log("rules (device): ", rules);

    const findIndex = rules.findIndex((ruleF) => {
      return (
        ruleF.atRuleParams == media?.atRuleParams &&
        ruleF.atRuleType == media?.atRuleType
      );
    });
    console.log("findIndex (device): ", Number(findIndex));
    if (findIndex >= 0) {
      setCurrentStateIndex(Number(findIndex));

      setRule((old) => ({
        ...old,
        is: true,
        atRuleParams: rules[findIndex].atRuleParams,
        atRuleType: rules[findIndex].atRuleType,
        ruleString: rules[findIndex].states,
      }));
    } else {
      setCurrentStateIndex(null);

      setRule((old) => ({
        ...old,
        is: false,
        atRuleParams: null,
        atRuleType: null,
        ruleString: "",
      }));
    }
  };
  
  

  function extractRules(isSetRules = true) {
    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    
    const selectorRules = extractRulesByIdWithDetails(
     minify( editor.getCss({ clearStyles: false, keepUnusedStyles: true })).css,
      currentSelector
    ).filter((sdt) =>  sdt.states && sdt.statesAsArray.length);

    console.log("a3aaaa : ", currentSelector, selectorRules , editor.CssComposer.getRules());
    isSetRules && setStates([...selectorRules]);
    return selectorRules;
  }

  function addNewStateContainer() {
    const clone = [
      ...structuredClone(states),
      {
        rule: "",
        atRuleParams: null,
        atRuleType: null,
        states: "",
        statesAsArray: [],
        id: uniqueID(),
      },
    ];
    setStates(clone);
    setCurrentStateIndex(clone.length - 1);
  }

  function addState(state = "") {
    let clone = structuredClone(states);
    let index = currentStateIndex || clone.length;
    const media = getCurrentMediaDevice(editor);
    console.log(
      "condition : ",
      !clone.length || !clone[index],
      index,
      clone.length
    );

    if (!clone.length || !clone[index]) {
      console.log("is really true");
      clone = [
        ...clone,
        {
          rule: "",
          // atRuleParams: null,
          // atRuleType: null,
          ...media,
          states: ``,
          statesAsArray: [],
          id: uniqueID(),
        },
      ];
    }

    clone[index].statesAsArray = [
      ...new Set([...clone[index].statesAsArray, state]),
    ];
    clone[index].states = clone[index].statesAsArray.join("");

    setStates(clone);
    // const currentSelector = getCurrentSelector(selector , editor.getSelected());

    // editor.Css.setRule(`${currentSelector}${clone[index].states}`,{},{
    //   ...media,
    //   addStyles:true
    // });
    // console.log('css rule added : ' , editor.getCss());
    
    setState(new String(""));
    setRule({
      is: true,
      ruleString: `${clone[index].states}`,
      ...media,
    });
  }

  function removeState(keyword, keywordsIndex) {
    const clone = structuredClone(states);
    const currentSelector = selector ? selector : `#${selectedEl.currentEl.id}`;
    const ruleString = `${currentSelector}${clone[keywordsIndex].states}`;

    const rule = editor.Css.getRule(ruleString, {
      atRuleParams: clone[keywordsIndex].atRuleParams,
      atRuleType: clone[keywordsIndex].atRuleType,
    });
    const oldRuleStyle = rule.toJSON().style;

    editor.Css.remove(rule);

    clone[keywordsIndex].statesAsArray = clone[
      keywordsIndex
    ].statesAsArray.filter((keywordArr) => keywordArr != keyword);
    clone[keywordsIndex].states = clone[keywordsIndex].statesAsArray.join("");
    setStates(clone);

    clone[keywordsIndex].statesAsArray.length > 1 &&
      editor.Css.setRule(
        `${currentSelector}${clone[keywordsIndex].states}`,
        oldRuleStyle
      );
    setRule({
      is: true,
      ruleString: `${clone[keywordsIndex].states}`,
    });
  }

  function removeStateContainer(index) {
    const clone = structuredClone(states);
    const rule = `#${editor.getSelected().getEl().id}${clone[index].states}`;

    editor.Css.remove(editor.Css.getRule(rule));
    setRule({
      is: false,
      ruleString: "",
    });

    const newArr = clone.filter((stateD, i) => i != index);
    setStates(newArr);

    currentStateIndex == states.length - 1
      ? setCurrentStateIndex(newArr.length - 1)
      : null;
  }

  function selectContainer(keywordsIndex) {
    setRule((old) => ({
      is: currentStateIndex == keywordsIndex ? !old.is : true,
      atRuleParams: states[keywordsIndex].atRuleParams,
      atRuleType: states[keywordsIndex].atRuleType,
      ruleString:
        currentStateIndex == keywordsIndex && old.ruleString
          ? ""
          : `${states[keywordsIndex].states}`,
    }));
    setCurrentStateIndex(keywordsIndex);
    editor.Devices.getDevices().forEach((device) => {
      if (!device.getWidthMedia()) {
        editor.Devices.select("Desktop");
        return;
      }
      if (
        states[keywordsIndex].atRuleParams?.includes(device.getWidthMedia())
      ) {
        editor.Devices.select(device.getName());
      }
    });
  }

  return (
    <section className="mt-3 flex flex-col gap-4  p-2">
      <section className="flex gap-2 ">
        <Select
          placeholder="state"
          respectParenthesis={true}
          keywords={statesKeys}
          singleValInInput={false}
          value={state}
          // setVal={setVal}
          setValue={setState}
          // onInput={(value) => {
          //   setState(value);
          // }}
          onEnterPress={(keyword) => {
            // setState(keyword);
            console.log('keyword : ' , keyword);
            
            addState(keyword);
          }}
          onItemClicked={(keyword, i) => {
            // console.log(keyword, " clicked");

            // setState(keyword);
            addState(keyword);
          }}
        />

        <SmallButton
          className="flex-shrink-0 bg-slate-800"
          onClick={(ev) => {
            addState(state);
          }}
          clas
        >
          {Icons.plus("#fff")}
        </SmallButton>

        <SmallButton
          className=" flex-shrink-0 bg-slate-800"
          onClick={(ev) => {
            addNewStateContainer();
          }}
        >
          {Icons.newLine("#fff")}
        </SmallButton>
      </section>

      {/* {getLastIndex(states) >= 0  && states[getLastIndex(states)][0] ? ( */}
      {!!states.length && (
        <section ref={chicesRefEl} className="flex flex-col gap-3">
          {states.map(
            ({ rule, states, statesAsArray, atRuleParams, atRuleType }, i) => {
              return (
                <ChoicesForStates
                  key={i}
                  keywordsIndex={i}
                  atRuleParams={atRuleParams}
                  atRuleType={atRuleType}
                  currentStateIndex={currentStateIndex}
                  keywords={statesAsArray}
                  onDelete={(ev, index) => {
                    removeStateContainer(index);
                  }}
                  onSelect={(ev, keywordsIndex) => {
                    selectContainer(keywordsIndex);
                  }}
                  onCloseClick={(ev, keyword, index, keywordsIndex) => {
                    setCurrentStateIndex(keywordsIndex);
                    removeState(keyword, keywordsIndex);
                  }}
                />
              );
            }
          )}
        </section>
      )}
      {/* ) : null} */}
    </section>
  );
};
