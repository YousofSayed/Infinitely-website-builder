import React from "react";
import { Select } from "./Select";
import { positionValues } from "../../../constants/cssProps";
import { Property } from "./Property";
import { DirectionsModel } from "./DirectionsModel";
import { SelectStyle } from "./SelectStyle";
import { MiniTitle } from "./MiniTitle";

export const Positioning = () => {
  return (
    <section className="flex flex-col gap-3 p-2 rounded-lg bg-slate-900">
      <MiniTitle>Positioning</MiniTitle>

      <SelectStyle
        label="Position"
        keywords={positionValues}
        cssProp="position"
      />

      <DirectionsModel tProp="top" rProp="right" bProp="bottom" lProp="left" />
      <Property label="z-index" cssProp="z-index" special={true} />
    </section>
  );
};
