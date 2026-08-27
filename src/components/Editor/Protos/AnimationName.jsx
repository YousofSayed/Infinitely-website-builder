import { wp_get_media_files_by_slugs } from "@/Apps/wordpress/functions";
import { defineRoot } from "@/helpers/bridge";
import {
  doInNormalAsync,
  doInWordpressAsync,
  getProjectData,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import { useEditorMaybe } from "@grapesjs/react";
import { isPlainObject } from "lodash";
import React, { useEffect, useState } from "react";

export const AnimationName = () => {
  const editor = useEditorMaybe();
  const [animationNames, setAnimationNames] = useState(["__inf_loading__"]);

  useEffect(() => {
    if (!editor) return;

    const fetchKeyframes = async () => {
      await doInNormalAsync(async () => {
        const { cssLibs = [], globalCss } = await getProjectData();

        const globalKeyframes =
          (await (
            await (
              await opfs.getFile(defineRoot(`/global/global.css`))
            ).getOriginFile()
          ).text()) || "";

        const libsContent = await Promise.all(
          cssLibs.map(
            async (lib) =>
              (await opfs.getFile(defineRoot(lib.path)))?.text() || "",
          ),
        );

        const keyframes = [editor.getCss(), ...libsContent , globalKeyframes].join("\n");

        const names = editor.Parser.parseCss(keyframes)
          .filter((rule) => rule.atRuleType == "keyframes")
          .map((rule) => rule.mediaText);

        setAnimationNames((prev) => [
          ...new Set([
            ...prev.filter((n) => n !== "__inf_loading__"),
            ...names,
          ]),
        ]);
      });

      await doInWordpressAsync(async () => {
        const projectData = await getProjectData();
        const slugs = projectData.cssLibs
          .map((lib) => lib.slug)
          .concat(projectData.globalCss.slug);

        const wp_get_files_res = await wp_get_media_files_by_slugs({
          projectId: projectData.id,
          slugs,
        });

        if (!isPlainObject(wp_get_files_res)) {
          throw new Error("Failed to fetch files from wordpress");
        }
        const content = Object.values(wp_get_files_res)
          .filter((res) => !res.error)
          .map((res) => res.content);
        const keyframes = [editor.getCss(), ...content].join("\n");

        const names = editor.Parser.parseCss(keyframes)
          .filter((rule) => rule.atRuleType == "keyframes")
          .map((rule) => rule.mediaText);

        setAnimationNames((prev) => [
          ...new Set([
            ...prev.filter((n) => n !== "__inf_loading__"),
            ...names,
          ]),
        ]);
      });
    };

    fetchKeyframes();
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
