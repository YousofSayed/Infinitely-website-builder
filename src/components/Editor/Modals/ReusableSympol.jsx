import { wp_insert_post } from "@/apps/wordpress/functions";
import {
  current_page_id,
  current_project_id,
  inf_class_name,
  inf_symbol_Id_attribute,
} from "@/constants/shared";
import { _symbolsCachedState } from "@/constants/windowKeys";
import { defineRoot, getOPFSProjectDir } from "@/helpers/bridge";
import { uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  doInNormalAsync,
  doInWordpressAsync,
  getComponentRules,
  getImgAsBlob,
  getInfinitelySymbolInfo,
  getProjectData,
  getProjectSettings,
  gjsComponentsToJSON,
  handleCloneComponent,
  initSymbol,
  initToolbar,
  preventSelectNavigation,
  saveProjectByWorker,
  store,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { refType } from "@/helpers/jsDocs";
import { editorIcons } from "@/components/Icons/editorIcons";
import { Button } from "@/components/Protos/Button";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { minify } from "csso";
import html2canvas from "html2canvas-pro";
import { uniqueId } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

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
  const qc = useQueryClient();
  const [keywordsCtg, setKeywordsCtg] = useState(
    editor.Blocks.categories.models.map((ctg) => ctg.id),
  );

  const onInput = (value, prop) => {
    setProps({ ...props, [prop]: value });
  };

  const onSave = (ev) => {
    const selectedElMain = editor.getSelected();
    const { projectSettings } = getProjectSettings();
    const symbolInfo = getInfinitelySymbolInfo(selectedElMain);
    if (symbolInfo.isSymbol) {
      toast.error(<ToastMsgInfo msg={`You Can’t Create symbol From Symbol`} />);
      return;
    }
    const projectId = +localStorage.getItem(current_project_id);
    const tId = toast.loading(<ToastMsgInfo msg={`Saving symbol...`} />);
    editor.Storage.setAutosave(false);

    const addSymbolBlock = async () => {
      const projectData = await getProjectData();
      const uuid = uniqueId(`${uniqueID()}-`);
      const attributes = selectedElMain.getAttributes();
      selectedElMain.addAttributes({
        [inf_symbol_Id_attribute]: uuid,
        ...(!attributes[inf_class_name] && {
          [inf_class_name]: `inf-${uuid}`,
        }),
      });
      !attributes[inf_class_name] && selectedElMain.addClass(`inf-${uuid}`);

      const selectedEl = selectedElMain; //editor.getSelected().clone();
      const dragVal = selectedEl.get("draggable");
      const isSplitter = selectedEl.get("type") == "splitter";
      let splitterContent = "";
      if (isSplitter) {
        const el = selectedEl.getEl();
        const stringAttributs = [...el.attributes]
          .concat({ name: "is-plain", value: "true" })
          .map((attr) => `${attr.name}="${attr.value}"`)
          .join(" ");

        splitterContent = `<${selectedEl.tagName.toLowerCase()} ${stringAttributs}>
       ${el.textContent}
       </${selectedEl.tagName.toLowerCase()}>`;
      } else {
        selectedElMain.forEachChild((child) => {
          const childUuid = uniqueID();
          const childAttributes = child.getAttributes();
          child.addAttributes({
            ...(!childAttributes[inf_class_name] && {
              [inf_class_name]: `inf-${childUuid}`,
            }),
          });
          !childAttributes[inf_class_name] &&
            child.addClass(`inf-${childUuid}`);
        });
      }

      selectedEl.set({
        draggable: true,
      });

      const prevBlocks = projectData?.blocks ? projectData.blocks : {};

      const rules = getComponentRules({
        editor,
        cmp: selectedEl,
        nested: true,
      });

      // const jsonRules = JSON.stringify(rules.rules);
      const stringRules = rules.stringRules;
      console.log("rules  : ", JSON.stringify(rules));

      const afterSave = () => {
        editor.runCommand("close:current:modal");
        toast.done(tId);
        toast.success(
          <ToastMsgInfo msg={`Symbols created and saved successfully👍`} />,
        );
        window[_symbolsCachedState] = false;
        selectedEl.set({
          draggable: dragVal,
        });
        editor.off("storage:after:store", afterSave);
      };

      await doInNormalAsync(async () => {
        const contentPath = `editor/symbols/${uuid}/${uuid}.html`;
        const stylePath = `editor/symbols/${uuid}/${uuid}.css`;
        const pathes = {
          content: contentPath,
          style: stylePath,
        };
        editor.clearDirtyCount();
        store(
          {
            data: {
              // motions: projectDataHandled.motions,
              symbols: {
                ...projectData.symbols,
                [uuid]: {
                  id: uuid,
                  label: props.name,
                  category: props.category || "symbols",
                  pathes,
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
                    editorIcons.components({
                      strokeColor: "white",
                      strokeWidth: 2,
                    }), //blobImg,
                  type: "symbol",
                  pathes,
                },
              },
            },

            files: {
              [defineRoot(contentPath)]: isSplitter
                ? splitterContent
                : selectedEl.toHTML({
                    keepInlineStyle: true,
                    withProps: true,
                  }),

              [defineRoot(stylePath)]: minify(stringRules).css,
            },

            updatePreviewPages: true,
            pageName: localStorage.getItem(current_page_id),
          },
          editor,
        );
        editor.on("storage:after:store", afterSave);
      });

      await doInWordpressAsync(async () => {
        ///code...
        console.log("blob image file : ", blobImg);
        const dataToSave = {
          html: gjsComponentsToJSON(selectedEl, true),
          //  selectedEl.toHTML({
          //   keepInlineStyle: true,
          //   withProps: true,
          // }),
          css: minify(stringRules).css,
          category: props.category,
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
          //   new File([blobImg], `${props.name}-${uuid}`, {
          //     type: "image/png",
          //   }) ||
          //   new File(
          //     [
          //       selectedEl.getIcon() ||
          //         editorIcons.components({
          //           strokeColor: "white",
          //           strokeWidth: 2,
          //         }),
          //     ],
          //     `${props.name}-${uuid}`,
          //     { type: "image/png" },
          //   ),

          post_data: {
            post_type: "inf_symbols",
            post_name: props.name,
            post_status: "publish",
            /////....
          },

          meta_data: {
            "inf-symbol-id": uuid,
            media:dataToSave.media,
            inf_meta: {
              before_save: dataToSave,
              saved: dataToSave,
            },
          },
        });
        editor.Storage.setAutosave(projectSettings.enable_auto_save);
        // projectSettings.enable_auto_save && await editor.Storage.store();
        console.log("wp_insert_post", res);
        afterSave();
        qc.invalidateQueries({ queryKey: ["inf_symbols"]  , refetchType: "all" });
        editor.trigger("block:add");
      });

      initToolbar(editor, selectedElMain);
      if (!isSplitter) {
        initSymbol(uuid, editor);
      } else {
        alert(
          `If you have more than one splitter symbol, they will not update in real time to avoid performance drops.`,
        );
      }
    };
    addSymbolBlock();
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
    const blobImg = await getImgAsBlob(selectedEl);
    setImgSrc(URL.createObjectURL(blobImg));
    setBlobImg(blobImg);
    // contentRef.current.src = canvas.toDataURL();
  };

  // useEffect(() => {
  //   getSelectedElAsImg();
  // }, []);

  return (
    <section className="w-full z-50 p-2 flex flex-col gap-2 overflow-auto bg-surface-tertiary rounded-lg ">
      <header className="p-2 z-50 rounded-lg flex gap-2 justify-between  bg-surface-secondary">
        <Input
          value={props.name}
          autoFocus={true}
          placeholder="Name"
          onInput={(ev) => {
            onInput(ev.target.value, "name");
          }}
          className="bg-surface-tertiary w-[49%] "
        />
        <Select
          keywords={keywordsCtg}
          placeholder="Category"
          zIndex={2000}
          onInput={(value) => {
            onInput(value, "category");
          }}
          onEnterPress={(value) => onInput(value, "category")}
          value={props.category}
          className="bg-surface-tertiary w-[49%] "
          onItemClicked={(value) => onInput(value, "category")}
        />
        <Button onClick={onSave} className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold">
          Save
        </Button>
      </header>
      {/* <main className="bg-surface-secondary overflow-auto grid place-items-center rounded-lg p-2 h-[100%]">
        {!!imgSrc && (
          <img src={imgSrc} className="w-full border-2 border-slate-400"></img>
        )}
      </main> */}
      {/* <footer></footer> */}
    </section>
  );
};
