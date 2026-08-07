import { cssFonts } from "@/constants/cssProps";
import { getProjectData } from "@/helpers/functions";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import React, { useEffect, useMemo, useState } from "react";

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
