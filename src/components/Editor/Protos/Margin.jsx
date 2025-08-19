import React from "react";
import { DirectionsModel } from "./DirectionsModel";
import { MiniTitle } from "./MiniTitle";

export const Margin = () => {
  return (
    <section className=" bg-slate-900 flex flex-col gap-2 rounded-lg">
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
