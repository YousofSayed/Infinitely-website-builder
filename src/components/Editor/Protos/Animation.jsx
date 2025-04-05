import React, { memo, useState } from "react";
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
import { MultiChoice } from "./MultiChoice";
import { ChoicesForStates } from "./ChoicesForStates";
import { AddMultiValuestoSingleProp } from "./AddMultiValuestoSingleProp";
import { useEditorMaybe } from "@grapesjs/react";

export const Animation = memo(() => {
  const editor = useEditorMaybe();
  const [animationNames, setAnimationNames] = useState([
    ...new Set(
      editor.Parser.parseCss(editor.getCss())
        .filter((rule) => rule.atRuleType == "keyframes")
        .map((rule) => rule.mediaText)
    ),
  ]);
  // useEf
  return (
    <section className="mt-3 flex flex-col gap-2 p-2">
      <SelectStyle
        cssProp="animation-name"
        label="Name"
        keywords={animationNames}
        allowText={true}
      />
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
      <AddMultiValuestoSingleProp
        keywords={positionValues}
        cssProp="transform-origin"
        placeholder="Origin"
      />
      <AddMultiValuestoSingleProp
        //   label="Composition"
        placeholder="Composition"
        cssProp="animation-composition"
        keywords={animationCompositions}
      />
    </section>
  );
});
