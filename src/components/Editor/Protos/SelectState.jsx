import { statesKeys } from "@/constants/cssProps";
import { styleRgx } from "@/constants/rgxs";
import {
  cmpRulesState,
  currentElState,
  ruleState,
  selectorState,
} from "@/helpers/atoms";
import { uniqueID } from "@/helpers/cocktail";
import {
  extractRulesByIdWithDetails,
  getCurrentMediaDevice,
  getCurrentSelector,
} from "@/helpers/functions";
import { refType, statesType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { ChoicesForStates } from "@/components/Editor/Protos/ChoicesForStates";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { useEditorMaybe } from "@grapesjs/react";
import { cloneDeep, isNumber } from "lodash";
import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const SelectState = memo(({ placeholder }) => {
  const editor = useEditorMaybe();
  const setRule = useSetRecoilState(ruleState);
  const rule = useRecoilValue(ruleState);
  const selector = useRecoilValue(selectorState);
  const selectedEl = useRecoilValue(currentElState);
  const [states, setStates] = useState(statesType);
  const [state, setState] = useState("");
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const chicesRefEl = useRef(refType);

  const updateCurrentIndex = () => {
    const rules = extractRules(false);
    if (!rules) return;
    const media = getCurrentMediaDevice(editor);

    const handleValue = (value = "") => {
      return value?.replaceAll?.(/\s+/gi, "")?.trim()?.toLowerCase?.() || "";
    };

    const findIndex = rules.findIndex((ruleF) => {
      return (
        handleValue(ruleF?.atRuleParams) == handleValue(media?.atRuleParams) &&
        handleValue(ruleF?.atRuleType) == handleValue(media?.atRuleType) &&
        ruleF.states == rule.ruleString
      );
    });

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
    const sle = editor?.getSelected();
    if (!sle) return [];

    const currentSelector = getCurrentSelector(selector, sle);
    if (!currentSelector) {
      if (isSetRules) setStates([]);
      return [];
    }

    // 🚨 HEAVY OPERATION: Serializes entire CSS and runs Regex on main thread
    const cssString = editor.getCss({ clearStyles: false, keepUnusedStyles: true });
    const selectorRules = extractRulesByIdWithDetails(cssString, currentSelector).filter((r) => r.states);

    if (isSetRules) setStates([...selectorRules]);
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

  function addState(stateVal = "") {
    let clone = structuredClone(states);
    let index =
      isNumber(currentStateIndex) && currentStateIndex != -1
        ? currentStateIndex
        : clone.length;
    const media = getCurrentMediaDevice(editor);

    if (states.some((st) => st?.states && st?.states === stateVal)) return;

    if (!clone.length || !clone[index]) {
      clone = [
        ...clone,
        {
          rule: "",
          ...media,
          states: ``,
          statesAsArray: [],
          id: uniqueID(),
        },
      ];
    }

    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    const ruleString = `${currentSelector}${clone[index].states}`;
    let oldRuleStyle = {};
    
    const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
      const device = r.getDevice();
      const response = Boolean(device)
        ? r.config.atRuleType != "keyframes" &&
          (`(${r.config?.mediaText?.match?.(/max-width|min-width/gi)?.[0]}: ${device.getWidthMedia()})` || "").replaceAll(" ", "") ==
            (clone[index].atRuleParams || "").replaceAll(" ", "") &&
          r.selectorsToString({}) == ruleString
        : r.config.atRuleType != "keyframes" &&
          (r.config.atRuleType || "") == (clone[index].atRuleType || "") &&
          (r.config.mediaText || "") == (clone[index].atRuleParams || "") &&
          r.selectorsToString({}) == ruleString;
      return response;
    });

    clone[index].statesAsArray = [...new Set([...clone[index].statesAsArray, stateVal])];
    clone[index].states = clone[index].statesAsArray.join("");

    if (clone[index].statesAsArray.length > 1) {
      for (const cssRule of rulesWillRemoved) {
        oldRuleStyle = { ...oldRuleStyle, ...cssRule.getStyle() };
        editor.Css.remove(cssRule);
      }
    }

    editor.Css.setRule(
      `${currentSelector}${clone[index].states}`,
      clone[index].statesAsArray.length > 1 ? oldRuleStyle : { "--_init": "0" },
      {
        addStyles: true,
        atRuleParams: clone[index].atRuleParams,
        atRuleType: clone[index].atRuleType,
      }
    );
    
    setStates(clone);
    setState("");
    setRule({ is: true, ruleString: `${clone[index].states}`, ...media });
    if (currentStateIndex === -1) setCurrentStateIndex(index);
  }

  function removeState(keyword, keywordsIndex) {
    const clone = cloneDeep(states);
    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    const ruleString = `${currentSelector}${clone[keywordsIndex].states}`;
    let oldRuleStyle = {};
    
    const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
      const device = r.getDevice();
      const response = Boolean(device)
        ? r.config.atRuleType != "keyframes" &&
          (`(${r.config?.mediaText?.match?.(/max-width|min-width/gi)?.[0]}: ${device.getWidthMedia()})` || "").replaceAll(" ", "") ==
            (clone[keywordsIndex].atRuleParams || "").replaceAll(" ", "") &&
          r.selectorsToString({}) == ruleString
        : r.config.atRuleType != "keyframes" &&
          (r.config.atRuleType || "") == (clone[keywordsIndex].atRuleType || "") &&
          (r.config.mediaText || "") == (clone[keywordsIndex].atRuleParams || "") &&
          r.selectorsToString({}) == ruleString;
      return response;
    });

    for (const cssRule of rulesWillRemoved) {
      oldRuleStyle = { ...oldRuleStyle, ...cssRule.getStyle() };
      editor.Css.remove(cssRule);
    }

    clone[keywordsIndex].statesAsArray = clone[keywordsIndex].statesAsArray.filter((k) => k != keyword);
    clone[keywordsIndex].states = clone[keywordsIndex].statesAsArray.join("");

    if (clone[keywordsIndex].statesAsArray.length >= 1) {
      editor.Css.setRule(`${currentSelector}${clone[keywordsIndex].states}`, oldRuleStyle, {
        addStyles: true,
        atRuleParams: clone[keywordsIndex].atRuleParams,
        atRuleType: clone[keywordsIndex].atRuleType,
      });
    }
    
    setStates(clone);
    setRule({ is: true, ruleString: `${clone[keywordsIndex].states}` });
  }

  function removeStateContainer(index) {
    const clone = cloneDeep(states);
    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    const ruleStr = `${currentSelector}${clone[index].states}`;

    const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
      const device = r.getDevice();
      const response = device
        ? r.config.atRuleType != "keyframes" &&
          (`(max-width: ${device.getWidthMedia()})` || "").replaceAll(" ", "") == (clone[index].atRuleParams || "").replaceAll(" ", "") &&
          r.selectorsToString({}) == ruleStr
        : r.config.atRuleType != "keyframes" &&
          (r.config.atRuleType || "") == (clone[index].atRuleType || "") &&
          (r.config.mediaText || "") == (clone[index].atRuleParams || "") &&
          r.selectorsToString({}) == ruleStr;
      return response;
    });

    for (const cssRule of rulesWillRemoved) {
      editor.Css.remove(cssRule);
    }

    setRule({ is: false, ruleString: "" });
    clone.splice(index, 1);
    setStates(clone);
    if (currentStateIndex == states.length - 1) setCurrentStateIndex(clone.length - 1);
    editor.store();
  }

  function selectContainer(keywordsIndex) {
    setRule((old) => ({
      is: currentStateIndex == keywordsIndex ? !old.is : true,
      atRuleParams: states[keywordsIndex].atRuleParams,
      atRuleType: states[keywordsIndex].atRuleType,
      ruleString: currentStateIndex == keywordsIndex && old.ruleString ? "" : `${states[keywordsIndex].states}`,
    }));

    setCurrentStateIndex(keywordsIndex);

    editor.Devices.getDevices().forEach((device) => {
      if (!states[keywordsIndex].atRuleParams) {
        editor.Devices.select("desktop");
        return;
      }
      if (states[keywordsIndex].atRuleParams?.includes(device.getWidthMedia())) {
        editor.Devices.select(device.getName());
      }
    });
  }

  // 🚀 FIXED: Converted from useMemo to useEffect + requestAnimationFrame
  // This prevents the heavy CSS Regex parsing from blocking the UI thread on selection
  useEffect(() => {
    if (!selectedEl?.currentEl) return;
    
    const rafId = requestAnimationFrame(() => {
      extractRules();
      updateCurrentIndex();
    });

    return () => cancelAnimationFrame(rafId);
  }, [selectedEl, selector]);

  // 🚀 FIXED: Converted from useMemo to proper useEffect for event listeners
  useEffect(() => {
    if (!editor) return;
    
    const callback = () => {
      const rules = extractRules(false);
      if (rules && rules.length && states.length) setStates(rules);
    };

    editor.on("inf:rules:update", callback);
    editor.on("device:change", updateCurrentIndex);

    return () => {
      editor.off("inf:rules:update", callback);
      editor.off("device:change", updateCurrentIndex);
    };
  }, [editor]);

  return (
    <section className="mt-3 flex flex-col gap-2 p-1 bg-surface-secondary rounded-lg auto-animate">
      <section className="flex gap-2 rounded-lg justify-between overflow-hidden">
        <Select
          placeholder="state"
          respectParenthesis={true}
          keywords={statesKeys}
          singleValInInput={false}
          value={state}
          setValue={setState}
          onEnterPress={(keyword) => addState(keyword)}
          onItemClicked={(keyword) => addState(keyword)}
        />

        <SmallButton className="shrink-0 bg-surface-tertiary" onClick={() => addState(state)}>
          {Icons.plus("#fff")}
        </SmallButton>

        <SmallButton className="shrink-0 bg-surface-tertiary" onClick={() => addNewStateContainer()}>
          {Icons.newLine("#fff")}
        </SmallButton>
      </section>

      {!!states.length && (
        <section ref={chicesRefEl} className="flex flex-col gap-2 relative animate-go-to">
          {states.map(({ rule, states: stateStr, statesAsArray, atRuleParams, atRuleType }, i) => {
            return (
              <ChoicesForStates
                key={i}
                keywordsIndex={i}
                atRuleParams={atRuleParams}
                atRuleType={atRuleType}
                currentStateIndex={currentStateIndex}
                keywords={statesAsArray}
                stateRule={rule}
                onDelete={(ev, index) => removeStateContainer(index)}
                onSelect={(ev, keywordsIndex) => selectContainer(keywordsIndex)}
                onCloseClick={(ev, keyword, index, keywordsIndex) => {
                  setCurrentStateIndex(keywordsIndex);
                  removeState(keyword, keywordsIndex);
                }}
              />
            );
          })}
        </section>
      )}
    </section>
  );
});
// import { statesKeys } from "@/constants/cssProps";
// import { styleRgx } from "@/constants/rgxs";
// import {
//   cmpRulesState,
//   currentElState,
//   ruleState,
//   selectorState,
// } from "@/helpers/atoms";
// import { uniqueID } from "@/helpers/cocktail";
// import {
//   extractRulesByIdWithDetails,
//   getCurrentMediaDevice,
//   getCurrentSelector,
// } from "@/helpers/functions";
// import { refType, statesType, stateType } from "@/helpers/jsDocs";
// import { Icons } from "@/components/Icons/Icons";
// import { ChoicesForStates } from "@/components/Editor/Protos/ChoicesForStates";
// import { Select } from "@/components/Editor/Protos/Select";
// import { SmallButton } from "@/components/Editor/Protos/SmallButton";
// import { useEditorMaybe } from "@grapesjs/react";
// import { cloneDeep, isArray, isNumber } from "lodash";
// import React, {
//   memo,
//   useEffect,
//   useLayoutEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

