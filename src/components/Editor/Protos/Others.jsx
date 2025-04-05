import React, { memo } from "react";
import { Property } from "./Property";
import { SelectStyle } from "./SelectStyle";
import { touchActionValues } from "../../../constants/cssProps";

export const Others = memo(() => {
  return (
    <section className="mt-3 flex flex-col gap-2 w-full p-2">
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
    </section>
  );
});
