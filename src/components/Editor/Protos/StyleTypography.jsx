import React, { memo, useState } from "react";
import { Property } from "./Property";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../../helpers/atoms";
import { Select } from "./Select";
import {
  cssFonts,
  fontWeights,
  textDecorationLineValues,
  textDecorationStyleValues,
  textOverflowValues,
  whiteSpaceValues,
  wordBreakValues,
  writingModeValues,
} from "../../../constants/cssProps";
import { Color } from "./Color";
import { MultiChoice } from "./MultiChoice";
import { Icons } from "../../Icons/Icons";
import {
  getIconForMultiChoice,
  getProjectData,
} from "../../../helpers/functions";
import { SelectStyle } from "./SelectStyle";
import { AddMultiValuestoSingleProp } from "./AddMultiValuestoSingleProp";
import { useLiveQuery } from "dexie-react-hooks";

export const StyleTypography = memo(() => {
  const [customFonts, setCustomFonts] = useState([]);
  const currentEl = useRecoilValue(currentElState);

  useLiveQuery(async () => {
    const projectData = await await getProjectData();
    const fontKeys = Object.keys(projectData.fonts);
    setCustomFonts(fontKeys);
  });

  return (
    <section className="mt-3  flex flex-col gap-2 p-2 rounded-lg bg-slate-900">
      <SelectStyle
        label="Font"
        cssProp="font-family"
        currentEl={currentEl}
        keywords={cssFonts
          .concat(customFonts)
          .map((font) => font.split(/\.\w+/gi).join("").trim())
        }
      />
      <SelectStyle
        label="weight"
        cssProp="font-weight"
        currentEl={currentEl}
        keywords={fontWeights}
        splitHyphen={true}
      />
      <Color cssProp={"color"} />
      <Property label="Size" cssProp="font-size" />
      <Property label="spacing" cssProp="letter-spacing" />
      <Property label="line height" cssProp="line-height" />

      <MultiChoice
        cssProp="text-transform"
        choices={[
          { choice: "none", Icon: Icons.textNone },
          { choice: "capitalize", Icon: Icons.textCapitalize },
          { choice: "lowercase", Icon: Icons.textLowercase },
          { choice: "uppercase", Icon: Icons.textUppercase },
        ]}
      />

      <Property label="indent" cssProp="text-indent" />

      <MultiChoice
        cssProp="text-align"
        choices={[
          { choice: "start", Icon: Icons.textStart },
          { choice: "center", Icon: Icons.textCenter },
          { choice: "end", Icon: Icons.textEnd },
          { choice: "justify", Icon: Icons.textJustify },
        ]}
      />

      <SelectStyle
        label="Overflow"
        splitHyphen={false}
        cssProp="text-overflow"
        keywords={textOverflowValues}
      />

      <SelectStyle
        label="breaking"
        cssProp="word-break"
        keywords={wordBreakValues}
      />
      <SelectStyle
        label="decoration line"
        cssProp="text-decoration-line"
        keywords={textDecorationLineValues}
      />
      <SelectStyle
        label="decoration style"
        cssProp="text-decoration-style"
        keywords={textDecorationStyleValues}
      />
      <Property
        label="decoration thickness"
        cssProp="text-decoration-thickness"
      />
      <SelectStyle
        cssProp="writing-mode"
        keywords={writingModeValues}
        label="writing-mode"
      />
      <SelectStyle
        cssProp="word-wrap"
        keywords={["normal", "break-word"]}
        label="word-wrap"
      />
      <SelectStyle
        cssProp="white-space"
        keywords={whiteSpaceValues}
        label="white-space"
      />
    </section>
  );
});
