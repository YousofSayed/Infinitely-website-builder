import React, { memo } from "react";
import { DirectionsModel } from "./DirectionsModel";
import { Property } from "./Property";
import { P } from "../../Protos/P";
import { Color } from "./Color";
import { BorderColor } from "./BorderColor";
import { BorderStyle } from "./BorderStyle";
import { BorderRadius } from "./BorderRadius";

export const Border = memo(() => {
  return (
    <section className="flex flex-col gap-3 p-1 rounded-lg bg-slate-900">
      <section className=" flex flex-col gap-2 rounded-lg bg-slate-900">
        <DirectionsModel
          tProp="border-top-width"
          rProp="border-right-width"
          bProp="border-bottom-width"
          lProp="border-left-width"
        />
        {/* <Property label="border left color" cssProp="border-left-color" /> */}
      </section>
      <section className="  flex flex-col gap-2 rounded-lg bg-slate-900">
        <BorderColor />
      </section>

      <section className="  flex flex-col gap-2 rounded-lg bg-slate-900">
        <BorderStyle />
      </section>

      <section className="  flex flex-col gap-2  rounded-lg bg-slate-900">
        <BorderRadius />
      </section>
    </section>
  );
});
