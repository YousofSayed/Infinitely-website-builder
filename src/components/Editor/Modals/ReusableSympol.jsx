import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../Protos/Input";
import { refType } from "../../../helpers/jsDocs";
import { Button } from "../../Protos/Button";
import html2canvas from "html2canvas-pro";
import { Select } from "../Protos/Select";
import { uniqueID } from "../../../helpers/cocktail";
import {
  getComponentRules,
  getImgAsBlob,
  getInfinitelySymbolInfo,
  initSymbol,
  initToolbar,
  preventSelectNavigation,
} from "../../../helpers/functions";
import { db } from "../../../helpers/db";
import {
  current_project_id,
  inf_class_name,
  inf_symbol_Id_attribute,
} from "../../../constants/shared";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { minify } from "csso";
import { editorIcons } from "../../Icons/editorIcons";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot, getOPFSProjectDir } from "../../../helpers/bridge";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const ReusableSympol = () => {
  const editor = useEditorMaybe();
  const contentRef = useRef(refType);
  const [props, setProps] = useState({ name: "", category: "" });
  const [imgSrc, setImgSrc] = useState("");
  const [blobImg, setBlobImg] = useState(new Blob([""], { type: "image/png" }));
  const [keywordsCtg, setKeywordsCtg] = useState(
    editor.Blocks.categories.models.map((ctg) => ctg.id)
  );

  const onInput = (value, prop) => {
    setProps({ ...props, [prop]: value });
  };

  const onSave = (ev) => {
    const selectedEl = editor.getSelected();
    const symbolInfo = getInfinitelySymbolInfo(selectedEl);
    if (symbolInfo.isSymbol) {
      toast.error(<ToastMsgInfo msg={`You Can’t Create symbol From Symbol`} />);
      // console.log(selectedEl.toHTML({attributes:{haha:'ahaha'} , withProps:true}) , , selectedEl.toHTML());

      return;
    }
    const projectId = +localStorage.getItem(current_project_id);

    const addSymbolBlock = async () => {
      const selectedEl = editor.getSelected();
      const uuid = uniqueID();
      const attributes = selectedEl.getAttributes();
      selectedEl.addAttributes({
        [inf_symbol_Id_attribute]: uuid,
        ...(!attributes[inf_class_name] && { [inf_class_name]: `inf-${uuid}` }),
      });
      !attributes[inf_class_name] && selectedEl.addClass(`inf-${uuid}`);
      selectedEl.forEachChild((child) => {
        const childUuid = uniqueID();
        const childAttributes = child.getAttributes();
        child.addAttributes({
          ...(!childAttributes[inf_class_name] && {
            [inf_class_name]: `inf-${childUuid}`,
          }),
        });
        !childAttributes[inf_class_name] && child.addClass(`inf-${childUuid}`);
      });
      const projectData = await await db.projects.get(projectId);

      const prevBlocks = projectData?.blocks ? projectData.blocks : {};

      const rules = getComponentRules({
        editor,
        cmp: selectedEl,
        nested: true,
      });

      const jsonRules = JSON.stringify(rules.rules);
      const stringRules = rules.stringRules;
      console.log("rules  : ", JSON.stringify(rules));
      const contentPath = `editor/symbols/${uuid}/${uuid}.html`;
      const stylePath = `editor/symbols/${uuid}/${uuid}.css`;
      const pathes = {
        content: contentPath,
        style: stylePath,
      };
      await opfs.writeFiles([
        {
          path: defineRoot(contentPath),
          content: selectedEl.toHTML({
            keepInlineStyle: true,
            withProps: true,
          }),
        },
        {
          path: defineRoot(stylePath),
          content: minify(stringRules).css,
        },
      ]);
      await db.projects.update(+projectId, {
        symbols: {
          ...projectData.symbols,
          [uuid]: {
            id: uuid,
            label: props.name,
            category: props.category || "symbols",
            pathes,
            // style: new Blob([minify(stringRules).css], { type: "text/css" }),
            // content: new Blob(
            //   [selectedEl.toHTML({ keepInlineStyle: true, withProps: true })],
            //   { type: "text/html" }
            // ),
          },
        },
        blocks: {
          ...prevBlocks,
          [uuid]: {
            name: props.name,
            label: props.name,
            category: props.category || "symbols",
            id: uuid,
            media:
              selectedEl.getIcon() ||
              editorIcons.components({ strokeColor: "white", strokeWidth: 2 }), //blobImg,
            type: "symbol",
            pathes,
            // style: new Blob([minify(stringRules).css], { type: "text/css" }),
            // content: new Blob(
            //   [selectedEl.toHTML({ withProps: true, keepInlineStyle: true })],
            //   { type: "text/html" }
            // ),
          },
        },
      });
      editor.trigger("block:add");
      initToolbar(editor, selectedEl);
      initSymbol(uuid, editor);
    };
    addSymbolBlock();
    editor.runCommand("close:current:modal");
  };

  const getSelectedElAsImg = async () => {
    const selectedEl = editor.getSelected().getEl();
    // const canvas = await (
    //   await html2canvas(selectedEl, {
    //     useCORS: true,
    //   })
    // ).toBlob((blob) => {
    //   setBlobImg(blob);
    // }, "image/png");
    setImgSrc(URL.createObjectURL(await getImgAsBlob(selectedEl)));
    // contentRef.current.src = canvas.toDataURL();
  };

  useEffect(() => {
    getSelectedElAsImg();
  }, []);

  return (
    <section className="w-full z-50 p-2 flex flex-col gap-2 h-[500px] overflow-auto bg-slate-800 rounded-lg ">
      <header className="p-2 z-50 rounded-lg flex gap-4 justify-between bg-slate-900">
        <Input
          value={props.name}
          autoFocus={true}
          placeholder="Name"
          onInput={(ev) => {
            onInput(ev.target.value, "name");
          }}
          className="bg-slate-800 w-[40%]"
        />
        <Select
          keywords={keywordsCtg}
          placeholder="Category"
          onInput={(value) => {
            onInput(value, "category");
          }}
          onEnterPress={(value) => onInput(value, "category")}
          value={props.category}
          className="bg-slate-800 w-[40%]"
          onItemClicked={(value) => onInput(value, "category")}
        />
        <Button onClick={onSave}>Save</Button>
      </header>
      <main className="bg-slate-900 overflow-auto grid place-items-center rounded-lg p-2 h-[100%]">
        {!!imgSrc && (
          <img src={imgSrc} className="w-full border-2 border-slate-400"></img>
        )}
      </main>
      {/* <footer></footer> */}
    </section>
  );
};
