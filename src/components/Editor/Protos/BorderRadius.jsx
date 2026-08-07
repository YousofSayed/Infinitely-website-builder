import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Property } from "@/components/Editor/Protos/Property";
import React from "react";

export const BorderRadius = () => {
  return (
    <section className="flex flex-col gap-3 justify-between ">
      <FitTitle className="capitalize">border raduis</FitTitle>
      <Property label="all" cssProp="border-radius"/>
      <Property label="top left" cssProp="border-top-left-radius"/>
      <Property label="top right" cssProp="border-top-right-radius"/>
      <Property label="bottom left" cssProp="border-bottom-left-radius"/>
      <Property label="bottom right" cssProp="border-bottom-right-radius"/>
    </section>
  );
};
