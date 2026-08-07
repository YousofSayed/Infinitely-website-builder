import {
  animationCompositions,
  animationDirections,
  animationFillModes,
  animationIterationCounts,
  animationPlayStates,
  animationTimingFunctions,
  positionValues,
} from "@/constants/cssProps";
import { AddMultiValuestoSingleProp } from "@/components/Editor/Protos/AddMultiValuestoSingleProp";
import { AnimationName } from "@/components/Editor/Protos/AnimationName";
import { Property } from "@/components/Editor/Protos/Property";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import React, { memo,} from "react";

export const Animation = (() => {

  return (
    <section className="mt-3 flex flex-col gap-2 p-1 bg-surface-secondary rounded-lg">
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
