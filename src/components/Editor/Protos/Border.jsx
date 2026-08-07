import { P } from "@/components/Protos/P";
import { BorderColor } from "@/components/Editor/Protos/BorderColor";
import { BorderRadius } from "@/components/Editor/Protos/BorderRadius";
import { BorderStyle } from "@/components/Editor/Protos/BorderStyle";
import { Color } from "@/components/Editor/Protos/Color";
import { DirectionsModel } from "@/components/Editor/Protos/DirectionsModel";
import { Property } from "@/components/Editor/Protos/Property";
import React, { memo } from "react";

export const Border = memo(() => {
  return (
    <section className="flex flex-col gap-3 p-1 rounded-lg bg-surface-secondary">
      <section className=" flex flex-col gap-2 rounded-lg bg-surface-secondary">
        <DirectionsModel
          tProp="border-top-width"
          rProp="border-right-width"
          bProp="border-bottom-width"
          lProp="border-left-width"
        />
        {/* <Property label="border left color" cssProp="border-left-color" /> */}
      </section>
      <section className="  flex flex-col gap-2 rounded-lg bg-surface-secondary">
        <BorderColor />
      </section>

      <section className="  flex flex-col gap-2 rounded-lg bg-surface-secondary">
        <BorderStyle />
      </section>

      <section className="  flex flex-col gap-2  rounded-lg bg-surface-secondary">
        <BorderRadius />
      </section>
    </section>
  );
});
