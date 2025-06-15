import React from "react";
import { SharedBetweenFlexAndGridLayout } from "./SharedBetweenFlexAndGridLayout";
import {
  alignContentValues,
  alignItemsValues,
  justifyContentValues,
  justifyItemsValues,
} from "../../../constants/cssProps";
import { P } from "../../Protos/P";
import { MultiChoice } from "./MultiChoice";
import { getIconForMultiChoice } from "../../../helpers/functions";
import { Icons } from "../../Icons/Icons";
import { Select } from "./Select";
import { Property } from "./Property";
// Icons.
export const GridLayout = () => {
  // console.log(CSS.supports('width' , '2'));
  return (
    <section className="flex flex-col gap-3">
      <Property
        label="Grid template columns"
        cssProp="grid-template-columns"
        // wrap={true}
      />
      <Property
        label="Grid template rows"
        cssProp="grid-template-rows"
        // wrap={true}
      />
      <Property
        label="Grid auto columns"
        cssProp="grid-auto-columns"
        // wrap={true}
      />

      <Property label="Grid auto rows" cssProp="grid-auto-rows" />
      <Property label="column gap" cssProp="column-gap"  />
      <Property label="row gap" cssProp="row-gap"  />

        <SharedBetweenFlexAndGridLayout/>
    </section>
  );
};
