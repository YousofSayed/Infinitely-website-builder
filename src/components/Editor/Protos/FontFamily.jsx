import React, { useState } from "react";
import { SelectStyle } from "./SelectStyle";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../../helpers/atoms";
import { getProjectData } from "../../../helpers/functions";
import { useLiveQuery } from "dexie-react-hooks";
import { cssFonts } from "../../../constants/cssProps";

export const FontFamily = () => {
  const [customFonts, setCustomFonts] = useState([]);
  const currentEl = useRecoilValue(currentElState);

  useLiveQuery(async () => {
    const projectData = await await getProjectData();
    const fontKeys = Object.keys(projectData.fonts);
    setCustomFonts(fontKeys);
  });
  return (
    <SelectStyle
      label="Font"
      cssProp="font-family"
      currentEl={currentEl}
      keywords={cssFonts
        .concat(customFonts)
        .map((font) => font.split(/\.\w+/gi).join("").trim())}
    />
  );
};
