import React, { useState } from "react";
import { SharedBetweenFlexAndGridLayout } from "./SharedBetweenFlexAndGridLayout";
import { alignSelfValues } from "../../../constants/cssProps";
import { getIconForMultiChoice } from "../../../helpers/functions";
import { MultiChoice } from "./MultiChoice";
import { P } from "../../Protos/P";
import { Select } from "./Select";
import { Property } from "./Property";
import { SelectStyle } from "./SelectStyle";
import { Icons } from "../../Icons/Icons";
import { FitTitle } from "./FitTitle";

export const FlexLayout = () => {
  const [dir, setDir] = useState("");

  return (
    <section className="flex flex-col gap-2">
      <section className="flex flex-col gap-2">
        <FitTitle>flex direction </FitTitle>
        <MultiChoice
          choices={[
            { choice: "column", Icon: Icons.columnDir },
            { choice: "row", Icon: Icons.rowDir },
            {
              choice: `${
                dir.includes("column") ? "column-reverse" : "row-reverse"
              }`,
              Icon: Icons.reverseDir,
            },
          ]}
          setChoice={setDir}
          cssProp="flex-direction"
        />
      </section>

      <SharedBetweenFlexAndGridLayout isFlex={dir.includes('column')}/>

      <SelectStyle
        label="flex wrap"
        splitHyphen={false}
        cssProp="flex-wrap"
        keywords={["wrap", "nowrap", "wrap-reverse"]}
      />
      <Property label="column gap" cssProp="column-gap" />
      <Property label="row gap" cssProp="row-gap" />
      {/* <Property label="flex grow" cssProp="flex-grow" special={true} />
      <Property label="flex shrink" cssProp="flex-shrink" special={true} />
      <SelectStyle
        label="flex basis"
        cssProp="flex-basis"
        keywords={["auto", "content"]}
        splitHyphen={false}
      />
      <Property label="order" cssProp="order" special={true} /> */}

      {/* <Details label={"more options"}> */}
      {/* <section className="flex flex-col gap-3"> */}
      {/* <Select
              label="align self"
              cssProp="align-self"
              keywords={alignSelfValues}
            />
            <Select
              label="align content"
              cssProp="align-content"
              keywords={alignContentValues}
            />
            <Select
              label="align items"
              cssProp="align-items"
              keywords={alignItemsValues}
            />
  
            <Select
              label="justify self"
              cssProp="justify-self"
              keywords={justifySelfValues}
            />
            <Select
              label="justify content"
              cssProp="justify-content"
              keywords={justifyContentValues}
            />
            <Select
              label="justify items"
              cssProp="justify-items"
              keywords={justifyItemsValues}
            /> */}
    </section>
  );
};
