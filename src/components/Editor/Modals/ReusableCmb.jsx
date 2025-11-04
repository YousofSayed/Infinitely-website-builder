import React, { useEffect, useRef, useState } from "react";
import { Input } from "../Protos/Input";
import { Button } from "../../Protos/Button";
import { useEditorMaybe } from "@grapesjs/react";
import html2canvas from "html2canvas-pro";
import {
  getComponentRules,
  getProjectSettings,
  handleCloneComponent,
  saveProjectByWorker,
  store,
} from "../../../helpers/functions";
import { html, uniqueID } from "../../../helpers/cocktail";
import { db } from "../../../helpers/db";
import {
  current_page_id,
  current_project_id,
  inf_template_id,
} from "../../../constants/shared";
import { minify } from "csso";
import { Icons } from "../../Icons/Icons";
import { editorIcons } from "../../Icons/editorIcons";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot } from "../../../helpers/bridge";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";

export const ReusableCmb = () => {
  const editor = useEditorMaybe();
  const selectedEl = editor.getSelected();
  const [imgSrc, setImgSrc] = useState("");
  const [imgBlob, setImgBlob] = useState(new Blob([""], { type: "image/png" }));
  const [newProps, setNewProps] = useState({
    name: "",
    ctg: "",
  });

  useEffect(() => {
    //   setCtgs([...getCategoriesId(editor)]);
    // getImage();
  }, []);

  const getImage = async () => {
    const canvas = await (
      await html2canvas(editor.getSelected().getEl())
    ).toBlob((blob) => {
      setImgSrc(URL.createObjectURL(blob));
      setImgBlob(blob);
    }, "image/png");
  };

  const save = async () => {
    const tId = toast.loading(<ToastMsgInfo msg={`Saving template...`} />);
    // sessionStorage.setItem("clone-disabled", "true");
    const sle = await editor.getSelected();
    sle.set({
      draggable: true,
    });
    console.log(sle.props());
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

    // console.log("string attrs : ", splitterContent);

    // return;

    // sessionStorage.removeItem("clone-disabled");
    // const projectDataHandled = await handleCloneComponent(sle , editor);
    const id = newProps.name + (newProps.ctg || "templates") + sle.getId();
    sle.addAttributes({ [inf_template_id]: id });
    const block = {};
    const { projectSettings } = getProjectSettings();
    // editor.Blocks.add(id, block);
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
              media: sle.getIcon() || editorIcons.templates({fill:'white'}),
            },
          },
        },

        files: {
          [defineRoot(contentPath)]: isSplitter ? splitterContent : sle.toHTML({
            keepInlineStyle: true,
            withProps: true,
          }),

          [defineRoot(stylePath)]: minify(stringStyle).css,
        },

        pageName: localStorage.getItem(current_page_id),
        updatePreviewPages: projectSettings.enable_auto_save,
      },
      editor
    );
    //  editor.trigger("block:add");
    editor.runCommand("close:current:modal");
    toast.done(tId);
    toast.success(<ToastMsgInfo msg={`Template saved successfully👍`} />);

    // await opfs.writeFiles([
    //   {
    //     path: defineRoot(contentPath),
    //     content: sle.toHTML({ withProps: true }),
    //   },
    //   {
    //     path: defineRoot(stylePath),
    //     content: minify(stringStyle).css,
    //   },
    // ]);

    // await db.projects.update(projectId, {
    //   blocks: {
    //     ...projectData.blocks,
    //     [id]: {
    //       label: newProps.name,
    //       name: newProps.name,
    //       category: newProps.ctg || "templates",
    //       id,
    //       pathes,
    //       // content: new Blob([selectedEl.toHTML({ withProps: true })], {
    //       //   type: "text/html",
    //       // }),
    //       // style: minify(stringStyle).css,
    //       type: "template",
    //       media: sle.getIcon() || editorIcons.templates({}),
    //     },
    //   },
    // });

    // saveProjectByWorker(
    //   {
    //     data: {
    //       blocks: {
    //         ...projectData.blocks,
    //         [id]: {
    //           label: newProps.name,
    //           name: newProps.name,
    //           category: newProps.ctg || "templates",
    //           id,
    //           pathes,
    //           // content: new Blob([selectedEl.toHTML({ withProps: true })], {
    //           //   type: "text/html",
    //           // }),
    //           // style: minify(stringStyle).css,
    //           type: "template",
    //           media: sle.getIcon() || editorIcons.templates({}),
    //         },
    //       },
    //     },

    //     pageName: localStorage.getItem(current_page_id),
    //     updatePreviewPages: true,
    //   },
    //   () => {
    // editor.trigger("block:add");
    // editor.runCommand("close:current:modal");
    // toast.done(tId);
    // toast.success(<ToastMsgInfo msg={`Template saved successfully👍`} />);
    //   }
    // );
  };

  return (
    <main className="flex flex-col gap-3">
      <header className="flex gap-2 justify-between">
        <Input
          autoFocus={true}
          className="w-full bg-slate-800"
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
          onClick={(ev) => {
            save();
          }}
        >
          Save
        </Button>
      </header>

      {/* <section className="h-full rounded-lg p-2 bg-slate-800 flex items-center justify-center">
        <img
          src={imgSrc}
          className=" border-2 max-h-[300px] border-slate-400"
        />
      </section> */}
    </main>
  );
};