// // console.log({0:[],1:[]});

// export const SelectState = memo(({ placeholder }) => {
//   const editor = useEditorMaybe();
//   const setRule = useSetRecoilState(ruleState);
//   const rule = useRecoilValue(ruleState);
//   const selector = useRecoilValue(selectorState);
//   const selectedEl = useRecoilValue(currentElState);
//   const [states, setStates] = useState(statesType);
//   const [state, setState] = useState("");
//   const [currentStateIndex, setCurrentStateIndex] = useState(0);
//   const chicesRefEl = useRef(refType);

  

//   const updateCurrentIndex = () => {
//     const rules = extractRules(false);
//     const media = getCurrentMediaDevice(editor);
//     console.log("rules (device): ", rules, media);

//     const handleValue = (value = "") => {
//       return value?.replaceAll?.(/\s+/gi, "")?.trim()?.toLowerCase?.() || "";
//     };

//     const findIndex = rules.findIndex((ruleF) => {
//       // console.log( handleValue(ruleF?.atRuleParams) == handleValue(media?.atRuleParams));
//       // console.log( handleValue(ruleF?.atRuleType) == handleValue(media?.atRuleType));
//       // console.log( handleValue(ruleF?.atRuleType) == handleValue(media?.atRuleType));
//       console.log("ruleF : ", ruleF.states == rule.ruleString);

