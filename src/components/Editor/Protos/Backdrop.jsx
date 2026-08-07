import { filterTypes, filterUnits } from "@/constants/cssProps";
import { MultiFunctionProp } from "@/components/Editor/Protos/MultiFunctionProp";
import React from "react";

export const Backdrop = () => {
  return (
    <MultiFunctionProp
        cssProp={"backdrop-filter"}
        keywords={[...filterTypes, "url"]}
        units={{...filterUnits, url:''}}
        placeholder={"Select Filter"}
      />
  );
};
