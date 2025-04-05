import React, { useEffect, useState } from "react";
import { Choices } from "./Choices";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { useRecoilValue } from "recoil";
import { ruleState } from "../../../helpers/atoms";
import { generateBeautifulHexColor } from "../../../helpers/functions";

/**
 *
 * @param {{keywords : string[] , keywordsIndex : number ,atRuleType:string , atRuleParams:string ,currentStateIndex:number , onCloseClick : (ev : MouseEvent , keyword : string , index:number , keywordsIndex:number) => void , onDelete:(ev:MouseEvent , index:number)=>void , onSelect:(ev:MouseEvent , keywordsIndex:number)=>void}} param0
 * @returns
 */
export const ChoicesForStates = ({
  keywords,
  keywordsIndex,
  currentStateIndex,
  atRuleParams = "",
  atRuleType = "",
  onCloseClick = (_, _1) => {},
  onDelete = (ev, index) => {},
  onSelect = (ev, index) => {},
}) => {
  const rule = useRecoilValue(ruleState);
  // const [cIndex  ,setCIndex] = useState(currentStateIndex);

  // useEffect(()=>{
  //   setCIndex(currentStateIndex);
  // },[currentStateIndex])

  return (
    <section
      className={`flex gap-2 transition-all rounded-lg relative ${
        currentStateIndex == keywordsIndex  && rule.is &&
        "p-1 border-2 border-blue-500 "
      }`}
    >
     { (atRuleType && atRuleParams) &&
       <section
       className="absolute p-2 z-[30] top-[3px]  translate-y-[-50%] left-[-7px] shadow-md  overflow-hidden w-[10px] hover:w-fit h-[10px] hover:h-[40px] text-transparent hover:text-slate-200 transition-all rounded-lg  text-sm font-bold capitalize"
       style={{ background: generateBeautifulHexColor() }}
     >
       {atRuleType} : {atRuleParams.match(/\d+/ig)[0]}px
     </section>
     }
      <Choices
      // className="p-1 bg-slate-800"
        keywords={keywords}
        onCloseClick={(ev, keyword, index) => {
          onCloseClick(ev, keyword, index, keywordsIndex);
        }}
      />

      <SmallButton
        className="flex-shrink-0 bg-slate-800"
        onClick={(ev) => {
          onSelect(ev, keywordsIndex);
        }}
      >
        {Icons.select("#fff")}
      </SmallButton>

      <SmallButton
        className={` flex-shrink-0 bg-slate-800`}
        onClick={(ev) => {
          onDelete(ev, keywordsIndex);
        }}
      >
        {Icons.trash("#fff")}
      </SmallButton>
    </section>
  );
};
