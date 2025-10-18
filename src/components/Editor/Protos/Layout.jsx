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
import { Display } from "./Display";

/**
 *
 * @param {{currentEl:HTMLElement}} param0
 * @returns
 */
export const Layout = memo(({}) => {
  

  return (
    <section className=" p-1 flex flex-col gap-2 bg-slate-900 rounded-lg">
      <Size />

      <Paddaing />

      <Margin />
      
      <Positioning />
      
      <Display/>
      {/* <section className=" flex flex-col gap-2  rounded-lg bg-slate-900">
        <MiniTitle>display</MiniTitle>
        <SelectStyle
          label="display"
          cssProp="display"
          keywords={displayValues}
          setKeyword={setOption}
        />
      </section>

      {( option && (option.includes("flex") || option.includes("grid"))) && (
        <section className=" flex flex-col gap-2  rounded-lg bg-slate-900">
          {option.includes("flex") && <FlexLayout />}
          {option.includes("grid") && <GridLayout />}
        </section>
      )}
      {isParentFlex && <FlexChildProps/>}
      {isParentGrid && <GridPropsChilds/>} */}

    </section>
  );
});
