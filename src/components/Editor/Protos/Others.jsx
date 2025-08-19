import React, { memo } from "react";
import { Property } from "./Property";
import { SelectStyle } from "./SelectStyle";
import { cursorValues, touchActionValues } from "../../../constants/cssProps";

export const Others = memo(() => {
  return (
    <section className=" flex flex-col gap-2 w-full p-1 bg-slate-900 rounded-lg">
      <Property label="user-select" cssProp="user-select" />
      <Property label="transition" cssProp="transition" />
      <Property label="tab-size" cssProp="tab-size" />
      <Property label="opacity" cssProp="opacity" />
      <SelectStyle
        label="empty-cells"
        cssProp="empty-cells"
        keywords={["show", "hide"]}
      />
      <SelectStyle
        label="touch-action"
        cssProp="touch-action"
        keywords={touchActionValues}
      />

      <SelectStyle label="cursor" cssProp="cursor" keywords={cursorValues}/>
    </section>
  );
});
