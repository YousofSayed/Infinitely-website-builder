import { cssPropForAssetsManagerState } from "@/helpers/atoms";
import { useRemoveCssProp } from "@/hooks/useRemoveCssProp";
import { useSetClassForCurrentEl } from "@/hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "@/hooks/useUpdateInputValue";
import { ChooseFile } from "@/components/Protos/ChooseFile";
import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

export const BackgroundImage = () => {
  const editor = useEditorMaybe();
  const setCssPropForAm = useSetRecoilState(cssPropForAssetsManagerState);
  const setClass = useSetClassForCurrentEl();
  const [bgImage, setBgImage] = useState("");
  const removeProp = useRemoveCssProp();

  useUpdateInputValue({
    cssProp: "background-image",
    onEffect(cssProp, value) {
      // console.log("effecte for bg image", value);

      setBgImage(
        typeof value == "string" ? value.replace(/url\(|\)|\'|\"/gi, "") : ""
      );
    },
  });

  useEffect(() => {
    if (!bgImage) {
      // console.log("removing : ", bgImage);

      removeProp({ cssProp: "background-image" });
    }
    // console.log(editor.getCss());
  }, [bgImage]);

  return (
    <section className="bg-surface-tertiary rounded-lg flex flex-col gap-2 p-1">
      <ChooseFile
        mediaType="image"
        placeholder="Choose image"
        value={bgImage}
        isCssProp
        callback={(asset, url) => {
          setBgImage(url);
          setClass({
            cssProp: "background-image",
            value: `url("${url}")`,
          });
        }}
      />
    </section>
  );
};
