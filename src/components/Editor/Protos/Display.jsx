import React, { useEffect, useState } from "react";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { useRecoilValue } from "recoil";
import { useEditorMaybe } from "@grapesjs/react";
import { FlexChildProps } from "./FlexChildProps";
import { GridPropsChilds } from "./GridPropsChilds";
import { GridLayout } from "./GridLayout";
import { FlexLayout } from "./FlexLayout";
import { SelectStyle } from "./SelectStyle";
import { MiniTitle } from "./MiniTitle";
import { currentElState } from "../../../helpers/atoms";
import { displayValues } from "../../../constants/cssProps";

export const Display = () => {
    const [option, setOption] = useState("");
  const editor = useEditorMaybe()
  const currentEl = useRecoilValue(currentElState);
  const [isParentFlex , setIsParentFlex] = useState(false);
  const [isParentGrid , setIsParentGrid] = useState(false);
  useEffect(()=>{
    if(!editor || !editor?.getSelected?.())return; 
    /**
     * 
     * @param {HTMLElement} el 
     * @returns 
     */
    const getParentDisplayValue = (el)=>{
      if(!el.parentElement){
        return {
          flex:false,
          grid:false,
        }
      }
      const computedChildStyle =  editor.Canvas.getWindow().getComputedStyle(el.parentElement)
      const computedParentStyle =  editor.Canvas.getWindow().getComputedStyle(el.parentElement)
      const displayParent =computedParentStyle.display;
      const displayChild = computedChildStyle.display;
      const flexCond = displayParent == 'flex' || displayChild == 'flex' ;

      const gridCond = displayParent == 'grid'|| displayChild =='grid'
      // console.log('cond :' , cond);
      
      return {
        flex:flexCond,
        grid:gridCond
      }
    }
    const displayValue = getParentDisplayValue(editor.getSelected().getEl());
    setIsParentFlex(displayValue.flex);
    setIsParentGrid(displayValue.grid);
  },[currentEl , editor])

  

  useUpdateInputValue(({
    cssProp:'display',
    setVal:setOption
  }));
  
  return (
    <>
      <section className=" flex flex-col gap-2  rounded-lg bg-slate-900">
        <MiniTitle>display</MiniTitle>
        <SelectStyle
          label="display"
          cssProp="display"
          keywords={displayValues}
          setKeyword={setOption}
        />
      </section>

      {option && (option.includes("flex") || option.includes("grid")) && (
        <section className=" flex flex-col gap-2  rounded-lg bg-slate-900">
          {option.includes("flex") && <FlexLayout />}
          {option.includes("grid") && <GridLayout />}
        </section>
      )}
      {isParentFlex && <FlexChildProps />}
      {isParentGrid && <GridPropsChilds />}
    </>
  );
};
