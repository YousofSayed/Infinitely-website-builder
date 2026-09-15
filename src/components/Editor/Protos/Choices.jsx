import { inf_class_name } from "@/constants/shared";
import {
  cmpRulesState,
  currentElState,
  editorStt,
  ruleState,
  selectorState,
} from "@/helpers/atoms";
import {
  getComponentRules,
  getCurrentMediaDevice,
  getCurrentSelector,
} from "@/helpers/functions";
import { Icons } from "@/components/Icons/Icons";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { useEditorMaybe } from "@grapesjs/react";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { isFunction } from "lodash";

/**
 *
 * @param {{
 *  keywords: string[],
 *  className: string,
 *  keywordClassName: string | (({ keyword, index }: { keyword: string, index: number }) => string),
 *  onActive: ({ keyword, index }: { keyword: string, index: number }) => void,
 *  onUnActive: ({ keyword, index }: { keyword: string, index: number }) => void,
 *  enableSelecting: boolean,
 *  onCloseClick: (ev: MouseEvent, keyword: string, index: number) => void,
 *  onSelect: (keyword: string, index: number) => void,
 *  externalActiveIndex: number | undefined,
 *  externalNotifiers: Record<string, boolean> | undefined,
 *  enableClose: boolean
 * }} param0
 * @returns
 */
