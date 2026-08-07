import { DirectionsModel } from "@/components/Editor/Protos/DirectionsModel";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import React from "react";

export const Margin = () => {
  return (
    <section className=" bg-surface-secondary flex flex-col gap-2 rounded-lg">
      <MiniTitle>Margin</MiniTitle>
      <DirectionsModel
        tProp="margin-top"
        rProp="margin-right"
        bProp="margin-bottom"
        lProp="margin-left"
      />
    </section>
  );
};
