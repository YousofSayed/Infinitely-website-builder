import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  currentElState,
  ruleState,
  selectorState,
} from "../../../helpers/atoms";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { useEditorMaybe } from "@grapesjs/react";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { useRemoveCssProp } from "../../../hooks/useRemoveCssProp";

/**
 *
 * @param {{label:string , setChoice:(choice:string)=>void ,cssProp : string , choices :{choice:string , Icon: HTMLOrSVGElement}[]}} param0
 * @returns
 */
export const MultiChoice = ({
  label,
  icons,
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
      ({choice}) => choice.trim() == val?.trim()
    );

    setCurrentChoice(currentElCssIndex);
  }, [val]);

  const handleSelecting = (index) => {
    if (index == lastIndex.current) {
      setCurrentChoice(null);
      lastIndex.current = null;

      // removeProp({cssProp})
      setClass({
        cssProp,
        value: '',
      });
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

  return (
    <ul  className="flex ll justify-between flex-nowrap items-center  w-full p-2 bg-slate-800 rounded-lg transition-all">
      {choices.map(({choice , Icon}, i) => (
        <li
          title={choice}
          key={i}
          className={`group cursor-pointer flex flex-shrink-0 justify-center items-center w-[37.5px] h-[37.5px] rounded-lg ${
            i == currentChoice ? " bg-blue-500 shadow-md shadow-slate-900 " : ""
          }  transition-[background]`}
          onClick={(ev) => {
            handleSelecting(i);
          }}
        >
          {Icon({fill : i == currentChoice ? "white" : "" , strokeColor: i == currentChoice ? "white" : "", width:19})}
        </li>
      ))}
    </ul>
  );
};
