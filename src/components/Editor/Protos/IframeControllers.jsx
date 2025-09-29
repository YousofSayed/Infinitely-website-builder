import React, { useEffect, useRef, useState } from "react";
import { Li } from "../../Protos/Li";
import { Icons } from "../../Icons/Icons";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  animationsState,
  isAnimationsChangedState,
  reloaderState,
  showAnimationsBuilderState,
  showLayersState,
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
import { infinitelyCallback } from "../../../helpers/bridge";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
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
  const [reloadRequired, setReloadRequired] = useState(false);
  useEffect(() => {
    if (!editor) return;
    // const cb = () => {
    //   isEditorLoad.current = false;
    //   editor?.Canvas?.getBody?.()?.setAttribute("loaded", true);
    //   console.log("i should load");
    // };
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
    window.addEventListener("keyup", callback, { capture: true });
    reloadRequiredInstance.on(
      InfinitelyEvents.editor.require,
      reloadRequiredCallback
    );
    // editor.on("canvas:frame:load:body", cb);
    return () => {
      // editor.off("canvas:frame:load:body", cb);
      window.removeEventListener("keyup", callback, { capture: true });
      reloadRequiredInstance.off(
        InfinitelyEvents.editor.require,
        reloadRequiredCallback
      );
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
          killAllGsapMotions(await (await getProjectData()).motions);
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
          // console.log(editor?.Canvas?.getBody?.());
          // const body = editor?.Canvas?.getBody();
          // if (editor.infLoading || editor.canvasReload) {
          //   toast.warn(<ToastMsgInfo msg={`Wait until load end`} />);
          //   return;
          // }

          // const test = async () => {
          //   await editor.load();
          //   setTimeout(() => {
          //     test();
          //   }, 5000);
          // };

          // test();
          // window.stop()
          // document.documentElement.remove();
          // await editor.load();
          // navigate('/');
          // setReloader(uniqueId(`reloader-key-${uniqueID()}-`));
          // const ed = document.querySelector(`#editor-container`);
          // editor.Canvas.destroy();
          // ed.innerHTML = "";
          // ed.appendChild(editor.Canvas.render());

          // grapesjs.init(editor.getConfig());

          // editor.rqId && cancelIdleCallback(editor.rqId);
          // editor.rqId = requestIdleCallback(editor.load, { timeout: 5000 });
          //   const mainWrapperel = editor.getWrapper().getEl();
          //   const frame = editor.Canvas.getFrameEl();
          //   frame.contentDocument.addEventListener("DOMContentLoaded", () => {
          //    const newWrapperEl = editor.getWrapper().getEl();
          //    newWrapperEl.replaceWith(mainWrapperel);
          //    console.log(mainWrapperel , newWrapperEl);

          //  });
          //    frame.contentDocument.location.reload();
          // isEditorLoad.current = true;
          // editor.canvasReload = true;
          // editor.destroy();
          // await editor.Storage.load();
          // await editor.destroy();
          // editor.clearDirtyCount();

          ///////////////////
          // editor.loadProjectData({
          //   components: editor
          //     .getWrapper()
          //     .components()
          //     .models.concat(
          //       `<style>${editor.getCss({
          //         avoidProtected: true,
          //         keepUnusedStyles: false,
          //       })}</style>`
          //     ),
          // });
          // alert('Are you ok ?');
          // window.parent.resetAppMemory();

          editor.off("component:remove:before");
          // editor.load();
          window.location.reload();
          // window.parent.location.reload();
          // editor.off("canvas:frame:load");
          // editor.off("canvas:frame:load:body");
          // editor.off("canvas:frame:load:head");
          // editor.off("component:add");
          // editor.off("component:deselected");
          // editor.off("component:selected");
          // editor.off("component:create");
          // editor.off("component:mount");
          // editor.off("component:resize");
          // editor.off("component:toggled");
          // editor.off("component:clone");
          // editor.off("storage:load");
          // editor.off("storage:end:load");
          // editor.off("storage:start:load");
          // editor.off("storage:start");
          // window.open('/' , '_top')
          // infinitelyCallback(() => {

          //   // reloadEditor();
          //   // editor.load();
          //   // location.reload();
          //   editor.destroy();
          //   // reBuildApp()
          //   unMountApp()
          //   // window.open("/", "_self")
          // });
          // window.close()
          // requestIdleCallback(() => {
          //   unMountApp();
          //   window.parent.mountIframe(true);
          // });
          // setTimeout(() => {
          //   // unMountApp();
          //   window.parent.mountIframe(true);
          // }, 300);
          // editor.off("component:remove:before");
          // await editor.load();
          // location.reload();
          // setTimeout(() => {
          //   editor.off("component:remove:before");
          //   reBuildApp();
          // }, 350);
          // requestIdleCallback(
          //   () => {
          //   },
          //   { timeout: 5000 }
          // );
          // editor.Canvas.getFrame().addLink(
          //   "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          // );
          //           editor.Canvas.getFrames().forEach(frame => {
          //   frame.addLink("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
          // });
          // const frame = editor.Canvas.getFrameEl();
          // frame.contentDocument.location.reload();
          // frame.srcdoc = `<h1>Hellow world</h1>`
          // frame.replaceWith(editor.Canvas.render());
          // editor.render();

          // editor.
          // editor.setComponents(
          //   editor
          //     .getWrapper()
          //     .getInnerHTML({ withProps: true, keepInlineStyle: true }) +
          //     renderCssStyles(editor, editor.getCss({ keepUnusedStyles: true }))
          // );
          // editor.load();

          // editor.Canvas.getFrameEl().addEventListener("load", () => {
          //   console.log("wrapper : ", editor.getWrapper().getEl());

          //   // console.log('t : ',editor.t('hello world' , {hello:'lol'}));
          // });
          // editor.Canvas.getFrame().removeLink('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
          // editor.load();
          // const frame = editor.Canvas.getFrameEl?.();
          // if (!frame) return;
          // frame.contentDocument?.location?.reload?.();
          // await loadScripts(editor, await getProjectData());
          // editor.trigger("canvas:frame:load:body", {
          //   window: frame.contentWindow,
          //   el: frame,
          // });
          // const callback = () => {
          //   editor.canvasReload = false;
          //   editor.off("canvas:frame:load:body", callback);
          // };
          // editor.on("canvas:frame:load:body", callback);
          // editor.Canvas.getFrameEl?.().remove();
          // const init = editor.EditorModel.init;
          // let oldEditor = editor;
          // editor.destroy();
          // console.log(editor?.Canvas?.getFrameEl?.() , 'fraaaaaaaamee before');
          // init(oldEditor);
          // console.log(editor.Canvas.getFrameEl?.() , 'fraaaaaaaamee');

          // editor.Canvas.model.destroy()
          // editor.Canvas.destroy();
          // editor.Canvas.model.init()
        }}
        title="Reload Canvas"
        required={reloadRequired}
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
