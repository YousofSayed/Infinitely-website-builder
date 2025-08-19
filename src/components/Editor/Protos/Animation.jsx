import React, { memo, useEffect, useState } from "react";
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
import { useLiveQuery } from "dexie-react-hooks";
import { getProjectData } from "../../../helpers/functions";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot } from "../../../helpers/bridge";

export const Animation = memo(() => {
  const editor = useEditorMaybe();
  const [animationNames, setAnimationNames] = useState();

  useEffect(() => {
    if (!editor) return;
    setAnimationNames([
      ...new Set(
        editor.Parser.parseCss(editor.getCss())
          .filter((rule) => rule.atRuleType == "keyframes")
          .map((rule) => rule.mediaText)
      ),
    ]);

    (async () => {
      const projectData = await getProjectData();
      const cssLibs = projectData.cssLibs;
      const keyframes =
        editor.getCss() +
        `\n` +
        (await (
          await Promise.all(cssLibs.map(async (lib) => await ((await opfs.getFile(defineRoot(lib.path)))?.text?.()) || ''))
        ).join("\n"));

      setAnimationNames([
        ...new Set(
          editor.Parser.parseCss(keyframes)
            .filter((rule) => rule.atRuleType == "keyframes")
            .map((rule) => rule.mediaText)
        ),
      ]);
    })();
  }, [editor]);

  // useLiveQuery(async () => {

  // },[editor]);
  // useEf
  return (
    <section className="mt-3 flex flex-col gap-2 p-1 bg-slate-900 rounded-lg">
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
