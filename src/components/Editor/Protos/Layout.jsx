import { displayValues } from "@/constants/cssProps";
import { currentElState } from "@/helpers/atoms";
import { useUpdateInputValue } from "@/hooks/useUpdateInputValue";
import { Display } from "@/components/Editor/Protos/Display";
import { FlexChildProps } from "@/components/Editor/Protos/FlexChildProps";
import { FlexLayout } from "@/components/Editor/Protos/FlexLayout";
import { GridLayout } from "@/components/Editor/Protos/GridLayout";
import { GridPropsChilds } from "@/components/Editor/Protos/GridPropsChilds";
import { Margin } from "@/components/Editor/Protos/Margin";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Paddaing } from "@/components/Editor/Protos/Paddding";
import { Positioning } from "@/components/Editor/Protos/Positioning";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import { Size } from "@/components/Editor/Protos/Size";
import { useEditorMaybe } from "@grapesjs/react";
import React, { memo, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

/**
 *
 * @param {{currentEl:HTMLElement}} param0
 * @returns
 */
export const Layout = memo(({}) => {
  

  return (
    <section className=" p-1 flex flex-col gap-2 bg-surface-secondary rounded-lg">
      <Size />

      <Paddaing />

      <Margin />
      
      <Positioning />
      
      <Display/>
      {/* <section className=" flex flex-col gap-2  rounded-lg bg-surface-secondary">
        <MiniTitle>display</MiniTitle>
        <SelectStyle
          label="display"
          cssProp="display"
          keywords={displayValues}
          setKeyword={setOption}
        />
      </section>

      {( option && (option.includes("flex") || option.includes("grid"))) && (
        <section className=" flex flex-col gap-2  rounded-lg bg-surface-secondary">
          {option.includes("flex") && <FlexLayout />}
          {option.includes("grid") && <GridLayout />}
        </section>
      )}
      {isParentFlex && <FlexChildProps/>}
      {isParentGrid && <GridPropsChilds/>} */}

    </section>
  );
});
