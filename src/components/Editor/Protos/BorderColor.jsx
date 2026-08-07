import { useUpdateInputValue } from "@/hooks/useUpdateInputValue";
import { P } from "@/components/Protos/P";
import { ScrollableToolbar } from "@/components/Protos/ScrollableToolbar";
import { Color } from "@/components/Editor/Protos/Color";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { SelectedBorder } from "@/components/Editor/Protos/SelectedBorder";
import React, { useEffect, useState } from "react";

export const BorderColor = () => {
  const [option, setOption] = useState("all");
  const [cssProps, setCssProps] = useState("");
  const [colorState, setColorState] = useState("");
  const handleCssProps = () => {
    switch (option) {
      case "top":
        setCssProps("border-top-color");
        break;
      case "right":
        setCssProps("border-right-color");
        break;
      case "bottom":
        setCssProps("border-bottom-color");
        break;
      case "left":
        setCssProps("border-left-color");
        break;
      case "all":
        setCssProps("border-color");
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    handleCssProps();
  }, [option]);

  useUpdateInputValue({
    cssProp: cssProps,
    // debs: [],

    // onEffect(cssProp , value){
    //   console.log('options : ' , cssProp , value);

    //   setColorState(value);
    // }
  });

  return (
    <section className="flex flex-col gap-3  justify-between ">
      {/* <P> </P> */}
      <FitTitle className="capitalize">border color</FitTitle>
      <ScrollableToolbar
        className="flex justify-between gap-1 bg-surface-tertiary p-2 rounded-lg"
        space="3"
      >
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
      <div className="flex gap-2">
        <Color cssProp={cssProps} colorState={colorState} debs={[option , cssProps]} />
      </div>
    </section>
  );
};