//       return (
//         handleValue(ruleF?.atRuleParams) == handleValue(media?.atRuleParams) &&
//         handleValue(ruleF?.atRuleType) == handleValue(media?.atRuleType) &&
//         ruleF.states == rule.ruleString
//       );
//     });

//     console.log("findIndex (device): ", Number(findIndex));
//     if (findIndex >= 0) {
//       setCurrentStateIndex(findIndex);

//       setRule((old) => ({
//         ...old,
//         is: true,
//         atRuleParams: media.atRuleParams,
//         atRuleType: media.atRuleType,
//         ruleString: rules[findIndex].states,
//       }));
//     } else {
//       setCurrentStateIndex(null);

//       setRule((old) => ({
//         ...old,
//         is: false,
//         atRuleParams: null,
//         atRuleType: null,
//         ruleString: "",
//       }));
//     }
//   };

//   function extractRules(isSetRules = true) {
//     const sle = editor.getSelected();
//     if (!sle) {
//       console.warn(`No selected element to extract rules!`);
//       return;
//     }

//     const currentSelector = getCurrentSelector(selector, editor.getSelected());
//     console.log("gettting", currentSelector);
//     if (!currentSelector) {
//       isSetRules && setStates([]);
//       return [];
//     }
//     const selectorRules = extractRulesByIdWithDetails(
//       // minify(editor.getCss({ clearStyles: false, keepUnusedStyles: true })).css,
//       editor.getCss({ clearStyles: false, keepUnusedStyles: true }),
//       currentSelector,
//     ).filter((r) => r.states);

