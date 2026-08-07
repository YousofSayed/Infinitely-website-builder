import { positionValues } from "@/constants/cssProps";
import { DirectionsModel } from "@/components/Editor/Protos/DirectionsModel";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Property } from "@/components/Editor/Protos/Property";
import { Select } from "@/components/Editor/Protos/Select";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import React from "react";

export const Positioning = () => {
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-surface-secondary">
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
