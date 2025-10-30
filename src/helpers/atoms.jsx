import React from "react";
import { atom } from "recoil";
import {
  animationsType,
  animeStylesType,
  cmdsContextType,
  cmdType,
  cmpRules,
  dynamicTemplatesType,
  globalSettingsType,
  IDBType,
  projectDataType,
  projectSettingsType,
  projectsType,
  refType,
  restModelType,
  sharedLayerType,
  swType,
  tooltipDataType,
  varType,
} from "./jsDocs";
import { getGlobalSettings, getProjectSettings } from "./functions";
import { parse } from "./cocktail";

export const widths = atom({
  key: "widths",
  default: {
    leftAside: 300,
    rightAside: 300,
  },
});

export const cmpRulesState = atom({
  key: "cmpRules",
  default: cmpRules,
});

export const asideControllersNotifiresState = atom({
  key: "asideControllersNotifiresState",
  default: {
    commands: false,
    traits: false,
    interactions: false,
    motion: false,
    styling: false,
    elementAttributes: false,
  },
});

export const reloaderState = atom({
  key: "reloaderState",
  default: "",
});

export const popoverState = atom({
  key: "popoverState",
  default: {
    isOpen: false,
    parentWidth: 0,
    parentHeight: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    className: "",
    dependencies: [],
    content: <></>,
  },
});

export const popoverRefState = atom({
  key: "popoverRefState",
  default: refType,
});

export const searchWord = atom({
  key: "searchWord",
  default: "",
});

/**
 * @type {{[categoryName: string]: import('./types').InfinitelyBlock[];}}
 */
export let editorBlocksType = [];

export const blocksStt = atom({
  key: "blocks",
  default: editorBlocksType,
});

export const appInstallingState = atom({
  key: "appInstallingState",
  default: !Boolean(parse(localStorage.getItem("installed"))),
});

/**
 * @type {Document}
 */
let initValTypeDocument;
export const ifrDocument = atom({
  key: "iframeDocument",
  default: initValTypeDocument,
});

export const iframeWindow = atom({
  key: "iframeWindow",
  default: window,
});

export const mediaHandlerState = atom({
  key: "mediaHandlerState",
  default: {
    isMedia: false,
    mediaWidth: 0,
    mediaHeight: 0,
  },
});

export const undoAndRedoStates = atom({
  key: "undoAndRedoStates",
  default: {
    isStyle: false,
    isDropping: true,
  },
});

/**
 * @type {{iframe:HTMLIFrameElement , blocksStyle:HTMLStyleElement , [key:string]:HTMLElement}}
 */
let refsSttType = {};

export const refsStt = atom({
  key: "refs",
  default: refsSttType,
});

export const showOverlayIframState = atom({
  key: "showOverlay",
  default: false,
});

/**
 * @let
 * @type {{render:(children:React.ReactNode)=>void}}
 */
let render;

export const iframeRoot = atom({
  key: "iframeRoot",
  default: render,
});

/**
 * @let
 * @type {{currentEl:import('grapesjs').Component | HTMLElement , addStyle:({[cssProp:string]:string})}}
 */
let currentElType = {
  currentEl: null,
};
export const currentElState = atom({
  key: "currentEl",
  default: currentElType,
});

export const accorddingState = atom({
  key: "accorddingState",
  default: 0,
});

/**
 * @type {import('grapesjs').Editor}
 */
let editor;

export const editorStt = atom({
  key: "editor",
  default: editor,
});

let rule = { is: false, ruleString: "", atRuleType: null, atRuleParams: null };

export const ruleState = atom({
  key: "ruleState",
  default: rule,
});

export const showDragLayerState = atom({
  key: "showCanvasLayerState",
  default: false,
});

export const selectorState = atom({
  key: "selectorState",
  default: "",
});

export const showLayersState = atom({
  key: "showLayers",
  default: false,
});

export const cssPropForAssetsManagerState = atom({
  key: "cssPropForAssetsManagerState ",
  default: "",
});

export const assetTypeState = atom({
  key: `assetTypeState`,
  default: "",
});

export const modalDataState = atom({
  key: "modalDataState",
  default: {
    title: "",
    JSXModal: <section></section>,
    width: "80%",
    height: "auto",
  },
});

export const showAnimationsBuilderState = atom({
  key: "showAnimationsBuilderState",
  default: false,
});

export const animeStylesState = atom({
  key: "animeStyles",
  default: animeStylesType,
});

export const framesStylesState = atom({
  key: "framesValueState",
  default: animeStylesType,
});

export const showCustomModalState = atom({
  key: "showCustomModal",
  default: false,
});

export const previewContentState = atom({
  key: "previewContentState",
  default: {
    scripts: {},
    styles: {},
    html: "",
    css: "",
  },
});

export const showPreviewState = atom({
  key: "showPreviewState",
  default: false,
});

export const removeAllActivesState = atom({
  key: "removeAllActives",
  default: false,
});

export const cmdsBuildState = atom({
  key: `cmdsBuildState`,
  default: cmdType,
});

export const varsState = atom({
  key: `globalVarsState`,
  default: varType,
});

export const restModelState = atom({
  key: "restModelState",
  default: restModelType,
});

export const sharedLayerState = atom({
  key: "layerSharedState",
  default: sharedLayerType,
});

export const dynamicTemplatesState = atom({
  key: "dynamicTemplatesState",
  default: dynamicTemplatesType,
});

export const currentDynamicTemplateIdState = atom({
  key: "currentDynamicTemplateIdState",
  default: "",
});

export const cmdsContextState = atom({
  key: "cmdsContextState",
  default: "",
});

export const projectData = atom({
  key: "projectData",
  default: projectDataType,
});

export const IDBState = atom({
  key: "IDBState",
  default: IDBType,
});

// export const globalSettingsState = atom({
//   key: "globalSettingsState",
//   default:getProjectSettings().projectSettings //getGlobalSettings().globalSettings,
// });

export const projectSettingsState = atom({
  key: "projectSettings",
  default: getProjectSettings().projectSettings,
});

export const zoomValueState = atom({
  key: "zoomValueState",
  default: "",
});

export const tooltipDataState = atom({
  key: "tooltipDataState",
  default: tooltipDataType,
});

export const fileInfoState = atom({
  key: "fileInfoState",
  default: {
    path: "",
  },
});

export const restModelsVarsState = atom({
  key: "restModelsVars",
  default: [],
});

export const dbAssetsSwState = atom({
  key: "swState",
  default: swType,
});

export const animationsState = atom({
  key: "animationsState",
  default: animationsType,
});

export const animationsWillRemoveState = atom({
  key: "animationsWillRemove",
  default: animationsType,
});

export const isAnimationsChangedState = atom({
  key: "isAnimationsChanged",
  default: false,
});

//============Workspace==============
export const projectState = atom({
  key: "searchResultsState",
  default: projectsType,
});
export const showCrtModalState = atom({
  key: "showCrtModalState",
  default: false,
});

export const newProjectData = atom({
  key: "newProjectData",
  default: {
    name: "",
    descreption: "",
  },
});

export const isProjectInitedState = atom({
  key: "isProjectInitedState",
  default: true,
});
