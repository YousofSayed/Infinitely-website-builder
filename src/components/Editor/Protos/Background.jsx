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

export const Background = memo(() => {
  const editor = useEditorMaybe();
  const setCssPropForAm = useSetRecoilState(cssPropForAssetsManagerState);
  const setClass = useSetClassForCurrentEl();
  const [bgImage, setBgImage] = useState("");
  const removeProp = useRemoveCssProp();

  useUpdateInputValue({
    cssProp: "background-image",
    onEffect(cssProp, value) {
      console.log("effecte for bg image", value);

      setBgImage(value.replace(/url\(|\)|\'|\"/gi, ""));
    },
  });

  useEffect(() => {
    if (!bgImage) {
      console.log("removing : ", bgImage);

      removeProp({ cssProp: "background-image" });
    }
    console.log(editor.getCss());
  }, [bgImage]);

  useEffect(() => {
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
  }, []);

  return (
    <section className="mt-3 flex flex-col gap-3 p-2">
      <MiniTitle>Color</MiniTitle>
      <Color cssProp="background-color" />

      <MiniTitle>Image</MiniTitle>
      <section className="flex gap-2 relative h-[60px] bg-slate-800 p-2 rounded-lg justify-between">
        <Textarea
          value={bgImage}
          cssProp="background-image"
          className="w-full bg-slate-900"
          placeholder="source"
          inputClassName="w-full"
          onInput={(ev) => {
            setBgImage(ev.target.value);
            setClass({
              cssProp: "background-image",
              value: `url('${ev.target.value}')`,
            });
          }}
        />
        <SmallButton
          className="bg-slate-900 self-end h-full"
          onClick={() => {
            setBgImage("");
          }}
        >
          {Icons.delete()}
        </SmallButton>
        <SmallButton
          className="bg-slate-900 self-end h-full"
          onClick={(ev) => {
            setCssPropForAm("background-image");
            // editor.AssetManager.open();
            editor.Commands.run("open:custom:modal", {
              title: "Select File",
              JSXModal: <AssetsManager editor={editor} />,
            });
          }}
        >
          {Icons.gallery("white")}
        </SmallButton>
      </section>
      <Property cssProp="background-position-x" label="position-x" />
      <Property cssProp="background-position-y" label="position-y" />
      <SelectStyle
        cssProp="background-repeat"
        keywords={backgroundRepeatValues}
        placeholder="Repeat"
      />
      <SelectStyle
        cssProp="background-size"
        keywords={backgroundSize}
        placeholder="Size"
      />

      <AddMultiValuestoSingleProp
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
      />
      <SelectStyle
        cssProp="background-origin"
        placeholder="Origin"
        keywords={backgroundClipValues.slice(0, -1)}
      />
      <SelectStyle
        cssProp="background-blend-mode"
        placeholder="Blend-mode"
        keywords={backgroundBlendModeValues}
      />
    </section>
  );
});
