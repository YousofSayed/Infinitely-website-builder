import React from "react";
import { MiniTitle } from "./MiniTitle";
import { DirectionsModel } from "./DirectionsModel";

export const Paddaing = () => {
  return (
    <section className="p-2 rounded-lg bg-slate-900 flex flex-col gap-2">
      <MiniTitle>Padding</MiniTitle>
      <DirectionsModel
        tProp="padding-top"
        rProp="padding-right"
        bProp="padding-bottom"
        lProp="padding-left"
        defultoption="all"
      />
    </section>
  );
};
