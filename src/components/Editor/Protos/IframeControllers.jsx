import React, { useEffect, useRef, useState } from "react";
import { Li } from "../../Protos/Li";
import { Icons } from "../../Icons/Icons";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  animationsState,
  isAnimationsChangedState,
  showAnimationsBuilderState,
  showLayersState,
  zoomValueState,
} from "../../../helpers/atoms";
import { useNavigate } from "react-router-dom";
import {
  getProjectData,
  getProjectSettings,
  mount,
  toggleFastPreview,
  unMount,
} from "../../../helpers/functions";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { isChrome } from "../../../helpers/bridge";
import {
  killAllGsapMotions,
  runAllGsapMotions,
} from "../../../helpers/customEvents";
import { useProjectSettings } from "../../../hooks/useProjectSettings";
import { Hr } from "../../Protos/Hr";
import { animationsSavingMsg } from "../../../constants/confirms";
import { editorContainerInstance } from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";
import { gsap_animation_state } from "../../../constants/shared";

export const IframeControllers = () => {
  const editor = useEditorMaybe();
  const navigate = useNavigate();
  const [showLayers, setShowLayers] = useRecoilState(showLayersState);
  const [showAnimBuilder, setShowAnimBuilder] = useRecoilState(
    showAnimationsBuilderState
  );
  const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
    isAnimationsChangedState
  );
  const [animations, setAnimations] = useRecoilState(animationsState);
  const [zoomValue, setZoomValue] = useRecoilState(zoomValueState);
  const undoRef = useRef();
  const redoRef = useRef();
  const isEditorLoad = useRef(true);
  // const projectSettings = useRef(getProjectSettings());
  const [projectSetting, setProjectSettings] = useProjectSettings();

  useEffect(() => {
    if (!editor) return;
    const cb = () => {
      isEditorLoad.current = false;
      editor?.Canvas?.getBody?.()?.setAttribute("loaded", true);
      console.log("i should load");
    };
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

    editor.on("canvas:frame:load:body", cb);
    return () => {
      editor.off("canvas:frame:load:body", cb);
      window.removeEventListener("keyup", callback, { capture: true });
    };
  }, [editor]);

  const undo = () => {
    // editor.runCommand("core:undo");
    editor.UndoManager.undo();
  };

  const redo = () => {
    // editor.runCommand("core:redo");
    editor.UndoManager.redo();
  };

  const clearIFrameBody = () => {
    editor.select(null);
    editor.Components.clear();
    editor.refresh({ tools: true });
    editor.Canvas.refresh({ all: true, spots: true });
  };

  const setComponentsView = () => {
    //   if(editor.Commands.isActive("preview"))return;
    //   const command = `core:component-outline`;
    //  const isActive = editor.Commands.isActive(command);
    //   isActive ? editor.stopCommand(command) : editor.runCommand(command);
    //   console.log('isActive : ' ,isActive);
    editor.runCommand("ui:outline");
    // const acitveCommand = Object.keys(editor.Commands.active);
    // acitveCommand.includes(command)
    //   ? editor.stopCommand(command)
    //   : editor.runCommand(command);
  };

  const emitZoomValue = (decrease = false) => {
    let value = editor.getContainer().style.zoom;
    value = decrease ? +value - 0.1 : +value + 0.1;
    editor.getContainer().style.zoom = value;
    editorContainerInstance.emit(InfinitelyEvents.editorContainer.update, {
      value,
    });
  };

  return (
    <>
      <Li
        onClick={clearIFrameBody}
        title="clear canvas"
        className="flex-shrink-0"
        // icon={Icons.trash}
        justHover={true}
      >
        {Icons.trash(undefined, undefined, 23, 23)}
      </Li>
      <Li
        refForward={undoRef}
        className="flex-shrink-0"
        onClick={undo}
        title="undo"
        icon={Icons.undo}
        justHover={true}
      />
      <Li
        refForward={redoRef}
        className="flex-shrink-0"
        onClick={redo}
        title="redo"
        icon={Icons.redo}
        justHover={true}
      />

      <Li
        className="flex-shrink-0"
        onClick={() => {
          emitZoomValue();
          // editor.Canvas.setZoom(editor.Canvas.getZoom() + 1, {
          //   avoidStore: true,
          // });
          // editor.getWrapper().getEl()
          //   .querySelectorAll("*")
          //   .forEach((el) => {
          //     const bodyScale =
          //       Number(el.style.scale) ||
          //       1;
          //     el.style.scale = bodyScale + 0.1;
          //   });
          //  editor.getWrapper().setStyle({
          //   width: `100%`,
          //   height: `100%`,
          // })
        }}
        title="zoom in"
        // isObjectParamsIcon
        // icon={Icons.zoomIn}
        justHover={false}
        fillObjectIconOnHover
        fillObjIconStroke={false}
        isObjectParamsIcon
        // hover={false}
      >
        {Icons.zoomIn({ height: `100%`, width: 22 })}
      </Li>

      <Li
        className="flex-shrink-0"
        onClick={() => {
          emitZoomValue(true);
          // editor.Canvas.setZoom(editor.Canvas.getZoom() - 1, {
          //   avoidStore: true,
          // });

          // editor.getWrapper().getEl()
          //   .querySelectorAll("*")
          //   .forEach((el) => {
          //     const bodyScale =
          //       Number(el.style.scale) ||
          //       1;
          //     el.style.scale = bodyScale - 0.1;
          //   });
          // editor.getWrapper().setStyle({
          //   width: `100%`,
          //   height: `100%`,
          // })
        }}
        title="zoom out"
        // isObjectParamsIcon
        // icon={Icons.zoomIn}
        justHover={false}
        fillObjectIconOnHover
        fillObjIconStroke={false}
        isObjectParamsIcon
        // hover={false}
      >
        {Icons.zoomOut({ height: `100%`, width: 22 })}
      </Li>

      {/* {!projectSetting.disable_petite_vue && (
        <>
          <Li
            // refForward={redoRef}
            onClick={() => {
              unMount({
                editor,
                all: true,
              });
            }}
            title="edite components"
            fillIcon
            fillObjIcon={false}
            icon={Icons.editGjsComponent}
            isObjectParamsIcon
            className="flex-shrink-0"
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
            title="mount components"
            fillIcon
            className="flex-shrink-0"
            fillObjIcon={false}
            icon={Icons.vue}
            isObjectParamsIcon
            justHover={true}
          />
        </>
      )} */}

      <Hr />

      <Li
        // refForward={redoRef}
        onClick={async () => {
          const motions = await (await getProjectData()).motions;
          killAllGsapMotions(motions);
          runAllGsapMotions(motions);
          sessionStorage.setItem(gsap_animation_state, "true");
        }}
        title="Run All Motions"
        fillIcon
        fillObjIcon={false}
        icon={Icons.play}
        className="flex-shrink-0"
        isObjectParamsIcon
        justHover={true}
      />

      <Li
        // refForward={redoRef}
        onClick={async () => {
          killAllGsapMotions(await (await getProjectData()).motions);
          sessionStorage.setItem(gsap_animation_state, "false");
        }}
        title="Kill All Motions"
        fillIcon
        className="flex-shrink-0"
        fillObjIcon={false}
        icon={Icons.close}
        justHover={true}
      />

      <Li
        onClick={() => {
          editor.runCommand("toggle-preview");
          // toggleFastPreview(editor);
        }}
        className="flex-shrink-0"
        isObjectParamsIcon
        fillObjIcon
        fillObjectIconOnHover
        justHover
        icon={Icons.binoculars}
        hover
        title="Fast Preview"
      />

      <Li
        onClick={setComponentsView}
        title="outline elements"
        className="flex-shrink-0"
        icon={Icons.square}
        justHover={true}
      />
      <Li
        onClick={(ev) => {
          setShowLayers((old) => !old);
          setShowAnimBuilder(false);
        }}
        className="flex-shrink-0"
        icon={Icons.layers}
        title="layers"
      />
      <Li
        onClick={(ev) => {
          // console.log(showPreview, isAnimationsChanged);

          if (isAnimationsChanged && showAnimBuilder) {
            const cnfrm = confirm(animationsSavingMsg);
            if (cnfrm) {
              setAnimationsChanged(false);
              setAnimations([]);
              setShowAnimBuilder(false);
            }
          } else {
            setShowAnimBuilder(!showAnimBuilder);
            setShowLayers(false);
            navigate("edite/styling");
          }
          // setShowAnimBuilder((old) => !old);
        }}
        className="flex-shrink-0"
        title="Animation Builder"
        icon={Icons.animation}
      />
      <Li
        className="flex-shrink-0"
        onClick={async (ev) => {
          console.log(editor?.Canvas?.getBody?.());
          const body = editor?.Canvas?.getBody();
          if (!body && body.getAttribute("loaded") != "true") {
            toast.warn(<ToastMsgInfo msg={`Wait until load end`} />);
            return;
          }
          isEditorLoad.current = true;
          editor.load();
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
    </>
  );
};
