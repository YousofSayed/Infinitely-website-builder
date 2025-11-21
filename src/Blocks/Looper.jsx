import React from "react";
import { toast } from "react-toastify";
import { Icons } from "../components/Icons/Icons";
import { current_project_id, headersProps } from "../constants/shared";
import { parse, stringify } from "../helpers/cocktail";
import {
  defineTraits,
  getProjectData,
  mount,
  unMount,
} from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { setPropToLoopCmp } from "../plugins/globalTraits";

/**
 *
 * @param {{editor: import('grapesjs').Editor}} param0
 * @returns
 */
export const Looper = ({ editor }) => {
  editor.Components.addType("looper", {
    model: {
      defaults: {
        icon: reactToStringMarkup(
          Icons.looper({ fill: "white", width: 20, height: 20 })
        ),
        tagName: "section",
        // components: [{ type: "drop-area" }],
        attributes: {
          class: "p-10 drop",
        },
        traits: defineTraits([
          {
            name: "loop-url",
            id: "loop-url",
            label: "Loop Url",
            type: "text",
            placeholder: `Enter loop url`,
            role: "attribute",
            bindToAttribute: true,
            callback({ editor, oldValue, newValue, trait }) {
              const sle = editor.getSelected();
              sle.addAttributes({
                "v-scope": `{data:null}`,
                "v-effect": `fetch("${newValue}").then(res=>res.json()).then(res=>data=res)`,
              });
            },
          },
          {
            name: "loop-headers",
            id: "loop-headers",
            label: "Loop Headers",
            placeholder: "Enter loop header",
            role: "attribute",
            type: "add-props",
            default: "{}",
            // value: "{}",
            stateProp: "",
            bindToAttribute: true,
            keywords: headersProps,
            // callback({editor,oldValue,newValue,trait}){
            //   const sle = editor.getSelected();
            // }
          },
          {
            name: "loop-name",
            label: "Loop Name",
            id: "loop-name",
            bindToAttribute: true,
            type: "text",
            placeholder: `Loop Name`,
            role: "attribute",
            async callback({ editor, oldValue, newValue, trait, model }) {
              const sle = editor.getSelected();
              const projectData = await getProjectData();
              const restModels = projectData.restAPIModels.filter(Boolean);
              const loopUrl = sle.getTrait("loop-url")?.attributes?.value || "";
              const loopHeaders =
                sle.getTrait("loop-headers")?.attributes?.value || "";
              const newModels = [
                ...restModels.filter((model) => model.varName != oldValue),
              ];
              const oldModel = restModels.find(
                (model) => model.varName == oldValue
              );
              const headers = loopHeaders ? parse(loopHeaders || "{}") : null;
              console.log(loopUrl, headers);

              const responseData = oldModel?.response
                ? oldModel.response
                : stringify(await (await fetch(loopUrl, { headers })).json());

              newModels.push({
                varName: newValue,
                name: newValue,
                method: "GET",
                url: loopUrl,
                headers,
                response: responseData,
                body: null,
              });

              infinitelyWorker.postMessage({
                command: "updateDB",
                props: {
                  projectId: +localStorage.getItem(current_project_id),
                  data: {
                    restAPIModels: newModels,
                  },
                },
              });
              const attributes = model.getAttributes();
              const modelScope = attributes["v-scope"];

              modelScope && setPropToLoopCmp([`${newValue || "data"}`, "[]"] , oldValue , model , {editor , trait});
              !modelScope &&
                sle.addAttributes({
                  "v-scope": `{${newValue || "data"}:[]}`,
                });

              sle.addAttributes({
                "v-effect": `fetch("${loopUrl}",{headers:${
                  loopHeaders ? `JSON.parse('${loopHeaders}')` : "null"
                }}).then(res=>res.json()).then(res=>${newValue || "data"}=res)`,
              });
            },
          },
          {
            name: "run-loop",
            label: "Run",
            type: "button",
            role: "handler",
            showCallback: () => {
              if (!editor) return;
              if (!editor.getSelected()) return;
              return editor.getSelected()?.get("type") == "looper";
            },
            buttonEvents: ({ editor, oldValue, newValue, trait }) => {
              return {
                onClick(ev) {
                  const sle = editor.getSelected();
                  if (!editor) return;
                  if (!editor.getSelected()) {
                    toast.warn(
                      <ToastMsgInfo msg={`please select component`} />
                    );
                    return;
                  }

                  if (!navigator.onLine) {
                    toast.warn(<ToastMsgInfo msg={`You are offline..!`} />);
                    return;
                  }
                  mount({
                    editor,
                    specificCmp: sle,
                  });
                },
              };
            },
          },
          {
            name: "revoke-loop",
            label: "Revoke",
            type: "button",
            role: "handler",
            showCallback: () => {
              if (!editor) return;
              if (!editor.getSelected()) return;
              return editor.getSelected().get("type") == "looper";
            },
            buttonEvents: ({ editor, oldValue, newValue, trait }) => {
              return {
                style: {
                  backgroundColor: "crimson",
                },
                onClick(ev) {
                  const sle = editor?.getSelected?.();
                  // const specificCmp = () => loopComponent;
                  // const loopComponent = sle
                  //   ?.parents?.()
                  //   ?.find?.((parent) => parent.get("type") === "looper");
                  // const targetSelect = editor
                  //   .getWrapper()
                  //   .find(`[mount-id]`)[0];
                  // targetSelect && preventSelectNavigation(editor, targetSelect);
                  if (!editor) return;
                  if (!editor.getSelected()) {
                    toast.warn(
                      <ToastMsgInfo msg={`please select component`} />
                    );
                    return;
                  }

                  unMount({
                    editor,
                    specificCmp: sle,
                    selectAfterUnMout: true,
                  });
                  // targetSelect.removeAttributes([`[mount-id]`]);
                },
              };
            },
          },
          //   {
          //     name: "loop",
          //     label: "loop",
          //     type: "button",
          //     role: "handler",
          //     buttonEvents: ({ editor, newValue, oldValue, trait }) => {
          //       return {
          //         onClick(ev) {
          //           const sle = editor.getSelected();
          //           mount({
          //             specificCmp: sle,
          //           });
          //         },
          //       };
          //     },
          //   },
        ]),
      },
    },
  });
};
