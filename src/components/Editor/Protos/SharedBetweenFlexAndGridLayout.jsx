import {
  alignContentValues,
  alignItemsValues,
  alignSelfValues,
  justifyContentValues,
  justifyItemsValues,
} from "@/constants/cssProps";
import { getIconForMultiChoice } from "@/helpers/functions";
import { Icons } from "@/components/Icons/Icons";
import { P } from "@/components/Protos/P";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { MultiChoice } from "@/components/Editor/Protos/MultiChoice";
import { Select } from "@/components/Editor/Protos/Select";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import React from "react";

export const SharedBetweenFlexAndGridLayout = ({
  isFlex = false,
  dir = "",
}) => {
  return (
    <section className="flex flex-col gap-3">
      <section className="flex flex-col gap-2">
        <FitTitle>Align items </FitTitle>
        <MultiChoice
          cssProp="align-items"
          rotate={isFlex}
          dir={dir}
          choices={[
            { choice: "start", Icon: Icons.alignSelfStart },
            { choice: "center", Icon: Icons.alignSelfCenter },
            { choice: "end", Icon: Icons.alignSelfEnd },
            { choice: "stretch", Icon: Icons.alignStrech },
            { choice: "baseline", Icon: Icons.alignBaseline },
          ]}
        />
      </section>

      <section className="flex flex-col gap-2">
        <FitTitle>Justify content </FitTitle>
        <MultiChoice
          cssProp="justify-content"
          rotate={isFlex}
          dir={dir}
          choices={[
            { choice: "start", Icon: Icons.justifyStart },
            { choice: "center", Icon: Icons.justifyCenter },
            { choice: "end", Icon: Icons.justifyEnd },
            { choice: "space-between", Icon: Icons.justifyBetween },
            { choice: "space-evenly", Icon: Icons.justifyEvenly },
          ]}
        />
      </section>

      {/* <section className="flex flex-col gap-2">
        <FitTitle>Algin self </FitTitle>
        <MultiChoice
          cssProp="align-self"
          rotate={isFlex}
          dir={dir}
          choices={[
            { choice: "start", Icon: Icons.alignSelfStart },
            { choice: "end", Icon: Icons.alignSelfEnd },
            { choice: "center", Icon: Icons.alignSelfCenter },
            { choice: "stretch", Icon: Icons.alignSelfStretch },
            { choice: "space-evenly", Icon: Icons.justifyEvenly },
          ]}
        />
      </section> */}



      <SelectStyle
        splitHyphen={false}
        label="align self"
        cssProp="align-self"
        keywords={alignSelfValues}
      />
      <SelectStyle
        splitHyphen={false}
        label="justify items"
        cssProp="justify-items"
        keywords={justifyItemsValues}
      />
      <SelectStyle
        splitHyphen={false}
        label="align content"
        cssProp="align-content"
        keywords={alignContentValues}
      />
      {/* <SelectStyle
        splitHyphen={false}
        label="justify content"
        cssProp="justify-content"
        keywords={justifyContentValues}
      /> */}
    </section>
  );
};
