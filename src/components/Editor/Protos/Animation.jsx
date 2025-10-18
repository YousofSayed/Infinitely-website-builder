import React, { memo,} from "react";
import { Property } from "./Property";
import { SelectStyle } from "./SelectStyle";
import {
  animationCompositions,
  animationDirections,
  animationFillModes,
  animationIterationCounts,
  animationPlayStates,
  animationTimingFunctions,
  positionValues,
} from "../../../constants/cssProps";
import { AddMultiValuestoSingleProp } from "./AddMultiValuestoSingleProp";

import { AnimationName } from "./AnimationName";

export const Animation = (() => {

  return (
    <section className="mt-3 flex flex-col gap-2 p-1 bg-slate-900 rounded-lg">
      <AnimationName/>
      <Property
        cssProp="animation-duration"
        label="Duration"
        allowText={true}
      />
      <Property cssProp="animation-delay" label="Delay" allowText={true} />
      <SelectStyle
        cssProp="animation-iteration-count"
        keywords={animationIterationCounts}
        label="Counts"
        allowText={true}
      />
      <SelectStyle
        cssProp="animation-direction"
        keywords={animationDirections}
        label="Direction"
        allowText={true}
      />
      <SelectStyle
        cssProp="animation-fill-mode"
        keywords={animationFillModes}
        label="Fill"
        allowText={true}
      />
      <SelectStyle
        cssProp="animation-timing-function"
        keywords={animationTimingFunctions}
        label="Timing"
        allowText={true}
      />
      <SelectStyle
        cssProp="animation-play-state"
        keywords={animationPlayStates}
        label="State"
        allowText={true}
      />
      {/* <AddMultiValuestoSingleProp
        keywords={positionValues}
        cssProp="transform-origin"
        placeholder="Origin"
      /> */}
      <AddMultiValuestoSingleProp
        //   label="Composition"
        placeholder="Composition"
        cssProp="animation-composition"
        keywords={animationCompositions}
      />
    </section>
  );
});
