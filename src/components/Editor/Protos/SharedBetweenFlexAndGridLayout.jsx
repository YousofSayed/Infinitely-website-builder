import React from "react";
import { P } from "../../Protos/P";
import { MultiChoice } from "./MultiChoice";
import {
  alignContentValues,
  alignItemsValues,
  alignSelfValues,
  justifyContentValues,
  justifyItemsValues,
} from "../../../constants/cssProps";
import { getIconForMultiChoice } from "../../../helpers/functions";
import { Select } from "./Select";
import { SelectStyle } from "./SelectStyle";
import { Icons } from "../../Icons/Icons";

export const SharedBetweenFlexAndGridLayout = () => {
  return (
    <section className="flex flex-col gap-3">
    
      <section className="flex flex-col gap-2">
        <P>Align items: </P>
        <MultiChoice
          cssProp="align-items"
          choices={[
            {choice:'start' , Icon:Icons.alignSelfStart},
            {choice:'center' , Icon:Icons.alignSelfCenter},
            {choice:'end' , Icon:Icons.alignSelfEnd},
            {choice:'stretch' , Icon:Icons.alignStrech},
            {choice:'baseline' , Icon:Icons.alignBaseline},
          ]}
        />
      </section>

      <section className="flex flex-col gap-2">
        <P>Justify content: </P>
        <MultiChoice
          cssProp="justify-content"
          choices={[
            {choice:'start' , Icon:Icons.justifyStart},
            {choice:'center' , Icon:Icons.justifyCenter},
            {choice:'end' , Icon:Icons.justifyEnd},
            {choice:'space-between' , Icon:Icons.justifyBetween},
            {choice:'space-evenly' , Icon:Icons.justifyEvenly},
          ]}
        />
      </section>

      <section className="flex flex-col gap-2">
        <P>Algin self: </P>
        <MultiChoice
          cssProp="align-self"
          choices={[
            {choice:'start' , Icon:Icons.alignSelfStart},
            {choice:'center' , Icon:Icons.alignSelfEnd},
            {choice:'end' , Icon:Icons.alignSelfCenter},
            {choice:'stretch' , Icon:Icons.alignSelfStretch},
            {choice:'space-evenly' , Icon:Icons.justifyEvenly},
          ]}
        />
      </section>
     
      {/* <SelectStyle
        splitHyphen={false}
        label="align items"
        cssProp="align-items"
        keywords={alignItemsValues}
      /> */}
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