//     console.log("gettting ruuules : ", selectorRules);

//     isSetRules && setStates([...selectorRules]);
//     return selectorRules;
//   }

//   function addNewStateContainer() {
//     const clone = [
//       ...structuredClone(states),
//       {
//         rule: "",
//         atRuleParams: null,
//         atRuleType: null,
//         states: "",
//         statesAsArray: [],
//         id: uniqueID(),
//       },
//     ];
//     setStates(clone);
//     setCurrentStateIndex(clone.length - 1);
//   }

//   function addState(state = "") {
//     let clone = structuredClone(states);
//     let index =
//       isNumber(currentStateIndex) && currentStateIndex != -1
//         ? currentStateIndex
//         : clone.length;
//     const media = getCurrentMediaDevice(editor);
//     console.log(
//       "condition : ",
//       !clone.length || !clone[index],
//       index,
//       clone.length,
//       currentStateIndex,
//       states.some((state) => state?.states && state?.states === state),
//     );

//     if (states.some((state) => state?.states && state?.states === state)) {
//       alert("noooooooooo");
//       return;
//     }

//     if (!clone.length || !clone[index]) {
//       //this explain why i did that ( clone.length) not that ( clone.length-1)
//       console.log("is really true");
//       clone = [
//         ...clone,
//         {
//           rule: "",
//           // atRuleParams: null,
//           // atRuleType: null,
//           ...media,
//           states: ``,
//           statesAsArray: [],
//           id: uniqueID(),
//         },
//       ];
//     }

