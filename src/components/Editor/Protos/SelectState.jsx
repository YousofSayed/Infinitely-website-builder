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
import { cloneDeep } from "lodash";

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
    console.log("rules (device): ", rules, media);

    const handleValue = (value = "") => {
      return value?.replaceAll?.(/\s+/gi, "")?.trim()?.toLowerCase?.() || "";
    };

    const findIndex = rules.findIndex((ruleF) => {
      // console.log( handleValue(ruleF?.atRuleParams) == handleValue(media?.atRuleParams));
      // console.log( handleValue(ruleF?.atRuleType) == handleValue(media?.atRuleType));
      // console.log( handleValue(ruleF?.atRuleType) == handleValue(media?.atRuleType));

      return (
        handleValue(ruleF?.atRuleParams) == handleValue(media?.atRuleParams) &&
        handleValue(ruleF?.atRuleType) == handleValue(media?.atRuleType)
      );
    });

    console.log("findIndex (device): ", Number(findIndex));
    if (findIndex >= 0) {
      setCurrentStateIndex(findIndex);

      setRule((old) => ({
        ...old,
        is: true,
        atRuleParams: media.atRuleParams,
        atRuleType: media.atRuleType,
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
    const sle = editor.getSelected();
    if (!sle) {
      console.warn(`No selected element to extract rules!`);
      return;
    }
    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    let filterHandledRules = [];
    if(!currentSelector)return [];
    const selectorRules = extractRulesByIdWithDetails(
      // minify(editor.getCss({ clearStyles: false, keepUnusedStyles: true })).css,
      editor.getCss({ clearStyles: false, keepUnusedStyles: true }),
      currentSelector
    ).filter((r) => r.states);

    // .filter((sdt) => {
    //   const output =
    //     sdt.states &&
    //     sdt.statesAsArray.length &&
    //     !filterHandledRules.includes(sdt.states);
    //   filterHandledRules.push(sdt.states);
    //   return output;
    // });
    console.log("ruuules : ", selectorRules);

    // const selectorRules = editor.CssComposer.getRules(`${currentSelector}`).map(
    //   (rule) => {
    //     return {
    //       states: rule.attributes.state,
    //       styles: rule.attributes.style,
    //       id: rule.id,
    //       atRuleType: rule.attributes.atRuleType,
    //       atRuleParams: rule.attributes.mediaText,
    //       rule:`${currentSelector}${rule.attributes.state}`,
    //       states : rule.attributes.selectors.map(sl=>sl.getFullName())
    //       // rule: string;
    //       // fullRule: string | null;
    //       // styles: {};
    //       // states: string | null;
    //       // statesAsArray: RegExpMatchArray | never[] | null;
    //       // atRuleType: string | null;
    //       // atRuleParams: string | null;
    //     };
    //   }
    // );
    // console.log(
    //   "a3aaaa : ",
    //   `${currentSelector}${rule.ruleString}`,
    //   currentSelector,
    //   selectorRules,
    //   editor.CssComposer.getRules(`${currentSelector}`),
    //   editor.CssComposer.getRule(
    //     `${currentSelector}${rule.ruleString}`
    //   ).styleToString()
    // );
    // return {rules }
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
    const clone = cloneDeep(states);
    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    const ruleString = `${currentSelector}${clone[keywordsIndex].states}`;

    // const rule = editor.Css.getRule(ruleString, {
    //   atRuleParams: clone[keywordsIndex].atRuleParams,
    //   atRuleType: clone[keywordsIndex].atRuleType,
    // });
    // const oldRuleStyle = rule.toJSON().style;
    let oldRuleStyle = {};
      const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
     
      const device = r.getDevice();
      // console.log(r.selectorsToString({}), device?.getWidthMedia?.() , r.attributes.mediaText);
      const response = device
        ? r.config.atRuleType != "keyframes" &&
          (`(max-width: ${device.getWidthMedia()})` || "").replaceAll(' ' , '') == (clone[keywordsIndex].atRuleParams || "").replaceAll(' ' , '') &&
          r.selectorsToString({}) == ruleString
        : r.config.atRuleType != "keyframes" &&
          (r.config.atRuleType || "") == (clone[keywordsIndex].atRuleType || "") &&
          (r.config.mediaText || "") == (clone[keywordsIndex].atRuleParams || "") &&
          r.selectorsToString({}) == ruleString;
      return response;
    });

    for (const cssRule of rulesWillRemoved) {
      oldRuleStyle = {
        ...oldRuleStyle,
        ...cssRule.getStyle(),
      };
      editor.Css.remove(cssRule);
    }
    console.log("oldRuleStyle : ", oldRuleStyle);
    // return;
    // editor.Css.remove(rule);

    clone[keywordsIndex].statesAsArray = clone[
      keywordsIndex
    ].statesAsArray.filter((keywordArr) => keywordArr != keyword);
    clone[keywordsIndex].states = clone[keywordsIndex].statesAsArray.join("");

    clone[keywordsIndex].statesAsArray.length >= 1 &&
      editor.Css.setRule(
        `${currentSelector}${clone[keywordsIndex].states}`,
        oldRuleStyle,
        {
          addStyles:true,
          atRuleParams: clone[keywordsIndex].atRuleParams,
          atRuleType: clone[keywordsIndex].atRuleType,
        }
      );
    setStates(clone);

    setRule({
      is: true,
      ruleString: `${clone[keywordsIndex].states}`,
    });
  }

  function removeStateContainer(index) {
    const clone = cloneDeep(states);
    // const sle
    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    const rule = `${currentSelector}${clone[index].states}`;

    // console.log(editor.Css.getRule());
    const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
     
      const device = r.getDevice();
      // console.log(r.selectorsToString({}), device?.getWidthMedia?.() , r.attributes.mediaText);
      const response = device
        ? r.config.atRuleType != "keyframes" &&
          (`(max-width: ${device.getWidthMedia()})` || "").replaceAll(' ' , '') == (clone[index].atRuleParams || "").replaceAll(' ' , '') &&
          r.selectorsToString({}) == rule
        : r.config.atRuleType != "keyframes" &&
          (r.config.atRuleType || "") == (clone[index].atRuleType || "") &&
          (r.config.mediaText || "") == (clone[index].atRuleParams || "") &&
          r.selectorsToString({}) == rule;
      return response;
    });
    // editor.addStyle(`${rule}{}`, { avoidStore: true });
    // console.log(
    //   "clone",
    //   clone[index],
    //   currentSelector,
    //   rule,
    //   editor.Css.getAll().models
    // );
    console.log("all rules will removed", rulesWillRemoved, clone[index]);
    // return;
    for (const cssRule of rulesWillRemoved) {
      editor.Css.remove(cssRule);
      console.log("removed css rule : ", cssRule);
    }
    // return;

    // editor.Css.remove(editor.Css.getRules(rule));
    setRule({
      is: false,
      ruleString: "",
    });

    clone.splice(index, 1);
    setStates(clone);

    currentStateIndex == states.length - 1
      ? setCurrentStateIndex(clone.length - 1)
      : null;

    editor.store();
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
    console.log(states[keywordsIndex].atRuleParams);

    editor.Devices.getDevices().forEach((device) => {
      if (!states[keywordsIndex].atRuleParams) {
        editor.Devices.select("desktop");
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
    <section className="mt-3 flex flex-col gap-2  p-1 bg-slate-900 rounded-lg">
      <section className="flex gap-2   rounded-lg items-center justify-between overflow-hidden">
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
            console.log("keyword : ", keyword);

            addState(keyword);
          }}
          onItemClicked={(keyword, i) => {
            // console.log(keyword, " clicked");

            // setState(keyword);
            addState(keyword);
          }}
        />

        <SmallButton
          className="flex-shrink-0 bg-slate-800 w-[30px!important] h-[30px]"
          tooltipTitle="Add state"
          onClick={(ev) => {
            addState(state);
          }}
        >
          {Icons.plus("#fff")}
        </SmallButton>

        <SmallButton
          className=" flex-shrink-0 bg-slate-800 w-[30px!important] h-[30px]"
          tooltipTitle="Add new line"
          onClick={(ev) => {
            addNewStateContainer();
          }}
        >
          {Icons.newLine("#fff")}
        </SmallButton>
      </section>

      {/* {getLastIndex(states) >= 0  && states[getLastIndex(states)][0] ? ( */}
      {!!states.length && (
        <section ref={chicesRefEl} className="flex flex-col gap-2 ">
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
