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
  currentElState,
  editorStt,
  selectorState,
} from "../../../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";
import { getCurrentSelector } from "../../../helpers/functions";
import { inf_class_name } from "../../../constants/shared";

/**
 *
 * @param {{keywords : string[] , className:string , onActive : ({ keyword , index} : { keyword:string , index:number})=>void, onUnActive : ({ keyword , index} : { keyword:string , index:number})=>void,  enableSelecting:boolean,  onCloseClick : (ev : MouseEvent , keyword : string , index:number) => void , }} param0
 * @returns
 */
export const Choices = memo(
  ({
    keywords,
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

    useEffect(() => {
      setActive(false);
    }, [sle]);

    useEffect(() => {
      active
        ? onActive({ keyword, index: currentIndex.current })
        : onUnActive({ keyword, index: currentIndex.current });
    }, [active]);

    useEffect(() => {
      const currentSelector = getCurrentSelector(
        selector,
        editor.getSelected()
      );
      console.log("current   : ", currentSelector, selector);

      const index = keywords.findIndex((item) =>
        currentSelector.toLowerCase().includes(item.toLowerCase())
      );

      currentIndex.current = index;
      const active = index <= -1 ? false : true
      setActive(Boolean(active));
      console.log('indexoo : ' , index , currentIndex.current , keywords[index] , active && currentIndex.current == 0);
      
      // active ? onActive({ keyword, index: currentIndex.current }) :  onUnActive({ keyword, index: currentIndex.current });
      setKeyword(keywords[index]);
      // setCurrentSelcetor(currentSelector);
    }, [selector,active,sle]);

    return (
      <section
        className={`w-full min-h-[50px]   overflow-x-auto gap-2 flex items-center py-[5px] px-2 rounded-lg  ${
          className ? className : "bg-slate-800"
        }`}
      >
        {keywords.map((keyword, i) => {
          return (
            keyword && (
              <p
                onClick={(ev) => {
                  ev.stopPropagation();
                  const classNameAttrebute = editor
                    .getSelected()
                    .getAttributes()[inf_class_name];

                  if (!enableSelecting) return;

                  // if (
                  //   classNameAttrebute &&
                  //   classNameAttrebute.toLowerCase() == keyword.toLowerCase()
                  // ) {
                  //   console.log('hahah');

                  //   currentIndex.current = i;
                  //   setActive(Boolean(true));
                  //   setKeyword(keyword)
                  //   return;
                  // }

                  // const newActive = !active;
                  // setActive(
                  //   currentIndex.current != i ? Boolean(true) : newActive
                  // );
                  // currentIndex.current = i;
                  // setKeyword(keyword);
                  setSelector(selector.includes(keyword) ? '' : `.${keyword}`);
                }}
                key={i}
                className={`text-wrap break-all relative group px-[20px] w-fit cursor-pointer select-none  flex-shrink-0 py-[10px] text-white ${
                  (active && currentIndex.current == i)
                    ? "bg-blue-600"
                    : enableSelecting
                    ? "bg-slate-900"
                    : "bg-blue-600"
                }  transition-all rounded-lg font-semibold`}
              >
                {keyword}
                <i
                  onClick={(ev) => {
                    onCloseClick(ev, keyword, i);
                  }}
                  className="absolute bg-blue-600 shadow-sm shadow-blue-950 w-[23px]  h-[23px] flex items-center justify-center rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-[1]  right-[-5px] top-[-5px]"
                >
                  {Icons.close("white", "", "white")}
                </i>
              </p>
            )
          );
        })}
      </section>
    );
  }
);
