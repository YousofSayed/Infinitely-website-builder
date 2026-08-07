import {
  currentElState,
  ruleState,
  selectorState,
} from "@/helpers/atoms";
import { useRemoveCssProp } from "@/hooks/useRemoveCssProp";
import { useSetClassForCurrentEl } from "@/hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "@/hooks/useUpdateInputValue";
import { ScrollableToolbar } from "@/components/Protos/ScrollableToolbar";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

/**
 *
 * @param {{label:string , dir:string, setChoice:(choice:string)=>void ,cssProp : string , choices :{choice:string , Icon: HTMLOrSVGElement}[]}} param0
 * @returns
 */
export const MultiChoice = ({
  label,
  icons,
  dir,
  rotate = false,
  cssProp,
  choices,
  setChoice = (_) => {},
}) => {
  const setClass = useSetClassForCurrentEl();
  const [currentChoice, setCurrentChoice] = useState(null);
  const lastIndex = useRef(null);
  const [val, setVal] = useState("");
  const removeProp = useRemoveCssProp();

  useUpdateInputValue({ setVal, cssProp });

  useEffect(() => {
    const currentElCssIndex = choices.findIndex(
      ({ choice }) => choice.trim() == val?.trim()
    );
    console.log("indooooooooooo : ", currentElCssIndex);

    lastIndex.current = currentElCssIndex;
    setCurrentChoice(currentElCssIndex);
  }, [val]);

  const handleSelecting = (index) => {
    if (index == lastIndex.current) {
      setCurrentChoice(null);
      lastIndex.current = null;

      // removeProp({cssProp})
      setClass({
        cssProp,
        value: "",
      });
      setChoice("");
      return;
    }
    setChoice(choices[index].choice);

    setClass({
      cssProp,
      value: choices[index].choice,
    });

    lastIndex.current = index;
    setCurrentChoice(index);
  };

  // console.log('loprp : ' ,  rotate ,
  //             dir ,
  //             `${
  //               dir.includes("column") && cssProp === "align-items"
  //                 ? "rotate-0"
  //                 : "rotate-[90deg]"
  //             }`,
              
  //             rotate &&
  //             dir &&
  //             `${
  //               !dir.includes("column") && cssProp === "align-items"
  //                 ? "rotate-0"
  //                 : "rotate-[90deg]"
  //             }` );
  
  return (
    // <ul  className="flex ll justify-between flex-nowrap items-center  w-full p-2 bg-surface-tertiary rounded-lg transition-all">
    <section className="flex flex-col gap-2">
      {label && <FitTitle className="custom-font-size">{label}</FitTitle>}
      <ScrollableToolbar
        className="w-full h-full items-center justify-between  bg-surface-tertiary rounded-lg transition-all"
        space={3}
      >
        {choices.map(({ choice, Icon }, i) => (
          <li
            title={choice}
            key={i}
            className={`group  
              
              ${
              rotate && dir && cssProp =='align-items' ? 
             'rotate-[0]' :  dir && cssProp =='align-items' ? 'rotate-[90deg]'  : ''
            }
              ${
              rotate && dir && cssProp =='justify-content' ? 
             'rotate-[90deg]' :  dir&& cssProp =='justify-content' ? 'rotate-[0]'  : ''
            }
            
            transition-all cursor-pointer flex flex-shrink-0 justify-center items-center w-[37.5px] h-[37.5px] rounded-lg ${
              i == currentChoice
                ? " bg-brand-primary shadow-md shadow-slate-900 "
                : ""
            }  transition-[background]`}
            onClick={(ev) => {
              handleSelecting(i);
            }}
          >
            {Icon({
              fill: i == currentChoice ? "white" : "",
              strokeColor: i == currentChoice ? "white" : "",
              width: 19,
            })}
          </li>
        ))}
      </ScrollableToolbar>
    </section>

    // </ul>
  );
};