//     console.log(clone, "clone", index);

//     const currentSelector = getCurrentSelector(selector, editor.getSelected());
//     const ruleString = `${currentSelector}${clone[index].states}`;
//     let oldRuleStyle = {};
//     const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
//       const device = r.getDevice();

//       // console.log(r.selectorsToString({}), device?.getWidthMedia?.() , r.attributes.mediaText);
//       const response = Boolean(device)
//         ? r.config.atRuleType != "keyframes" &&
//           (
//             `(${
//               r.config?.mediaText?.match?.(/max-width|min-width/gi)?.[0]
//             }: ${device.getWidthMedia()})` || ""
//           ).replaceAll(" ", "") ==
//             (clone[index].atRuleParams || "").replaceAll(" ", "") &&
//           r.selectorsToString({}) == ruleString
//         : r.config.atRuleType != "keyframes" &&
//           (r.config.atRuleType || "") == (clone[index].atRuleType || "") &&
//           (r.config.mediaText || "") == (clone[index].atRuleParams || "") &&
//           r.selectorsToString({}) == ruleString;

//       return response;
//     });

//     console.log("oldRuleStyle before: ", oldRuleStyle, rulesWillRemoved);
//     clone[index].statesAsArray = [
//       ...new Set([...clone[index].statesAsArray, state]),
//     ];
//     clone[index].states = clone[index].statesAsArray.join("");

//     if (clone[index].statesAsArray.length > 1) {
//       for (const cssRule of rulesWillRemoved) {
//         oldRuleStyle = {
//           ...oldRuleStyle,
//           ...cssRule.getStyle(),
//         };
//         editor.Css.remove(cssRule);
//       }
//       console.log("oldRuleStyle : ", oldRuleStyle);
//     }

//     editor.Css.setRule(
//       `${currentSelector}${clone[index].states}`,
//       clone[index].statesAsArray.length > 1
//         ? oldRuleStyle
//         : {
//             "--_init": "0",
//           },
//       {
//         addStyles: true,
//         atRuleParams: clone[index].atRuleParams,
//         atRuleType: clone[index].atRuleType,
//       },
//     );
//     setStates(clone);
//     // const currentSelector = getCurrentSelector(selector , editor.getSelected());

//     // editor.Css.setRule(`${currentSelector}${clone[index].states}`,{},{
//     //   ...media,
//     //   addStyles:true
//     // });
//     // console.log('css rule added : ' , editor.getCss());

//     setState(new String(""));
//     setRule({
//       is: true,
//       ruleString: `${clone[index].states}`,
//       ...media,
//     });

//     currentStateIndex === -1 && setCurrentStateIndex(index);
//     console.log("states added well : ", state);
//   }

//   function removeState(keyword, keywordsIndex) {
//     const clone = cloneDeep(states);
//     const currentSelector = getCurrentSelector(selector, editor.getSelected());
//     const ruleString = `${currentSelector}${clone[keywordsIndex].states}`;
//     let oldRuleStyle = {};
//     const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
//       const device = r.getDevice();

