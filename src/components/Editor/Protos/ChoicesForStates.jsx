import React, { useEffect, useState } from "react";
import { Choices } from "./Choices";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { useRecoilValue } from "recoil";
import { ruleState } from "../../../helpers/atoms";
import { generateBeautifulHexColor } from "../../../helpers/functions";
import { isArray } from "lodash";
import { styleRgx } from "../../../constants/rgxs";

/**
 *
 * @param {{keywords : string[] ,stateRule:string, keywordsIndex : number ,atRuleType:string , atRuleParams:string ,currentStateIndex:number , onCloseClick : (ev : MouseEvent , keyword : string , index:number , keywordsIndex:number) => void , onDelete:(ev:MouseEvent , index:number)=>void , onSelect:(ev:MouseEvent , keywordsIndex:number)=>void}} param0
 * @returns
 */
export const ChoicesForStates = ({
  keywords,
  keywordsIndex,
  currentStateIndex,
  atRuleParams = "",
  atRuleType = "",
  stateRule = "",
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
      className={`flex flex-col gap-1 transition-all border-2 p-1 rounded-lg w-full relative ${
        currentStateIndex == keywordsIndex && rule.is
          ? " border-blue-500 "
          : "border-slate-600"
      }`}
    >
      {atRuleType && atRuleParams && (
        <section
          className="absolute p-2 z-[30] top-[3px]  translate-y-[-50%] left-[-7px] shadow-md flex justify-center items-center  overflow-hidden w-[10px] hover:w-fit h-[10px] hover:h-[40px] text-transparent hover:text-slate-200  transition-all rounded-lg  text-sm font-bold capitalize"
          style={{ background: generateBeautifulHexColor() }}
        >
          {atRuleType} : {atRuleParams.match?.(/\d+/gi)?.[0] || ""}px
        </section>
      )}

      {isArray(stateRule.match(styleRgx)) && (
        <div className={`w-[12px] h-[12px] absolute right-[-6px] top-[-6px] rounded-full bg-blue-600 ${currentStateIndex == keywordsIndex && rule.is ? "animate-bounce" : ""}`}></div>
      )}

      <Choices
        className="flex-wrap bg-slate-800"
        keywords={keywords}
        onCloseClick={(ev, keyword, index) => {
          onCloseClick(ev, keyword, index, keywordsIndex);
        }}
      />

      <section className="flex w-full justify-center gap-2 p-1">
        <SmallButton 
          className=" bg-slate-800 w-[50%] h-[35px]"
          onClick={(ev) => {
            onSelect(ev, keywordsIndex);
          }}
        >
          {Icons.select("#fff")}
        </SmallButton>

        <SmallButton
          className={`  bg-slate-800 w-[50%] hover:bg-[crimson!important]`}
          onClick={(ev) => {
            const cnfrm = confirm(`Are you sure to delete states ?`);
            if(!cnfrm)return
            onDelete(ev, keywordsIndex);
          }}
        >
          {Icons.trash("#fff")}
        </SmallButton>
      </section>

      {/* <SmallButton
        className=" bg-slate-800"
        onClick={(ev) => {
          onSelect(ev, keywordsIndex);
        }}
      >
        {Icons.select("#fff")}
      </SmallButton>

      <SmallButton
        className={`  bg-slate-800`}
        onClick={(ev) => {
          onDelete(ev, keywordsIndex);
        }}
      >
        {Icons.trash("#fff")}
      </SmallButton> */}
    </section>
  );
};
