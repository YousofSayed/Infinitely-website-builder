import React, { useEffect, useState } from "react";
import { SelectedBorder } from "./SelectedBorder";
import { Select } from "./Select";
import { borderStyles } from "../../../constants/cssProps";
import { P } from "../../Protos/P";
import { SelectStyle } from "./SelectStyle";
import { FitTitle } from "./FitTitle";
import { ScrollableToolbar } from "../../Protos/ScrollableToolbar";

export const BorderStyle = () => {
  const [option, setOption] = useState("all");
  const [cssProps, setCssProps] = useState("");

  const handleCssProps = () => {
    switch (option) {
      case "top":
        setCssProps("border-top-style");
        break;
      case "right":
        setCssProps("border-right-style");
        break;
      case "bottom":
        setCssProps("border-bottom-style");
        break;
      case "left":
        setCssProps("border-left-style");
        break;
      case "all":
        setCssProps("border-style");
        break;
      default:
        break;
    }

    console.log(option);
    

    // if(option == 'top')setCssProps("border-top-style");
    // else if(option == 'right')setCssProps("border-right-style");
    // else if(option == 'bottom')setCssProps("border-bottom-style");
    // else if(option == 'left')setCssProps("border-left-style");
    // else if(option == 'all')setCssProps("border-style");

  };

  useEffect(()=>{
    handleCssProps();
  },[option])

  return (
    <section className={`flex flex-col gap-3`}>
      <FitTitle className="capitalize">border style</FitTitle>
      <ScrollableToolbar className="flex justify-between gap-1 p-2 bg-slate-800 rounded-lg" space="3">
        <SelectedBorder
          borderName={"border-t-2"}
          borderDir="top"
          option={option}
          setOption={setOption}
        />
        <SelectedBorder
          borderName={"border-r-2"}
          borderDir="right"
          option={option}
          setOption={setOption}
        />
        <SelectedBorder
          borderName={"border-b-2"}
          borderDir="bottom"
          option={option}
          setOption={setOption}
        />
        <SelectedBorder
          borderName={"border-l-2"}
          borderDir="left"
          option={option}
          setOption={setOption}
        />
        <SelectedBorder
          borderName={"border-2"}
          borderDir="all"
          option={option}
          setOption={setOption}
        />
      </ScrollableToolbar>
      <SelectStyle cssProp={cssProps} keywords={borderStyles} debs={[cssProps]} placeholder="border style"/>
    </section>
  );
};
