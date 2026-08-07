import { uniqueId } from "lodash";

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
 * @type {import('@/helpers/types').InfinitelyBlock[]}
 */
export let blocksType;

/**
 * @type {import('@/helpers/types').InfinitelyBlock}
 */
export let blockType;

/**
 * @type {{[key:number]:string[]}}
 */
export let stateType = { 0: [] };

/**
 * @type {import('@/helpers/types').StatesType[]}
 */
export let statesType = [];

/**
 * @type {CSSStyleDeclaration}
 */
export let animeStylesType = {};

/**
 * @type {{name:string , values : {percentage:number , styles:CSSStyleDeclaration}[]}[]}
 */

/**
 *  @type {import('css').KeyFrames}
 */
export let animationType = {};

/**
 * @type {import('css').KeyFrames[]}
 */
export let animationsType = [];

/**
 * @type {{[key:string]:[...animationsType]}}
 */
export let keyframesWithPathesType = {};

/**
 * @type {{editorKeyframes:[...animationsType] , libsKeyframes:{[key:string]:[...animationsType]}}}
 */
export let keyframesType = {};

/**
 * @type {import('@/helpers/types').InfinitelyTrait[]}
 */
export let traitsType = [];

/**
 * @type {import('@/helpers/types').CMD[]}
 */
export let cmdType = [];

/**
 * @type {{name : string , value : any}[]}
 */
export let varType = [];

/**
 * @type {import('@/helpers/types').InfinitelyPage[]}
 */
export let pagesType = [];

/**
 * @type {{[key:string : import('@/helpers/types').InfinitelyPage]}}
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
 * @type {import('@/helpers/types').RestAPIModel[]}
 */
export let restModelType = [];

/**
 * @type {import('grapesjs').Component}
 */
export let sharedLayerType = null;

/**
 * @type {{[key:string] : import('@/helpers/types').DynamicTemplatesType}}
 */
export let dynamicTemplatesType = {};

/**
 * @type {import('@/helpers/types').DynamicAttributes}
 */
export let dynamicAttributesType = {};

/**
 * @type {import('@/helpers/types').CMDSContext}
 */
export let cmdsContextType = { params: [], vars: {}, objectskeys: {} };

/**
 * @type {import('@/helpers/types').ProjectData}
 */
export let projectDataType = {
  templates: {},
  dynamicTemplates: {},
  cssLibraries: [],
  jsLibraries: [],
  restAPIModels: [],
};

/**
 * @type {import('@/helpers/types').Project}
 */
export let projectType = {};

/**
 * @type {import('@/helpers/types').Project[]}
 */
export let projectsType = [];

/**
 * @type {import('@/helpers/cocktail').CocktailDB}
 */
export let IDBType = null;

/**
 * @type {import('@/helpers/types').JSLibrary}
 */
export let JSLibraryType = {};

/**
 * @type {import('@/helpers/types').JSLibrary[]}
 */
export let JSLibrariesType = [];

/**
 * @type {{name:string , content:string , dataUrl : string}[]}
 */
export let filesListType = [];

/**
 * @type {import('@/helpers/types').GoogleFontsSchema}
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
 * @type {import('@/helpers/types').GlobalSettings}
 */
export let globalSettingsType = {
  autoSave: true,
  saveDelay: 1000,
};

/**
 * @type {import('@/helpers/types').ProjectSetting}
 */
export let projectSettingsType = {
  minify_Css: true,
  minify_Js: true,
  navigate_to_style_when_Select: true,
  // transform_Image_To_Webp: false,
  excute_commands_after_page_load: true,
  delete_symbols_after_delete_from_page: false,
  grap_all_footer_scripts_in_single_file: false,
  grap_all_header_scripts_in_single_file: false,
  grap_all_css_libs_in_single_file: false,
  is_async_graped_footer_script: false,
  is_async_graped_header_script: false,
  is_defer_graped_footer_script: false,
  is_defer_graped_header_script: false,
  disable_gsap_core: false,
  disable_gsap_scrollTrigger: false,
  disable_gsap_splitText: false,
  enable_prettier_for_file_editor: true,
  include_canvas_styles_in_build_file: true,
  disable_petite_vue: false,
  disable_will_change_in_editor: false,
  enable_tailwind: false,
  enable_spline_viewer: false,
  enable_swiperjs: false,
  enable_editor_lazy_loading: false,
  enable_auto_save: true,
  stop_all_animation_on_page: false,
  remove_gsap_markers_on_build: true,
  optimize_outlines:false,
  // purge_css: false,
  include_symbols_in_export: true,
  include_templates_in_export: true,
};

/**
 * @type {import('@/helpers/types').DropBoxFilesMeta}
 */
export let dropBoxFilesMeta = [];

/**
 * @type {import('grapesjs').Component}
 */
export let componentType;

/**
 * @type {import('@/helpers/types').PageHelmet}
 */
export let pageHelmetType = {};

/**
 * @type {import('@/helpers/types').InfinitelySymbol[]}
 */
export let symbolsType = [];

/**
 * @type {import('@/helpers/types').InfinitelyBlock[]}
 */
export let blocksArrayType = [];

/**
 * @type {import('react-tooltip').TooltipRefProps}
 */
export let tooltipDataType = {};

/**
 * @type {import('@/helpers/types').MotionType}
 */
export let motionType = {
  id: "",
  isTimeLine: false,
  name: "",
  numberTimeOfUses: 1,
  pages: [],
  instances: {},
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
 * @type {File}
 */
export let assetType = {};

/**
 * @type {import('@/helpers/types').InfinitelyAsset[]}
 */
export let assetsType = [];

/**
 * @type {import('@/helpers/types').MotionAnimationType}
 */
export let motionAnimationType = {};

/**
 * @type {import('@/helpers/types').StorageDetails}
 */
export let storageDetailsType = {
  filsLength: 0,
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
};

/**
 * @type {import('@/helpers/types').Interaction}
 */
export let interactionType = {};

/**
 * @type {import('@/helpers/types').Interactions}
 */
export let interactionsType = [];

/**
 * @type {import('@/helpers/types').InteractionsInDB}
 */
export let interactionInDBType = {};

export let detectedType = {
  desktop: [],
  tablet: [],
  mobile: [],
  others: [],
};

/**
 * @type {import('@/helpers/types').InfinitelyRules}
 */
export let cmpRules = [];

/**
 * @type {import('@/helpers/types').ShowProps}
 */
export let undoRedoShowProps = {
  motionBuilder: false,
  interactionsBuilder: false,
  commandsBuilder: false,
  stylesBuilder: false,
  attributesBuilder: false,
  animationBuilder: false,
};

/**
 * @type {import('@/helpers/types').WpPage}
 */
export let wp_page = {}

/**
 * @type {import('@/helpers/types').WpPages}
 */
export let wp_pages = []
