import { Property } from "@/components/Editor/Protos/Property";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import React from "react";

export const FlexChildProps = () => {
  return (
    <section className=" flex flex-col gap-2">
      <Property label="flex grow" cssProp="flex-grow" special={true} />
      <Property label="flex shrink" cssProp="flex-shrink" special={true} />
      <SelectStyle
        label="flex basis"
        cssProp="flex-basis"
        keywords={["auto", "content"]}
        splitHyphen={false}
      />
      <Property label="order" cssProp="order" special={true} />
    </section>
  );
};
