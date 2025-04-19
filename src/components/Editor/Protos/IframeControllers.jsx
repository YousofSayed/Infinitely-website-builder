import React, { useEffect, useRef } from "react";
import { Li } from "../../Protos/Li";
import { Icons } from "../../Icons/Icons";
import { useEditorMaybe } from "@grapesjs/react";
import { useSetRecoilState } from "recoil";
import {
  showAnimationsBuilderState,
  showLayersState,
} from "../../../helpers/atoms";
import { useNavigate } from "react-router-dom";
import { mount, unMount } from "../../../helpers/functions";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { isChrome } from "../../../helpers/bridge";

export const IframeControllers = () => {
  const editor = useEditorMaybe();
  const navigate = useNavigate();
  const setShowLayers = useSetRecoilState(showLayersState);
  const setShowAnimBuilder = useSetRecoilState(showAnimationsBuilderState);
  const undoRef = useRef();
  const redoRef = useRef();
  const isEditorLoad = useRef(true);

  useEffect(() => {
    if (!editor) return;
    /**
     *
     * @param {KeyboardEvent} ev
     */
    const callback = (ev) => {
      const isUndo = (ev.ctrlKey || ev.metaKey) && ev.key === "z";
      const isRedo = (ev.ctrlKey || ev.metaKey) && ev.key === "y";

      // Check if the event should be intercepted
      if (isUndo || isRedo) {
        const activeElement = document.activeElement;
        const isTextInput =
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable; // Include contenteditable elements if needed

        // If focused on an input or textarea, prevent GrapesJS from handling it
        if (isTextInput) {
          // ev.stopPropagation(); // Stop the event from reaching GrapesJS
          console.log("Allowing native undo/redo in input");
          return;
        }
      }
      if (isUndo) {
        ev.preventDefault();
        ev.stopPropagation();
        // undo();
        undoRef.current.click();
      }
      if (isRedo) {
        ev.preventDefault();
        ev.stopPropagation();
        // redo();
        redoRef.current.click();
      }
    };

    // window.addEventListener("click", clickCallback);
    window.addEventListener("keyup", callback, { capture: true });

    return () => {
      // window.removeEventListener("click", clickCallback);
      window.removeEventListener("keyup", callback, { capture: true });
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const cb = () => {
      isEditorLoad.current = false;
      editor?.Canvas?.getBody?.()?.setAttribute("loaded", true);
      console.log("i should load");
    };
    editor.on("canvas:frame:load:body", cb);
    return () => {
      editor.off("canvas:frame:load:body", cb);
    };
  }, [editor]);

  const undo = () => {
    editor.runCommand("core:undo");
  };

  const redo = () => {
    console.log("redo");

    editor.runCommand("core:redo");
  };

  const clearIFrameBody = () => {
    isChrome((bool) => {
      // editor.Canvas.getFrameEl().setAttribute("srcdoc" , '');
      // editor.Canvas.getFrameEl().setAttribute("sandbox" , '');
      // editor.select(null);
      
      // editor.Canvas.getFrameEl().contentWindow.location.reload()
      // editor.Canvas.getFrameEl().srcdoc = "about:blank";
      // editor.Canvas.getFrameEl().sandbox = "allow-same-origin allow-scripts";
      // if(!bool){
      //   editor.select(null);
      //   console.log(editor.Components.getComponents().models);
      //   editor.Components.clear();
      // }
    });
    // editor.select(null);
    // console.log(editor.Components.getComponents().models);
    // editor.Components.clear();
    
    // // editor.getComponents().models.forEach(cmp=>cmp.remove())
    editor.Components.clear();
      console.log('tools : ' , editor.Components.getComponent('sda'));
      
    editor.refresh({ tools: true });
    editor.Canvas.refresh({ all: true, spots: true });
    // isChrome((bool) => {
    //   console.error("chrome");

      // editor.Canvas.getFrameEl().srcdoc = "about:blank";
      // editor.Canvas.getFrameEl().sandbox = "allow-same-origin allow-scripts";
    // });
  };

  const setComponentsView = () => {
    const command = `core:component-outline`;
    const acitveCommand = Object.keys(editor.Commands.active);
    acitveCommand.includes(command)
      ? editor.stopCommand(command)
      : editor.runCommand(command);
  };

  return (
    <ul className="flex w-full gap-2  items-center justify-between border-r-2 pr-2 mr-2 border-slate-800">
      <Li
        onClick={clearIFrameBody}
        title="clear canvas"
        // icon={Icons.trash}
        justHover={true}
      >
        {Icons.trash(undefined, undefined, 23, 23)}
      </Li>
      <Li
        refForward={undoRef}
        onClick={undo}
        title="undo"
        icon={Icons.undo}
        justHover={true}
      />
      <Li
        refForward={redoRef}
        onClick={redo}
        title="redo"
        icon={Icons.redo}
        justHover={true}
      />

      <Li
        // refForward={redoRef}
        onClick={() => {
          unMount({
            editor,
            all: true,
          });
        }}
        title="mount"
        fillIcon
        fillObjIcon={false}
        icon={Icons.editGjsComponent}
        isObjectParamsIcon
        justHover={true}
      />

      <Li
        // refForward={redoRef}
        onClick={() => {
          mount({
            editor,
            all: true,
          });
        }}
        title="edit mounted components"
        fillIcon
        fillObjIcon={false}
        icon={Icons.vue}
        isObjectParamsIcon
        justHover={true}
      />

      <Li
        onClick={setComponentsView}
        title="hash elements"
        icon={Icons.square}
        justHover={true}
      />
      <Li
        onClick={(ev) => {
          setShowLayers((old) => !old);
          setShowAnimBuilder(false);
        }}
        icon={Icons.layers}
        title="show layers"
      />
      <Li
        onClick={(ev) => {
          setShowAnimBuilder((old) => !old);
          setShowLayers(false);
          navigate("edite/styling");
        }}
        title="Animation Builder"
        icon={Icons.animation}
      />
      <Li
        onClick={async (ev) => {
          // const canvas = editor.Canvas;
          // editor.render()
          // const page = editor.Pages.get('nulsdal');
          // editor.Pages.select(page);
          // editor.render();
          //  editor.Frame
          // editor.Canvas.render()
          // editor.EditorModel.getCurrentFrame().renderHead()
          //  editor.EditorModel.getCurrentFrame().renderBody()
          //  editor.EditorModel.getCurrentFrame().renderScripts()
          //  editor.EditorModel.getCurrentFrame().renderStyles()
          //  editor.editorView.render()
          // editor.render();
          // editor.store();
          // editor.load();
          // editor.trigger('rerender')
          // editor.Canvas.getDocument().location.reload()
          // editor.DomComponents.render()
          // editor.editorView.setElement()

          // const projectId = +localStorage.getItem(current_project_id);
          // const projectData = await (await db.projects.get(projectId));
          // editor.store();
          console.log(editor?.Canvas?.getBody?.());
          // isEditorLoad.current
          const body = editor?.Canvas?.getBody();
          if (!body && body.getAttribute("loaded") != "true") {
            toast.warn(<ToastMsgInfo msg={`Wait until load end`} />);
            return;
          }
          isEditorLoad.current = true;
          editor.load();
          // editor.loadProjectData(projectData..gjsProjectData);
          // editor.Storage.load();
          // editor.trigger('canvas:frame:load');
          // editor.trigger('canvas:frame:load:body');
          // editor.trigger('canvas:frame:load:head');
          // editor.Pages.select(localStorage.getItem(current_page_id));

          // editor.load()

          // editor.Canvas.getWindow().location.reload()
          // canvas.render();
          // editor.loadData()
        }}
        title="Reload Canvas"
      >
        {Icons.refresh({
          width: 20,
          height: 20,
          strokeColor: "#64748B",
          strokWidth: 3,
        })}
      </Li>
    </ul>
  );
};
