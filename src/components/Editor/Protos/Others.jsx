import { cursorValues, isolationValues, mixBlendModeValues, touchActionValues } from "@/constants/cssProps";
import { Property } from "@/components/Editor/Protos/Property";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import React, { memo } from "react";

export const Others = memo(() => {
  return (
    <section className=" flex flex-col gap-2 w-full p-1 bg-surface-secondary rounded-lg">
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
      <SelectStyle
        label="mix-blend-mode"
        cssProp="mix-blend-mode"
        keywords={mixBlendModeValues}
      />
      <SelectStyle
        label="isolation"
        cssProp="isolation"
        keywords={isolationValues}
      />

      <SelectStyle label="cursor" cssProp="cursor" keywords={cursorValues}/>
    </section>
  );
});
