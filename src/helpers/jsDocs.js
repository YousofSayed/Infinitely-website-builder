import { uniqueId } from 'lodash';

/**
 * @type {import('grapesjs').Editor}
 */
export let editorType;

/**
 * @type {HTMLElement}
 */
export let refType;

/**
 * @type {{current : HTMLElement}}
 */
export let currentRefType;

/**
 * @type {HTMLIFrameElement}
 */
export let iframeType;

/**
 * @type {import('./types').InfinitelyBlock[]}
 */
export let blocksType;

/**
 * @type {import('./types').InfinitelyBlock}
 */
export let blockType;

/**
 * @type {{[key:number]:string[]}}
 */
export let stateType = { 0: [] };

/**
 * @type {import('./types').StatesType[]}
 */
export let statesType = [];

/**
 * @type {CSSStyleDeclaration}
 */
export let animeStylesType = {};

/**
 * @type {{name:string , values : {percentage:number , styles:CSSStyleDeclaration}[]}[]}
 */
export let animationsType = Array.from([]);

/**
 * @type {import('./types').InfinitelyTrait[]}
 */
export let traitsType = [];

/**
 * @type {import('./types').CMD[]}
 */
export let cmdType = [];

/**
 * @type {{name : string , value : any}[]}
 */
export let varType = [];

/**
 * @type {import('./types').InfinitelyPage[]}
 */
export let pagesType = [];

/**
 * @type {{[key:string : import('./types').InfinitelyPage]}}
 */
export let dbPagesType = {};

/**
 * @type {ServiceWorker}
 */
export let swType;

/**
 * @type {import('grapesjs').Component[]}
 */
export let layersType = [];

/**
 * @type {import('./types').RestAPIModel[]}
 */
export let restModelType = [];

/**
 * @type {import('grapesjs').Component}
 */
export let sharedLayerType = null;

/**
 * @type {{[key:string] : import('./types').DynamicTemplatesType}}
 */
export let dynamicTemplatesType = {};

/**
 * @type {import('./types').DynamicAttributes}
 */
export let dynamicAttributesType = {};

/**
 * @type {import('./types').CMDSContext}
 */
export let cmdsContextType = { params: [], vars: {}, objectskeys: {} };

/**
 * @type {import('./types').ProjectData}
 */
export let projectDataType = {
  templates: {},
  dynamicTemplates: {},
  cssLibraries: [],
  jsLibraries: [],
  restAPIModels: [],
};

/**
 * @type {import('./types').Project}
 */
export let projectType = {};

/**
 * @type {import('./types').Project[]}
 */
export let projectsType = [];

/**
 * @type {import('./cocktail').CocktailDB}
 */
export let IDBType = null;

/**
 * @type {import('./types').JSLibrary}
 */
export let JSLibraryType = {};

/**
 * @type {import('./types').JSLibrary[]}
 */
export let JSLibrariesType = [];

/**
 * @type {{name:string , content:string , dataUrl : string}[]}
 */
export let filesListType = [];

/**
 * @type {import('./types').GoogleFontsSchema}
 */
export let googleFontsSchema = {};

/**
 * @type {{[key:string]:string}}
 */
export let googleFontFiles = {};

/**
 * @type {{name:string , id:string , dataUrl:string , url:string|null , isCDN:boolean}[]}
 */
export let uploadFontsType = [];

/**
 * @type {import('./types').GlobalSettings}
 */
export let globalSettingsType = {
  autoSave: true,
  saveDelay: 1000,
};

/**
 * @type {import('./types').ProjectSetting}
 */
export let projectSettingsType = {
  minify_Css: true,
  minify_Js: true,
  navigate_to_style_when_Select: true,
  transform_Image_To_Webp: false,
  excute_commands_after_page_load: true,
  delete_symbols_after_delete_from_page: false,
  grap_all_footer_scripts_in_single_file: false,
  grap_all_header_scripts_in_single_file: false,
  grap_all_css_libs_in_single_file: false,
  is_async_graped_footer_script: false,
  is_async_graped_header_script: false,
  is_defer_graped_footer_script: false,
  is_defer_graped_header_script: false,
  enable_prettier_for_file_editor: true,
  include_canvas_styles_in_build_file: true,
  disable_petite_vue: false,
  // purge_css: false,
};

/**
 * @type {import('grapesjs').Component}
 */
export let componentType;

/**
 * @type {import('./types').PageHelmet}
 */
export let pageHelmetType = {};

/**
 * @type {import('./types').InfinitelySymbol[]}
 */
export let symbolsType = [];

/**
 * @type {import('./types').InfinitelyBlock[]}
 */
export let blocksArrayType = [];

/**
 * @type {import('react-tooltip').TooltipRefProps}
 */
export let tooltipDataType = {};

/**
 * @type {import('./types').MotionType}
 */
export let motionType = {
  id: "",
  isTimeLine: false,
  name: "",
  numberTimeOfUses:1,
  pages:[],
  instances:{},
  timeLineSingleOptions: {},
  timeLineMultiOptions: {},
  isTimelineHasScrollTrigger: false,
  timelineScrollTriggerOptions: {
    multiOptions: {},
    singleOptions: {},
  },
  animations: [
    // {
    //   from: {},
    //   to: {},
    //   multiOptions: {},
    //   singleOptions: {},
    //   isScrollTrigger: false,
    //   scrollTriggerOptions: { multiOptions: {}, singleOptions: {} },
    // },
  ],
};

/**
 * @type {import('./types').InfinitelyAsset}
 */
export let assetType = {};

/**
 * @type {import('./types').InfinitelyAsset[]}
 */
export let assetsType = [];

/**
 * @type {import('./types').MotionAnimationType}
 */
export let motionAnimationType = {};

/**
 * @type {import('./types').StorageDetails}
 */
export let storageDetailsType = {
 usage: 0,
  quota: 0,
  qoutaPerProjectMB: 0,
  qoutaPerProjectGB: 0,
  usageInMB: 0,
  quotaInMB: 0,
  usageInGB: 0,
  quotaInGB: 0,
  availableSpaceInMB: 0,
  availableSpaceInGB: 0,
  isStorageFull: false,
}