//       // console.log(r.selectorsToString({}), device?.getWidthMedia?.() , r.attributes.mediaText);
//       const response = Boolean(device)
//         ? r.config.atRuleType != "keyframes" &&
//           (
//             `(${
//               r.config?.mediaText?.match?.(/max-width|min-width/gi)?.[0]
//             }: ${device.getWidthMedia()})` || ""
//           ).replaceAll(" ", "") ==
//             (clone[keywordsIndex].atRuleParams || "").replaceAll(" ", "") &&
//           r.selectorsToString({}) == ruleString
//         : r.config.atRuleType != "keyframes" &&
//           (r.config.atRuleType || "") ==
//             (clone[keywordsIndex].atRuleType || "") &&
//           (r.config.mediaText || "") ==
//             (clone[keywordsIndex].atRuleParams || "") &&
//           r.selectorsToString({}) == ruleString;

//       return response;
//     });

//     for (const cssRule of rulesWillRemoved) {
//       oldRuleStyle = {
//         ...oldRuleStyle,
//         ...cssRule.getStyle(),
//       };
//       editor.Css.remove(cssRule);
//     }
//     console.log("oldRuleStyle : ", oldRuleStyle);

//     clone[keywordsIndex].statesAsArray = clone[
//       keywordsIndex
//     ].statesAsArray.filter((keywordArr) => keywordArr != keyword);
//     clone[keywordsIndex].states = clone[keywordsIndex].statesAsArray.join("");

//     clone[keywordsIndex].statesAsArray.length >= 1 &&
//       editor.Css.setRule(
//         `${currentSelector}${clone[keywordsIndex].states}`,
//         oldRuleStyle,
//         {
//           addStyles: true,
//           atRuleParams: clone[keywordsIndex].atRuleParams,
//           atRuleType: clone[keywordsIndex].atRuleType,
//         },
//       );
//     setStates(clone);

//     setRule({
//       is: true,
//       ruleString: `${clone[keywordsIndex].states}`,
//     });
//   }

//   function removeStateContainer(index) {
//     const clone = cloneDeep(states);
//     // const sle
//     const currentSelector = getCurrentSelector(selector, editor.getSelected());
//     const rule = `${currentSelector}${clone[index].states}`;

//     // console.log(editor.Css.getRule());
//     const rulesWillRemoved = editor.Css.getAll().models.filter((r) => {
//       const device = r.getDevice();
//       // console.log(r.selectorsToString({}), device?.getWidthMedia?.() , r.attributes.mediaText);
//       const response = device
//         ? r.config.atRuleType != "keyframes" &&
//           (`(max-width: ${device.getWidthMedia()})` || "").replaceAll(
//             " ",
//             "",
//           ) == (clone[index].atRuleParams || "").replaceAll(" ", "") &&
//           r.selectorsToString({}) == rule
//         : r.config.atRuleType != "keyframes" &&
//           (r.config.atRuleType || "") == (clone[index].atRuleType || "") &&
//           (r.config.mediaText || "") == (clone[index].atRuleParams || "") &&
//           r.selectorsToString({}) == rule;
//       return response;
//     });
//     // editor.addStyle(`${rule}{}`, { avoidStore: true });
//     // console.log(
//     //   "clone",
//     //   clone[index],
//     //   currentSelector,
//     //   rule,
//     //   editor.Css.getAll().models
//     // );
//     console.log("all rules will removed", rulesWillRemoved, clone[index]);
//     // return;
//     for (const cssRule of rulesWillRemoved) {
//       editor.Css.remove(cssRule);
//       console.log("removed css rule : ", cssRule);
//     }
//     // return;

//     // editor.Css.remove(editor.Css.getRules(rule));
//     setRule({
//       is: false,
//       ruleString: "",
//     });

//     clone.splice(index, 1);
//     setStates(clone);

//     currentStateIndex == states.length - 1
//       ? setCurrentStateIndex(clone.length - 1)
//       : null;

//     editor.store();
//   }

//   function selectContainer(keywordsIndex) {
//     setRule((old) => ({
//       is: currentStateIndex == keywordsIndex ? !old.is : true,
//       atRuleParams: states[keywordsIndex].atRuleParams,
//       atRuleType: states[keywordsIndex].atRuleType,
//       ruleString:
//         currentStateIndex == keywordsIndex && old.ruleString
//           ? ""
//           : `${states[keywordsIndex].states}`,
//     }));

