import {
  backgroundAttachmentValues,
  backgroundBlendModeValues,
  backgroundClipValues,
  backgroundRepeatValues,
  backgroundSize,
} from "@/constants/cssProps";
import { cssPropForAssetsManagerState } from "@/helpers/atoms";
import { useRemoveCssProp } from "@/hooks/useRemoveCssProp";
import { useSetClassForCurrentEl } from "@/hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "@/hooks/useUpdateInputValue";
import { Icons } from "@/components/Icons/Icons";
import { ChooseFile } from "@/components/Protos/ChooseFile";
import { AssetsManager } from "@/components/Editor/AssetsManager";
import { AddMultiValuestoSingleProp } from "@/components/Editor/Protos/AddMultiValuestoSingleProp";
import { BackgroundImage } from "@/components/Editor/Protos/BackgroundImage";
import { Color } from "@/components/Editor/Protos/Color";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Gradient } from "@/components/Editor/Protos/Gradient";
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Property } from "@/components/Editor/Protos/Property";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { Textarea } from "@/components/Editor/Protos/Textarea";
import { useEditorMaybe } from "@grapesjs/react";
import React, { memo, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

export const Background = memo(() => {


  // useEffect(() => {
  //   if(!editor) return;
  //   const callback = () => {
  //     const bgImgUrl =
  //       editor?.getSelected()?.getStyle()["background-image"] || "";
  //     if (!bgImgUrl) return;
  //     setBgImage(bgImgUrl);
  //   };

  //   editor.on("update", callback);

  //   return () => {
  //     editor.off("update", callback);
  //   };
  // }, [editor]);

  return (
    <section className=" bg-surface-secondary rounded-lg flex flex-col gap-3 p-1">
      <MiniTitle>Color</MiniTitle>
      <Color cssProp="background-color" />

      <MiniTitle>Image</MiniTitle>
      <BackgroundImage/>

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
