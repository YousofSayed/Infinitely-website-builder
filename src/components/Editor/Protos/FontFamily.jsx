import React, { useEffect, useMemo, useState } from "react";
import { SelectStyle } from "./SelectStyle";
import { getProjectData } from "../../../helpers/functions";
import { cssFonts } from "../../../constants/cssProps";

export const FontFamily = () => {
  const [customFonts, setCustomFonts] = useState([]);

  useEffect(() => {
    (async () => {
      const projectData = await getProjectData();
      const fontKeys = Object.keys(projectData.fonts);
      setCustomFonts(fontKeys);
    })();
  }, []);

  const keywords = useMemo(() => {
    return cssFonts
      .concat(customFonts)
      .map((font) => font.split(/\.\w+/gi).join("").trim());
  }, [customFonts]);

  return (
    <SelectStyle
      label="Font"
      cssProp="font-family"
      keywords={keywords}
    />
  );
};