//     setCurrentStateIndex(keywordsIndex);
//     console.log(states[keywordsIndex].atRuleParams);

//     editor.Devices.getDevices().forEach((device) => {
//       if (!states[keywordsIndex].atRuleParams) {
//         editor.Devices.select("desktop");
//         return;
//       }
//       if (
//         states[keywordsIndex].atRuleParams?.includes(device.getWidthMedia())
//       ) {
//         editor.Devices.select(device.getName());
//       }
//     });
//   }


//   useMemo(() => {
//     if (!selectedEl.currentEl) return;
//     extractRules();
//     updateCurrentIndex();
//     console.log("extract rules");

//     // updateCurrentIndex();
//   }, [selectedEl, selector]);

  

//   useMemo(() => {
//     if (!editor) return;
//     const callback = () => {
//       const rules = extractRules(false);
//       if(!rules) return;
//       rules.length && states.length && setStates(rules);
//     };
//     // updateCurrentIndex();

//     editor.on("inf:rules:update", callback);
//     editor.on("device:change", updateCurrentIndex);

//     return () => {
//       editor.off("inf:rules:update", callback);
//       editor.off("device:change", updateCurrentIndex);
//     };
//   }, [editor]);

//   return (
//     <section className="mt-3 flex flex-col gap-2  p-1 bg-surface-secondary rounded-lg auto-animate">
//       <section className="flex  gap-2   rounded-lg  justify-between overflow-hidden ">
//         <Select
//           placeholder="state"
//           respectParenthesis={true}
//           keywords={statesKeys}
//           singleValInInput={false}
//           value={state}
//           // setVal={setVal}
//           setValue={setState}
//           // onInput={(value) => {
//           //   setState(value);
//           // }}
//           onEnterPress={(keyword) => {
//             // setState(keyword);
//             console.log("keyword : ", keyword);

//             addState(keyword);
//           }}
//           onItemClicked={(keyword, i) => {
//             // console.log(keyword, " clicked");

//             // setState(keyword);
//             addState(keyword);
//           }}
//         />

//         <SmallButton
//           className="shrink-0 bg-surface-tertiary  "
//           // tooltipTitle="Add state"
//           onClick={(ev) => {
//             addState(state);
//           }}
//         >
//           {Icons.plus("#fff")}
//         </SmallButton>

//         <SmallButton
//           className=" shrink-0 bg-surface-tertiary  "
//           // tooltipTitle="Add new line"
//           onClick={(ev) => {
//             addNewStateContainer();
//           }}
//         >
//           {Icons.newLine("#fff")}
//         </SmallButton>
//       </section>

//       {/* {getLastIndex(states) >= 0  && states[getLastIndex(states)][0] ? ( */}
//       {!!states.length && (
//         <section ref={chicesRefEl} className="flex flex-col gap-2 relative animate-go-to">
//           {states.map(
//             ({ rule, states, statesAsArray, atRuleParams, atRuleType }, i) => {
//               console.log("ruuule : ", rule, rule.match(styleRgx));

//               return (
//                 <ChoicesForStates
//                   key={i}
//                   keywordsIndex={i}
//                   atRuleParams={atRuleParams}
//                   atRuleType={atRuleType}
//                   currentStateIndex={currentStateIndex}
//                   keywords={statesAsArray}
//                   stateRule={rule}
//                   onDelete={(ev, index) => {
//                     removeStateContainer(index);
//                   }}
//                   onSelect={(ev, keywordsIndex) => {
//                     selectContainer(keywordsIndex);
//                   }}
//                   onCloseClick={(ev, keyword, index, keywordsIndex) => {
//                     setCurrentStateIndex(keywordsIndex);
//                     removeState(keyword, keywordsIndex);
//                   }}
//                 />
//               );
//             },
//           )}
//         </section>
//       )}
//       {/* ) : null} */}
//     </section>
//   );
// });