export const Choices = ({
  keywords = [],
  enableSelecting = false,
  className = "",
  keywordClassName = "",
  onActive = (_ev, _keyword, _index) => {},
  onUnActive = (_ev, _keyword, _index) => {},
  onCloseClick = (_, _1, _2) => {},
  onSelect = null,
  externalActiveIndex = undefined,
  externalNotifiers = undefined,
  enableClose = true,
}) => {
  const isExternal =
    externalActiveIndex !== undefined ||
    externalNotifiers !== undefined ||
    onSelect !== null;

  const sle = useRecoilValue(currentElState);
  const [selector, setSelector] = useRecoilState(selectorState);
  const editor = useEditorMaybe();
  const [active, setActive] = useState(false);
  const [keyword, setKeyword] = useState("");
  const currentIndex = useRef(-1);
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [notifiers, setNotifiers] = useState({});
  const [rule, setRule] = useRecoilState(ruleState);

  const selectingCallback = useCallback(() => {
    if (isExternal) return;
    const currentSelector = getCurrentSelector(selector, editor?.getSelected());

    const index = keywords.findIndex((item) => {
      return (
        currentSelector.replace(".", "").toLowerCase() === item.toLowerCase()
      );
    });

    currentIndex.current = index;
    const isActive = index !== -1;
    setActive(Boolean(isActive));
    setKeyword(keywords[index] || "");
  }, [selector, editor, keywords, isExternal]);

  useEffect(() => {
    if (isExternal) return;
    active
      ? onActive({ keyword, index: currentIndex.current })
      : onUnActive({ keyword, index: currentIndex.current });
  }, [active, isExternal]);

  useEffect(() => {
    if (isExternal) return;
    if (!enableSelecting) return;
    if (!editor) return;
    selectingCallback();
  }, [selectingCallback, sle, isExternal]);

  const makeNotifiers = () => {
    if (isExternal) return;
    const newNotifiers = {};
    const currentMedia = getCurrentMediaDevice(editor);

    for (const rule of cmpRules) {
      let keyword;

      if (
        rule.atRuleType &&
        rule.atRuleParams == currentMedia.atRuleParams &&
        keywords.some((item) => {
          const className = rule.rule
            .match(/\..+\{/gi)?.[0]
            ?.replace?.(".", "")
            ?.replace?.("{", "");

          const cond = item == className || className.startsWith(`${item}:`);
          cond && (keyword = item);
          return cond;
        })
      ) {
        newNotifiers[keyword] = true;
      } else if (
        !rule.atRuleType &&
        Boolean(rule.atRuleParams) == Boolean(currentMedia.atRuleParams) &&
        keywords.some((item) => {
          const className = rule.rule
            .match(/\..+\{/gi)?.[0]
            ?.replace?.(".", "")
            ?.replace?.("{", "");

          const cond = item == className || className.startsWith(`${item}:`);
          cond && (keyword = item);
          return cond;
        })
      ) {
        newNotifiers[keyword] = true;
      }
    }

    setNotifiers(newNotifiers);
  };

  useEffect(() => {
    if (isExternal) return;
    if (!enableSelecting) return;
    if (!(editor && cmpRules.length)) return;
    makeNotifiers();
    editor.on("device:change", makeNotifiers);
    return () => {
      editor.off("device:change", makeNotifiers);
    };
  }, [cmpRules, editor, sle, keywords, isExternal]);

  useEffect(() => {
    if (isExternal) return;
    const selected = editor?.getSelected();
    if (!selected) return;
    if (enableSelecting) {
      selectingCallback();
      selected.on("change:attributes", selectingCallback);
    }

    return () => {
      selected.off("change:attributes", selectingCallback);
    };
  }, [selector, active, sle, editor, keywords, isExternal]);

  useEffect(() => {
    if (isExternal) return;
    if (!editor) return;
    setCmpRules(
      getComponentRules({
        editor,
        cmp: editor.getSelected(),
        nested: true,
      }).rules,
    );
  }, [editor, keywords, isExternal]);

  const finalActiveIndex = isExternal
    ? externalActiveIndex
    : active
      ? currentIndex.current
      : -1;
  const finalNotifiers = isExternal ? externalNotifiers || {} : notifiers;

  return (
    <section
      className={`w-full gap-2 auto-animate flex items-center p-1 rounded-lg  ${
        className ? className : "bg-surface-tertiary"
      }`}
    >
      {Boolean(keywords.length) ? (
        keywords.map((kw, i) => {
          const isCurrentActive = finalActiveIndex === i;
          const hasNotifier = Boolean(finalNotifiers[kw]);

          let stateClasses = "";
          if (isCurrentActive) {
            stateClasses = "bg-brand-primary";
          } else if (enableSelecting || isExternal) {
            stateClasses = "bg-surface-secondary";
          } else {
            stateClasses = "bg-brand-primary";
          }

          const customClasses = isFunction(keywordClassName)
            ? keywordClassName({ keyword: kw, index: i })
            : keywordClassName || "";

          return (
            kw && (
              <p
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();

                  if (isExternal && onSelect) {
                    onSelect(kw, i);
                    return;
                  }

                  if (!enableSelecting) return;

                  const valueWithoutDot = selector.startsWith(".")
                    ? selector.replace(".", "").toLowerCase() ===
                      kw.toLowerCase()
                    : selector.toLowerCase() === kw.toLowerCase();

                  setRule({
                    is: false,
                    ruleString: "",
                    atRuleParams: null,
                    atRuleType: null,
                  });

                  setSelector(valueWithoutDot ? "" : `.${kw}`);
                }}
                key={i}
                className={`text-nowrap break-all relative custom-font-size group px-[20px] w-fit cursor-pointer select-none shrink-0 py-2 text-white ${stateClasses} transition-all rounded-lg font-semibold ${customClasses}`}
              >
                {kw}

                {enableClose && (
                  <i
                    onClick={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      onCloseClick(ev, kw, i);
                    }}
                    className="close transition-all opacity-0 group-hover:opacity-100 absolute -top-[2px] -right-[2px] w-[16.5px] h-[16.5px] rounded-lg bg-[crimson] flex items-center justify-center"
                  >
                    {Icons.close("white", 2, undefined, 11, 11)}
                  </i>
                )}

                {hasNotifier && (
                  <i className="absolute -top-[2px] -left-[2px] w-[16.5px] h-[16.5px] rounded-full bg-brand-primary border-2 border-surface-tertiary shadow-sm"></i>
                )}
              </p>
            )
          );
        })
      ) : (
        <h1 className="text-text-primary animate-pulse w-full flex justify-center items-center">
          No thing here{" "}
        </h1>
      )}
    </section>
  );
};
// import { inf_class_name } from "@/constants/shared";
// import {
//   cmpRulesState,
//   currentElState,
//   editorStt,
//   ruleState,
//   selectorState,
// } from "@/helpers/atoms";
// import {
//   getComponentRules,
//   getCurrentMediaDevice,
//   getCurrentSelector,
// } from "@/helpers/functions";
// import { Icons } from "@/components/Icons/Icons";
// import { SmallButton } from "@/components/Editor/Protos/SmallButton";
// import { useEditorMaybe } from "@grapesjs/react";
// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useLayoutEffect,
//   useRef,
//   useState,
// } from "react";
// import { useRecoilState, useRecoilValue } from "recoil";
// import { isFunction } from "lodash";

