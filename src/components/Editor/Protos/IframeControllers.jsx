import React, { useEffect, useRef, useState } from "react";
import { Li } from "../../Protos/Li";
import { Icons } from "../../Icons/Icons";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  animationsState,
  globalUndoAndRedoStates,
  isAnimationsChangedState,
  reloaderState,
  showAnimationsBuilderState,
  showLayersState,
  showsState,
  zoomValueState,
} from "../../../helpers/atoms";
import { useNavigate } from "react-router-dom";
import { getProjectData } from "../../../helpers/functions";
import {
  killAllGsapMotions,
  reloadEditor,
  runAllGsapMotions,
} from "../../../helpers/customEvents";
import { useProjectSettings } from "../../../hooks/useProjectSettings";
import { Hr } from "../../Protos/Hr";
import { animationsSavingMsg } from "../../../constants/confirms";
import {
  editorContainerInstance,
  reloadRequiredInstance,
} from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { cleanMotions, filterMotionsByPage } from "../../../helpers/bridge";
import { current_page_id } from "../../../constants/shared";

// import { unMountApp } from "../../../main";
// import { reBuildApp, unMountApp } from "../../../main";

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
  const [reloader, setReloader] = useRecoilState(reloaderState);
  const [globalUndoAndRedo, setGlobalUndoAndRedo] = useRecoilState(
    globalUndoAndRedoStates
  );
  const [shows, setShows] = useRecoilState(showsState);
  const [reloadRequired, setReloadRequired] = useState(false);
  const redoTimeoutRef = useRef();
  const undoTimeoutRef = useRef();
  useEffect(() => {
    if (!editor) return;
    editor.Keymaps.remove("core:undo");
    editor.Keymaps.remove("core:redo");

    /**
     *
     * @param {KeyboardEvent} ev
     */
    const callback = (ev) => {
      const isUndo = (ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z";
      const isRedo = (ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "y";
    
      // If in an input/textarea/contenteditable, allow native undo
      const active = document.activeElement;
      const isTextInput =
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable;

        console.log('active : ' , active);
        
      if (isTextInput) {
        // ✅ Allow browser native undo/redo in inputs but keep focus
        // prevent GrapesJS or other listeners from stealing it

        return;
      }

      

      if (isUndo || isRedo) {
        ev.preventDefault();
        ev.stopImmediatePropagation(); // stop ALL other listeners
        ev.stopPropagation();

        if (isUndo) {
          clearTimeout(undoTimeoutRef.current);
          undoTimeoutRef.current = setTimeout(() => {
            undoRef.current?.click();
          }, 0);
        }

        if (isRedo) {
          clearTimeout(redoTimeoutRef.current);
          redoTimeoutRef.current = setTimeout(() => {
            redoRef.current?.click();
          }, 0);
        }
      }
    };
    /**
     *
     * @param {CustomEvent} ev
     */
    const reloadRequiredCallback = (ev) => {
      const { state } = ev.detail;
      setReloadRequired(state);
      if (state) {
        toast.warn(<ToastMsgInfo msg={`Reload required`} />);
      }
    };

    // window.addEventListener("click", clickCallback);
    window.addEventListener("keyup", callback, true);
    reloadRequiredInstance.on(
      InfinitelyEvents.editor.require,
      reloadRequiredCallback
    );
    // editor.on("canvas:frame:load:body", cb);
    return () => {
      // editor.off("canvas:frame:load:body", cb);
      window.removeEventListener("keyup", callback, true);
      reloadRequiredInstance.off(
        InfinitelyEvents.editor.require,
        reloadRequiredCallback
      );
    };
  }, [editor]);

  /**
   *
   * @param {MouseEvent} ev
   */
  const undo = (ev) => {
    // editor.runCommand("core:undo");
    if (Object.values(shows).includes(true)) {
      window.undo();
      console.log("undoo ", window.undo);

      return;
    }
    editor.UndoManager.undo();
  };

  /**
   *
   * @param {MouseEvent} ev
   */
  const redo = (ev) => {
    // editor.runCommand("core:redo");
    if (Object.values(shows).includes(true)) {
      window.redo();
      console.log("redoo ", window.redo);

      return;
    }
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
          // cleanMotions()
          // console.log("motions : ", await cleanMotions(projectData.motions, projectData.pages),);
          const projectData = await getProjectData();
          const pageName = localStorage.getItem(current_page_id);
          const motions = filterMotionsByPage(
            await cleanMotions(projectData.motions, projectData.pages, {
              [pageName]: editor.getWrapper().getInnerHTML({ withProps: true }),
            }),
            pageName
          );
          console.log("motions : ", motions);
          killAllGsapMotions(motions);
          runAllGsapMotions(motions);
          editor.gsapRunning = true;
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
          const projectData = await getProjectData();
          const pageName = localStorage.getItem(current_page_id);
          const motions = filterMotionsByPage(
            await cleanMotions(projectData.motions, projectData.pages, {
              [pageName]: editor.getWrapper().getInnerHTML({ withProps: true }),
            }),
            pageName
          );
          console.log("filterd motions : ", motions);

          killAllGsapMotions(motions);
          editor.gsapRunning = false;
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
          // editor.off("component:remove:before");
          console.log("reloading");

          window.dispatchEvent(new CustomEvent("clear:script"));
          editor.off();
          // editor.destroy();
          setTimeout(() => {
            location.replace(location.href);
          }, 0);
        }}
        title="Reload Canvas"
        notify={reloadRequired}
        notifyBg="bg-[crimson]"
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
