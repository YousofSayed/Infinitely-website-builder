import { wp_insert_post } from "@/apps/wordpress/functions";
import {
  current_page_id,
  current_project_id,
  inf_template_id,
  inf_template_name,
} from "@/constants/shared";
import { _blocksCachedState } from "@/constants/windowKeys";
import { defineRoot } from "@/helpers/bridge";
import { html, uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  doInNormalAsync,
  doInWordpressAsync,
  getComponentRules,
  getProjectSettings,
  gjsComponentsToJSON,
  handleCloneComponent,
  saveProjectByWorker,
  store,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { editorIcons } from "@/components/Icons/editorIcons";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Input } from "@/components/Editor/Protos/Input";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { minify } from "csso";
import html2canvas from "html2canvas-pro";
import { uniqueId } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

export const ReusableCmb = () => {
  const editor = useEditorMaybe();
  const selectedEl = editor.getSelected();
  const [imgSrc, setImgSrc] = useState("");
  const [imgBlob, setImgBlob] = useState(new Blob([""], { type: "image/png" }));
  const [imgReady, setImgReady] = useState(false);
  const [newProps, setNewProps] = useState({
    name: "",
    ctg: "",
  });
  const qc = useQueryClient();

  useEffect(() => {
    //   setCtgs([...getCategoriesId(editor)]);
    getImage();
  }, []);

  const getImage = async () => {
    const canvas = await (
      await html2canvas(editor.getSelected().getEl())
    ).toBlob((blob) => {
      setImgSrc(URL.createObjectURL(blob));
      setImgBlob(blob);
      setImgReady(true);
    }, "image/png");
  };

  const save = async () => {
    const tId = toast.loading(<ToastMsgInfo msg={`Saving template...`} />);
    const { projectSettings } = getProjectSettings();
    editor.Storage.setAutosave(false);
    // sessionStorage.setItem("clone-disabled", "true");
    const sle = await editor.getSelected();
    sle.set({
      draggable: true,
    });

    const isSplitter = sle.get("type") == "splitter";
    let splitterContent = "";
    if (isSplitter) {
      const el = editor.getSelected().getEl();
      const stringAttributs = [...el.attributes]
        .concat({ name: "is-plain", value: "true" })
        .map((attr) => `${attr.name}="${attr.value}"`)
        .join(" ");

      splitterContent = `<${sle.tagName.toLowerCase()} ${stringAttributs}>
       ${el.textContent}
       </${sle.tagName.toLowerCase()}>`;
    }

    const uuid = uniqueId(`${uniqueID()}-`);

    const id = newProps.name + (newProps.ctg || "templates") + sle.getId();
    sle.addAttributes({
      [inf_template_id]: uuid,
      [inf_template_name]: newProps.name,
    });
    const block = {};
    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await db.projects.get(projectId);
    const stringStyle = getComponentRules({
      editor,
      cmp: sle,
      nested: true,
    }).stringRules;
    const contentPath = `editor/templates/${id}/${id}.html`;
    const stylePath = `editor/templates/${id}/${id}.css`;
    const pathes = {
      content: contentPath,
      style: stylePath,
    };

    const afterSave = () => {
      editor.Storage.setAutosave(projectSettings.enable_auto_save);
      window[_blocksCachedState] = false;
      editor.runCommand("close:current:modal");
      toast.done(tId);
      toast.success(<ToastMsgInfo msg={`Template saved successfully👍`} />);
      editor.off("storage:after:store", afterSave);
    };

    editor.clearDirtyCount();

    await doInNormalAsync(async () => {
      store(
        {
          data: {
            // motions:projectDataHandled.motions,
            blocks: {
              ...projectData.blocks,
              [id]: {
                label: newProps.name,
                name: newProps.name,
                category: newProps.ctg || "templates",
                id,
                pathes,
                // content: new Blob([selectedEl.toHTML({ withProps: true })], {
                //   type: "text/html",
                // }),
                // style: minify(stringStyle).css,
                type: "template",
                media:
                  sle.getIcon() || editorIcons.templates({ fill: "white" }),
              },
            },
          },

          files: {
            [defineRoot(contentPath)]: isSplitter
              ? splitterContent
              : sle.toHTML({
                  keepInlineStyle: true,
                  withProps: true,
                }),

            [defineRoot(stylePath)]: minify(stringStyle).css,
          },

          pageName: localStorage.getItem(current_page_id),
          updatePreviewPages: projectSettings.enable_auto_save,
        },
        editor,
      );

      editor.on("storage:after:store", afterSave);
    });

    await doInWordpressAsync(async () => {
      const dataToSave = {
        html: gjsComponentsToJSON(sle, true),
        css: minify(stringStyle).css,
        category: newProps.ctg,
        media:
          selectedEl.getIcon() ||
          editorIcons.components({
            strokeColor: "white",
            strokeWidth: 2,
          }),
      };

      const res = await wp_insert_post({
        projectId,
        // featured_image:
        //   new File([imgBlob], `${newProps.name}-${uuid}.png`, {
        //     type: "image/png",
        //   })
        // ||
        // new File(
        //   [
        // selectedEl.getIcon() ||
        //   editorIcons.components({
        //     strokeColor: "white",
        //     strokeWidth: 2,
        //   }),
        //   ],
        //   `${newProps.name}-${uuid}`,
        //   { type: "image/png" },
        // )
        // ,

        post_data: {
          post_type: "inf_blocks",
          post_name: newProps.name,
          post_status: "publish",
          /////....
        },

        meta_data: {
          "inf-template-id": uuid,
          media:
            selectedEl.getIcon() ||
            editorIcons.components({
              strokeColor: "white",
              strokeWidth: 2,
            }),
          inf_meta: {
            saved: dataToSave,
          },
        },
      });
      console.log("blocks res after save : ", res);

      afterSave();
      qc.invalidateQueries({ queryKey: ["inf_blocks"] });
      editor.trigger("block:add");
    });
  };

  return (
    <main className="flex flex-col gap-3">
      <header className="flex gap-2 justify-between">
        <Input
          autoFocus={true}
          className="w-full bg-surface-tertiary"
          placeholder="Name"
          value={newProps.name}
          onInput={(ev) => {
            setNewProps({ ...newProps, name: ev.target.value });
          }}
        />
        {/* <Select
          keywords={ctgs}
          placeholder="Category"
          onInput={(value) => {setNewProps({ ...newProps, ctg: value });}}
          onEnterPress={(value) => {setNewProps({ ...newProps, ctg: value });}}
          onItemClicked={(value) => {setNewProps({ ...newProps, ctg: value });}}
          value={newProps.ctg}
        /> */}
        <Button
        className="h-auto font-semibold"
          onClick={(ev) => {
            save();
          }}
        >
          Save
        </Button>
      </header>

      {/* <section className="h-full rounded-lg p-2 bg-surface-tertiary flex items-center justify-center">
        <img
          src={imgSrc}
          className=" border-2 max-h-[300px] border-slate-400"
        />
      </section> */}
    </main>
  );
};
