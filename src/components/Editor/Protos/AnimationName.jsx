import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useState } from "react";
import { opfs } from "../../../helpers/initOpfs";
import { getProjectData } from "../../../helpers/functions";
import { SelectStyle } from "./SelectStyle";

export const AnimationName = () => {
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
          await Promise.all(
            cssLibs.map(
              async (lib) =>
                (await (await opfs.getFile(defineRoot(lib.path)))?.text?.()) ||
                ""
            )
          )
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

  return (
    <SelectStyle
      cssProp="animation-name"
      label="Name"
      keywords={animationNames}
      allowText={true}
    />
  );
};
