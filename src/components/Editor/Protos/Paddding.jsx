import { DirectionsModel } from "@/components/Editor/Protos/DirectionsModel";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import React from "react";

export const Paddaing = () => {
  return (
    <section className="rounded-lg bg-surface-secondary flex flex-col gap-2">
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