// // million-ignore
// /**
//  *
//  * @param {{keywords : string[] , className:string  , keywordClassName:string | ({ keyword , index} : { keyword:string , index:number})=>string, onActive : ({ keyword , index} : { keyword:string , index:number})=>void, onUnActive : ({ keyword , index} : { keyword:string , index:number})=>void,  enableSelecting:boolean,  onCloseClick : (ev : MouseEvent , keyword : string , index:number) => void , }} param0
//  * @returns
//  */
// export const Choices = ({
//   keywords = [],
//   enableSelecting = false,
//   className = "",
//   keywordClassName = "",
//   onActive = (_ev, _keyword, _index) => {},
//   onUnActive = (_ev, _keyword, _index) => {},
//   onCloseClick = (_, _1) => {},
// }) => {
//   const sle = useRecoilValue(currentElState);
//   const [currentSelector, setCurrentSelcetor] = useState("");
//   const [selector, setSelector] = useRecoilState(selectorState);
//   const editor = useEditorMaybe();
//   const [active, setActive] = useState(false);
//   const [keyword, setKeyword] = useState("");
//   const currentIndex = useRef();
//   const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
//   const [notifiers, setNotifiers] = useState({});
//   const [rule, setRule] = useRecoilState(ruleState);
//   // useEffect(() => {
//   //   setActive(false);
//   // }, [sle]);

//   const selectingCallback = useCallback(() => {
//     const currentSelector = getCurrentSelector(selector, editor.getSelected());
//     console.log("current   : ", currentSelector, selector);

//     const index = keywords.findIndex((item) => {
//       // console.log(currentSelector.replace('.','').toLowerCase() == item.toLowerCase() , currentSelector.toLowerCase() , item.toLowerCase());
//       return (
//         currentSelector.replace(".", "").toLowerCase() === item.toLowerCase()
//       );
//     });

//     currentIndex.current = index;
//     const active = index == -1 ? false : true;
//     setActive(Boolean(active));
//     console.log(
//       "indexoo : ",
//       active,
//       index,
//       currentIndex.current,
//       keywords[index],
//     );

//     // active ? onActive({ keyword, index: currentIndex.current }) :  onUnActive({ keyword, index: currentIndex.current });
//     setKeyword(new String(keywords[index] || ""));
//   }, [selector, editor, keywords]);

//   useEffect(() => {
//     active
//       ? onActive({ keyword, index: currentIndex.current })
//       : onUnActive({ keyword, index: currentIndex.current });
//   }, [active]);

//   useEffect(() => {
//     if (!enableSelecting) return;
//     if (!editor) return;
//     selectingCallback();

//     // setCurrentSelcetor(currentSelector);
//   }, [selectingCallback, sle]);

//   const makeNotifiers = () => {
//     const newNotifiers = {};
//     const currentMedia = getCurrentMediaDevice(editor);
//     console.log("crm:", cmpRules, currentMedia);

//     for (const rule of cmpRules) {
//       let keyword;
//       console.log(
//         "cr:",
//         rule.atRuleParams == currentMedia.atRuleParams,
//         rule.atRuleParams,
//         currentMedia.atRuleParams,
//       );

//       if (
//         rule.atRuleType &&
//         rule.atRuleParams == currentMedia.atRuleParams &&
//         keywords.some((item) => {
//           const className = rule.rule
//             .match(/\..+\{/gi)?.[0]
//             ?.replace?.(".", "")
//             ?.replace?.("{", "");
//           console.log("className  : ", className);

//           const cond = item == className || className.startsWith(`${item}:`);
//           console.log("cond : ", cond, "item:", item);

//           cond && (keyword = item);
//           return cond;
//         })
//       ) {
//         newNotifiers[keyword] = true;
//       } else if (
//         !rule.atRuleType &&
//         Boolean(rule.atRuleParams) == Boolean(currentMedia.atRuleParams) &&
//         keywords.some((item) => {
//           const className = rule.rule
//             .match(/\..+\{/gi)?.[0]
//             ?.replace?.(".", "")
//             ?.replace?.("{", "");
//           console.log("className  : ", className);

