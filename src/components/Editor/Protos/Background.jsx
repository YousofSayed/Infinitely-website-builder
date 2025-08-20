import React, { memo, useEffect, useState } from "react";
import { Color } from "./Color";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { Input } from "./Input";
import { Property } from "./Property";
import { useEditorMaybe } from "@grapesjs/react";
import { useSetRecoilState } from "recoil";
import { cssPropForAssetsManagerState } from "../../../helpers/atoms";
import { AssetsManager } from "../AssetsManager";
import { SelectStyle } from "./SelectStyle";
import {
  backgroundAttachmentValues,
  backgroundBlendModeValues,
  backgroundClipValues,
  backgroundRepeatValues,
  backgroundSize,
} from "../../../constants/cssProps";
import { AddMultiValuestoSingleProp } from "./AddMultiValuestoSingleProp";
import { Gradient } from "./Gradient";
import { MiniTitle } from "./MiniTitle";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { Textarea } from "./Textarea";
import { useRemoveCssProp } from "../../../hooks/useRemoveCssProp";
import { ChooseFile } from "../../Protos/ChooseFile";
import { FitTitle } from "./FitTitle";

export const Background = memo(() => {
  const editor = useEditorMaybe();
  const setCssPropForAm = useSetRecoilState(cssPropForAssetsManagerState);
  const setClass = useSetClassForCurrentEl();
  const [bgImage, setBgImage] = useState("");
  const removeProp = useRemoveCssProp();

  useUpdateInputValue({
    cssProp: "background-image",
    onEffect(cssProp, value) {
      // console.log("effecte for bg image", value);

      setBgImage(typeof value == 'string' ? value.replace(/url\(|\)|\'|\"/gi, "") : '');
    },
  });

  useEffect(() => {
    if (!bgImage) {
      // console.log("removing : ", bgImage);

      removeProp({ cssProp: "background-image" });
    }
    // console.log(editor.getCss());
  }, [bgImage]);

  useEffect(() => {
    if(!editor) return;
    const callback = () => {
      const bgImgUrl =
        editor?.getSelected()?.getStyle()["background-image"] || "";
      if (!bgImgUrl) return;
      setBgImage(bgImgUrl);
    };

    editor.on("update", callback);

    return () => {
      editor.off("update", callback);
    };
  }, [editor]);

  return (
    <section className=" bg-slate-900 rounded-lg flex flex-col gap-3 p-1">
      <MiniTitle>Color</MiniTitle>
      <Color cssProp="background-color" />

      <MiniTitle>Image</MiniTitle>
     

       <section className="bg-slate-800 rounded-lg flex flex-col gap-2 p-1">
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
      <Property cssProp="background-position-x" label="position-x" />
      <Property cssProp="background-position-y" label="position-y" />
      <SelectStyle
        cssProp="background-repeat"
        keywords={backgroundRepeatValues}
        placeholder="Repeat"
        label="Repeat"
      />
      <SelectStyle
        cssProp="background-size"
        keywords={backgroundSize}
        placeholder="Size"
        label="Size"
      />

      <AddMultiValuestoSingleProp
        label={<FitTitle>Attachment</FitTitle>}
        placeholder="Attachment"
        cssProp="background-attachment"
        keywords={backgroundAttachmentValues}
      />

      <MiniTitle>Gradient</MiniTitle>
      <Gradient />

      <MiniTitle>Other</MiniTitle>
      <SelectStyle
        cssProp="background-clip"
        placeholder="Clip"
        keywords={backgroundClipValues}
        label="Clip"
      />
      <SelectStyle
        cssProp="background-origin"
        placeholder="Origin"
        keywords={backgroundClipValues.slice(0, -1)}
        label="Origin"
      />
      <SelectStyle
        cssProp="background-blend-mode"
        placeholder="Blend-mode"
        keywords={backgroundBlendModeValues}
        label="Blend Mode"
      />
    </section>
  );
});
