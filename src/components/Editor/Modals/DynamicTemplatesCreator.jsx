import React, { useEffect, useState } from "react";
import { Input } from "../Protos/Input";
import { Button } from "../../Protos/Button";
import { useEditorMaybe } from "@grapesjs/react";
import html2canvas from "html2canvas-pro";
import {  uniqueID } from "../../../helpers/cocktail";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import {
  extractChildsRules,
  extractRulesById,
  getComponentRules,
} from "../../../helpers/functions";
import { useLiveQuery } from "dexie-react-hooks";
import { current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import {
  dynamicAttributesType,
  dynamicTemplatesType,
} from "../../../helpers/jsDocs";
import { editorIcons } from "../../Icons/editorIcons";

export const DynamicTemplatesCreator = () => {
  const editor = useEditorMaybe();
  const [tempSrc, setTempSrc] = useState("");
  const [templateName, setTemplateName] = useState("");
  // const setDynamicTemplate = useSetRecoilState(dynamicTemplatesState);
  // const dynamicsTemplates = useRecoilValue(dynamicTemplatesState);
  const dynamicsTemplates = useLiveQuery(async () => {
    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await db.projects.get(projectId);
    return await projectData.dynamicTemplates;
  });

  const setDynamicTemplate = async (
    newDynamicTemplate = dynamicTemplatesType
  ) => {
    const projectId = +localStorage.getItem(current_project_id);
    await db.projects.update(projectId, {
      dynamicTemplates: {
        ...dynamicsTemplates,
        [templateName]: newDynamicTemplate,
      },
    });
  };

  useEffect(() => {
    const sle = editor?.getSelected();
    if (!editor || !sle) return;
    getTempSrc();
  }, []);

  const getTempSrc = async () => {
    setTempSrc(
      (
        await html2canvas(editor.getSelected().getEl(), { useCORS: true })
      ).toDataURL()
    );
  };

  const createDynmaicTemplate = async () => {
    if (!templateName) {
      toast.error(<ToastMsgInfo msg={`Give Your Template Name!`} />);
      return;
    }
    if (dynamicsTemplates[templateName]) {
      toast.error(<ToastMsgInfo msg={`Template Name Is Already Taken!`} />);
      return;
    }
    const sle = editor.getSelected();

    setDynamicTemplate({
      cmp: new Blob([sle.toHTML({ withProps: true, keepInlineStyle: true })], {
        type: "text/html",
      }),
      cmds:{},
      imgSrc: sle.getIcon() || editorIcons.dynamicTemp,//await toBlob(sle.getEl(), { type: "image/webp" }),
      name:templateName,
      allRules: new Blob(
        [
          getComponentRules({editor , cmp:editor.getSelected() , nested:true , }).stringRules
            // .asString,
        ],
        { type: "text/css" }
      ),

      cmpElId: sle.getId(),
      cmpChilds: sle.getInnerHTML(),
      oldAttributes: sle.getAttributes(),
      id: uniqueID(),
      // img: html`<img src="${tempSrc}" title="${templateName}" />`,
      parentRules: extractRulesById(
        editor.getCss(),
        `#${editor.getSelected().getId()}`
      ),
      // blockId:
      childsRules: extractChildsRules(editor.getCss(), editor.getSelected()),
      
      jsonCmp: JSON.stringify(editor.getSelected()),
    });
    toast.success(
      <ToastMsgInfo msg={`Dynamic Template Created Successfully`} />
    );
    editor.getSelected().remove();
    editor.select(null);
    editor.Canvas.refresh({ all: true, spots: true });
    editor.Canvas.refreshSpots();
    editor.refresh();
    editor.runCommand("close:custom:modal");
  };

  return (
    <main className="flex flex-col gap-2 h-[400px]">
      <header className="flex p-2 bg-slate-800 gap-2 rounded-lg w-full">
        <Input
          autoFocus
          value={templateName}
          className="bg-slate-900 w-full"
          placeholder="Template Name..."
          onInput={(ev) => {
            setTemplateName(ev.target.value);
          }}
        />
        <Button onClick={createDynmaicTemplate}>Create</Button>
      </header>

      {!!tempSrc && (
        <section className=" h-[calc(100%-70px)] rounded-lg p-2 bg-slate-800 flex items-center justify-center">
          <img
            src={tempSrc}
            className="w-full border-2 max-w-[100%] max-h-[100%] border-slate-400"
          />
        </section>
      )}
    </main>
  );
};