//           const cond = item == className || className.startsWith(`${item}:`);
//           console.log("cond : ", cond, "item:", item, className);
//           cond && (keyword = item);
//           return cond;
//         })
//       ) {
//         console.log("cr from elsooooo");

//         newNotifiers[keyword] = true;
//       }
//     }

//     setNotifiers(newNotifiers);
//     console.log("cr notf : ", newNotifiers);
//   };

//   useEffect(() => {
//     if (!enableSelecting) return;
//     if (!(editor && cmpRules.length)) return;
//     makeNotifiers();
//     editor.on("device:change", makeNotifiers);
//     return () => {
//       editor.off("device:change", makeNotifiers);
//     };
//   }, [cmpRules, editor, sle, keywords]);

//   useEffect(() => {
//     const selected = editor.getSelected();
//     console.log("fired before");
//     if (!selected) return;
//     console.log("fired after");
//     if (enableSelecting) {
//       selectingCallback();
//       selected.on("change:attributes", selectingCallback);
//     }

//     return () => {
//       selected.off("change:attributes", selectingCallback);
//     };
//   }, [selector, active, sle, editor, keywords]);

//   useEffect(() => {
//     if (!editor) return;
//     setCmpRules(
//       getComponentRules({
//         editor,
//         cmp: editor.getSelected(),
//         nested: true,
//       }).rules,
//     );
//   }, [editor, keywords]);

//   return (
//     <section
//       className={`w-full    gap-2 flex items-center p-1 rounded-lg  ${
//         className ? className : "bg-surface-tertiary"
//       }`}
//     >
//       {Boolean(keywords.length) &&
//         keywords.map((keyword, i) => {
//           return (
//             keyword && (
//               <p
//                 onClick={(ev) => {
//                   ev.stopPropagation();
//                   ev.preventDefault();

//                   if (!enableSelecting) return;

//                   const valueWithoutDot = selector.startsWith(".")
//                     ? selector.replace(".", "").toLowerCase() ===
//                       keyword.toLowerCase()
//                     : selector.toLowerCase() === keyword.toLowerCase();
//                   console.log(
//                     "selector setttting indexoo",
//                     selector,
//                     keyword,
//                     valueWithoutDot,
//                   );
//                   setRule({
//                     is: false,
//                     ruleString: "",
//                     atRuleParams: null,
//                     atRuleType: null,
//                   });

//                   setSelector(valueWithoutDot ? "" : `.${keyword}`);
//                 }}
//                 key={i}
//                 className={`text-nowrap break-all relative custom-font-size group px-[20px] w-fit cursor-pointer select-none  shrink-0 py-2 text-white ${
//                   active && currentIndex.current == i
//                     ? "bg-brand-primary"
//                     : enableSelecting
//                       ? "bg-surface-secondary"
//                       : "bg-brand-primary"
//                 }  transition-all rounded-lg font-semibold ${isFunction(keywordClassName) ? keywordClassName({ keyword, index: i }) : keywordClassName || ""}`}
//               >
//                 {keyword}
//                 <i
//                   onClick={(ev) => {
//                     ev.stopPropagation();
//                     ev.preventDefault();

//                     onCloseClick(ev, keyword, i);
//                   }}
//                   className="absolute bg-brand-primary shadow-sm shadow-blue-950 w-[23px]  h-[23px] flex items-center justify-center rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-[1]  right-[-5px] top-[-5px] z-50"
//                 >
//                   {Icons.close("white", "", "white")}
//                 </i>

//                 {notifiers[keyword] && (
//                   <span className="absolute w-[10px] h-[10px] rounded-full bg-brand-primary shadow-lg shadow-slate-950 left-[-5px] top-[-5px]"></span>
//                 )}
//               </p>
//             )
//           );
//         })}

//       {!Boolean(keywords.length) && (
//         <h1 className="text-text-primary animate-pulse w-full flex justify-center items-center">
//           No thing here{" "}
//         </h1>
//       )}
//     </section>
//   );
// };
