import React from "react";
import { MultiFunctionProp } from "./MultiFunctionProp";
import { filterTypes, filterUnits } from "../../../constants/cssProps";

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
