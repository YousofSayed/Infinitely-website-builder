import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Icons } from "../../Icons/Icons";
import { SmallButton } from "./SmallButton";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  cmpRulesState,
  currentElState,
  editorStt,
  ruleState,
  selectorState,
} from "../../../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";
import {
  getCurrentMediaDevice,
  getCurrentSelector,
} from "../../../helpers/functions";
import { inf_class_name } from "../../../constants/shared";

// million-ignore
/**
 *
 * @param {{keywords : string[] , className:string , onActive : ({ keyword , index} : { keyword:string , index:number})=>void, onUnActive : ({ keyword , index} : { keyword:string , index:number})=>void,  enableSelecting:boolean,  onCloseClick : (ev : MouseEvent , keyword : string , index:number) => void , }} param0
 * @returns
 */
export const Choices = ({
  keywords = [],
  enableSelecting = false,
  className = "",
  onActive = (_ev, _keyword, _index) => {},
  onUnActive = (_ev, _keyword, _index) => {},
  onCloseClick = (_, _1) => {},
}) => {
  const sle = useRecoilValue(currentElState);
  const [currentSelector, setCurrentSelcetor] = useState("");
  const [selector, setSelector] = useRecoilState(selectorState);
  const editor = useEditorMaybe();
  const [active, setActive] = useState(false);
  const [keyword, setKeyword] = useState("");
  const currentIndex = useRef();
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [notifiers, setNotifiers] = useState({});
  const [rule, setRule] = useRecoilState(ruleState);
  // useEffect(() => {
  //   setActive(false);
  // }, [sle]);

  const selectingCallback = () => {
    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    console.log("current   : ", currentSelector, selector);

    const index = keywords.findIndex((item) => {
      // console.log(currentSelector.replace('.','').toLowerCase() == item.toLowerCase() , currentSelector.toLowerCase() , item.toLowerCase());
      return (
        currentSelector.replace(".", "").toLowerCase() == item.toLowerCase()
      );
    });

    currentIndex.current = index;
    const active = index <= -1 ? false : true;
    setActive(Boolean(active));
    console.log(
      "indexoo : ",
      index,
      currentIndex.current,
      keywords[index],
    );

    // active ? onActive({ keyword, index: currentIndex.current }) :  onUnActive({ keyword, index: currentIndex.current });
    setKeyword(new String(keywords[index] || ""));
  };

  useEffect(() => {
    active
      ? onActive({ keyword, index: currentIndex.current })
      : onUnActive({ keyword, index: currentIndex.current });
  }, [active]);

  useEffect(() => {
    if (enableSelecting) {
      selectingCallback();
    }

    // setCurrentSelcetor(currentSelector);
  }, [selector, active, sle, editor, keywords]);

  const makeNotifiers = () => {
    const newNotifiers = {};
    const currentMedia = getCurrentMediaDevice(editor);
    console.log("crm:", cmpRules, currentMedia);

    for (const rule of cmpRules) {
      let keyword;
      console.log(
        "cr:",
        rule.atRuleParams == currentMedia.atRuleParams,
        rule.atRuleParams,
        currentMedia.atRuleParams
      );

      if (
        rule.atRuleType &&
        rule.atRuleParams == currentMedia.atRuleParams &&
        keywords.some((item) => {
          const className = rule.rule
            .match(/\..+\{/gi)?.[0]
            ?.replace?.(".", "")
            ?.replace?.("{", "");
          console.log("className  : ", className);

          const cond = item == className || className.startsWith(`${item}:`);
          console.log('cond : ' , cond , 'item:' , item);
          
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
          console.log("className  : ", className);
          
          const cond = item == className || className.startsWith(`${item}:`);
          console.log('cond : ' , cond , 'item:' , item , className);
          cond && (keyword = item);
          return cond;
        })
      ) {
        console.log("cr from elsooooo");

        newNotifiers[keyword] = true;
      }
    }

    setNotifiers(newNotifiers);
    console.log("cr notf : ", newNotifiers);
  };

  useEffect(() => {
    if (!enableSelecting) return;
    if (!(editor && cmpRules.length)) return;
    makeNotifiers();
    editor.on("device:change", makeNotifiers);
    return () => {
      editor.off("device:change", makeNotifiers);
    };
  }, [cmpRules, editor, sle, keywords]);

  useEffect(() => {
    const selected = editor.getSelected();
    console.log("fired before");
    if (!selected) return;
    console.log("fired after");
    if (enableSelecting) {
      selectingCallback();
      selected.on("change:attributes", selectingCallback);
    }

    return () => {
      selected.off("change:attributes", selectingCallback);
    };
  }, [selector, active, sle, editor, keywords]);

  return (
    <section
      className={`w-full    gap-2 flex items-center p-1 rounded-lg  ${
        className ? className : "bg-slate-800"
      }`}
    >
      {keywords.map((keyword, i) => {
        return (
          keyword && (
            <p
              onClick={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
               
                if (!enableSelecting) return;


                console.log("selector setttting");
                setRule({
                  is: false,
                  ruleString: "",
                  atRuleParams: null,
                  atRuleType: null,
                });
                setSelector(
                  selector.toLowerCase() === keyword.toLowerCase()
                    ? ""
                    : `.${keyword}`
                );
              }}
              key={i}
              className={`text-nowrap break-all relative custom-font-size group px-[20px] w-fit cursor-pointer select-none  flex-shrink-0 py-2 text-white ${
                active && currentIndex.current == i
                  ? "bg-blue-600"
                  : enableSelecting
                  ? "bg-slate-900"
                  : "bg-blue-600"
              }  transition-all rounded-lg font-semibold`}
            >
              {keyword}
              <i
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();

                  onCloseClick(ev, keyword, i);
                }}
                className="absolute bg-blue-600 shadow-sm shadow-blue-950 w-[23px]  h-[23px] flex items-center justify-center rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-[1]  right-[-5px] top-[-5px] z-50"
              >
                {Icons.close("white", "", "white")}
              </i>

              {notifiers[keyword] && (
                <span className="absolute w-[10px] h-[10px] rounded-full bg-blue-600 shadow-lg shadow-slate-950 left-[-5px] top-[-5px]"></span>
              )}
            </p>
          )
        );
      })}
    </section>
  );
};
