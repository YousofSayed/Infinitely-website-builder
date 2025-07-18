import React, { memo, useEffect, useState } from "react";
import { displayValues } from "../../../constants/cssProps";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../../helpers/atoms";
import { GridLayout } from "./GridLayout";
import { FlexLayout } from "./FlexLayout";
import { SelectStyle } from "./SelectStyle";
import { Size } from "./Size";
import { MiniTitle } from "./MiniTitle";
import { Positioning } from "./Positioning";
import { Paddaing } from "./Paddding";
import { Margin } from "./Margin";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { useEditorMaybe } from "@grapesjs/react";
import { FlexChildProps } from "./FlexChildProps";
import { GridPropsChilds } from "./GridPropsChilds";

/**
 *
 * @param {{currentEl:HTMLElement}} param0
 * @returns
 */
export const Layout = memo(({}) => {
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

  useEffect(() => {
    console.log(option);
  }, [option]);

  useUpdateInputValue(({
    cssProp:'display',
    setVal:setOption
  }))

  return (
    <section className="mt-3 pb-2 flex flex-col gap-2">
      <Size />

      <Paddaing />

      <Margin />
      
      <Positioning />

      <section className=" flex flex-col gap-2 px-2 rounded-lg bg-slate-900">
        <MiniTitle>display</MiniTitle>
        <SelectStyle
          label="display"
          cssProp="display"
          keywords={displayValues}
          setKeyword={setOption}
        />
      </section>

      {(option.includes("flex") || option.includes("grid")) && (
        <section className=" flex flex-col gap-2 p-2 rounded-lg bg-slate-900">
          {option.includes("flex") && <FlexLayout />}
          {option.includes("grid") && <GridLayout />}
        </section>
      )}
      {isParentFlex && <FlexChildProps/>}
      {isParentGrid && <GridPropsChilds/>}

    </section>
  );
});
