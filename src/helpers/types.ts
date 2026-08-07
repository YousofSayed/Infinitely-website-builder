import { wpCommands } from "@/helpers/wp_commands_worker";
import {
  EditorProps,
  Monaco,
  MonacoDiffEditor,
  OnChange,
  OnMount,
} from "@monaco-editor/react";
import type * as CSS from "csstype";
import type { Editor, Component as GjsComponent } from "grapesjs";
import { HTMLButtonElement } from "linkedom";
import type { JSX } from "react";

export type gradientValues = {
  direction: string;
  type: "linear" | "radial";
  colors: [
    {
      color: string;
      opacity: string;
    },
  ];
}[];






type CSSProperties = CSS.PropertiesHyphen; // ✅ dash-case CSS properties

export type InfinitelyStyle = {
  type:
  | "property"
  | "select"
  | "choose"
  | "color"
  | "multi-choice"
  | "multi-function-prop"
  | "multi-values-for-single-prop"
  | "directions"
  | "title"
  | "custom";
  cssProp: keyof CSSProperties | (keyof CSSProperties)[];
  title?: string;
  placeholder?: string;
  keywords?: string[];
  units?: {};
  Component?: ({
    editor,
    cssProp,
    value,
  }: {
    editor: Editor;
    cssProp: keyof CSSProperties | (keyof CSSProperties)[];
    value: string;
  }) => JSX.Element;
  splitHyphen?: boolean;
  choices?: { choice: string; Icon: JSX.Element }[];
  separator?: string;
  special: boolean;
  directions?: {
    tProp: keyof CSSProperties;
    rProp: keyof CSSProperties;
    bProp: keyof CSSProperties;
    lProp: keyof CSSProperties;
  };
};

export type InfinitelyStyles = {
  [key: string]: InfinitelyStyle[];
};

export type InfinitelyRule = {
  id: string;
  rule: string;
  fullRule: string | null;
  styles: {};
  states: string | null;
  statesAsArray: never[] | RegExpMatchArray | null;
  atRuleType: string | null;
  atRuleParams: string | null;
};

export type InfinitelyRules = {
  id: string;
  rule: string;
  fullRule: string | null;
  styles: {};
  states: string | null;
  statesAsArray: never[] | RegExpMatchArray | null;
  atRuleType: string | null;
  atRuleParams: string | null;
}[];

export type Animations = {
  name: string;
  values: { percentage: number; styles: CSSStyleDeclaration }[];
}[];

export type TraitCallProps = {
  editor: Editor;
  trait: InfinitelyTrait;
  traits?: InfinitelyTrait[];
  oldValue: string;
  newValue: string;
  asset: InfinitelyAsset | InfinitelyWpMedia | undefined;
  mediaBreakpoint: number;
  model: Component;
};

export type TraitCallback = ({
  editor,
  trait,
  oldValue,
  newValue,
  asset,
  mediaBreakpoint,
  model,
  props: { },
}: TraitCallProps) => void;

export type InfinitelyTrait = {
  type:
  | "text"
  | "select"
  | "textarea"
  | "media"
  | "button"
  | "switch"
  | "custom"
  | "object"
  | "add-props";
  // propsType: "text" | "code";
  //For add-props type
  addPropsInputType: "text" | "code";
  addPropsCodeLanguage: "html" | "javascript" | "css";
  //End
  //For Textarea and Code
  onMountHandler: OnMount;
  onChangeHandler: OnChange;
  codeEditorProps: EditorProps;
  //End
  label: string;
  name: string;
  allowToSetTraitValueToEditor: boolean;
  unit: string;
  step: number;
  value: string;
  default: string;
  placeholder: string;
  category: string;
  changeProp: boolean;
  showMediaBreakpoint: boolean;
  stateProp: any;
  options: string[];
  ext: string;
  keywords:
  | string[]
  | (({ projectData }: { projectData: Project }) => string[]);
  command: string;
  component: import("react").JSX.Element;
  textareaLanguage: string;
  allowCmdsContext: boolean;
  callback: TraitCallback;
  deleteCallback: TraitCallback;
  hint: TraitCallback | string;
  init: ({
    editor,
    trait,
    model,
    mediaBreakpoint,
  }: {
    editor: import("grapesjs").Editor;
    trait: InfinitelyTrait;
    model: Component;
    mediaBreakpoint: number;
  }) => void;
  onSwitch: (value: boolean) => void;
  buttonEvents: (
    handlers: TraitCallProps,
  ) => import("react").HTMLAttributes<HTMLButtonElement>;
  showCallback: (trait: TraitCallProps) => boolean;
  hideCallback: (trait: TraitCallProps) => boolean;
  nestedKeys: string[];
  isChild: boolean;
  role: "attribute" | "handler";
  mediaType?: "image" | "video" | "audio";
  bindToAttribute: boolean;
};

export interface StatesType {
  id: string;
  rule: string;
  states: string | null;
  atRuleType: string | null;
  atRuleParams: string | null;
  statesAsArray: string[];
}
[];
// document.addEventListener()

export interface Action {
  name: string;
  label: string;
  placeholder: string;
  params: { [key: string]: string };
  function: string;
  access: {
    [key: string]: {
      keyframes: boolean;
    };
  };
}

export type Actions = Action[];

export interface Interaction {
  name: string;
  id: string | number;
  event: keyof ElementEventMap;
  actions: Actions;
  attr_for_wp: Record<string, string>;
  instances: {
    [key: string]: {
      id: string;
      page: string;
      attr_for_wp: Record<string, string>;
    };
  };
  // onInteractionSelected: (component: Component) => void;
  // onInteractionUnSelected: (component: Component) => void;
}

export type Interactions = Interaction[];
export type InteractionsInDB = {
  [key: string]: Interactions;
};
export interface CMD {
  cmd: string;
  desc: string;
  ex: string;
  name: string;
  id: string;
  starter: boolean;
  ender: boolean;
  baseline: boolean;
  options: {
    [key: string]: string;
  };
  optionsRequired: boolean;
  optionValue: string;
  shouldHaveEnder: boolean;
  params: {
    name: string;
    type: "text" | "select" | "object" | "array" | "number" | "code";
    role:
    | "normal"
    | "varName"
    | "varValue"
    | "className"
    | "classValue"
    | "params"
    | "eventName"
    | "forVarName"
    | "forVarIndex";
    value: string | object | string[];
    keywords?: string[];
    lang: "html" | "javascript" | "css";
    handler: boolean;
    accessVars: boolean;
    accessFunctions: boolean;
    accessParams: boolean;
    accessEvents: boolean;
    accessAll: boolean;
    accessRestVars: boolean;
    accessCssClasses: boolean;
    required: boolean;
    isTextarea: boolean;
    isCode: boolean;
    isTemplateEngine: boolean;
    removeCurlyBrackets: boolean;
    renderDynamicElement: boolean;
    dynamicTemplateId: string;
  }[];
}

export interface Directive {
  directive: string;
  name: string;
  id: string;
  type: "object" | "code" | "array" | "multi" | "select" | "check";
  // inputType: "object" | "code" | "array" | "multi" | "select";
  nestedInputType: "select" | "code" | "input";
  nestedCodeLang: "html" | "javascript" | "css";
  nestedInputKeywords: string[];
  nestedMaybeObjectModel: boolean;
  codeLang: "html" | "javascript" | "css";
  suffixes: string[];
  modifiers: string[];
  isSuffixRequired: boolean;
  isModifiersRequired: boolean;
  isValueRequired: boolean;
  valueInputType: "code" | "select";
  valueKeyowrds: string[];
  keywordsFroSelect: string[];
  preventDefault: boolean;
  preventNestedDefault: boolean;
  selectedSuffixes: string[];
  selectedModifiers: string[];
  value: string;
  suffixValue: string;
  modifierValue: string;
  showInAllComponents: boolean;
  callback: ({
    value,
    suffix,
    modifiers,
    editor,
    callback,
  }: {
    value: string;
    suffix: string;
    modifiers: string[];
    editor: import("grapesjs").Editor;
    callback: () => void;
  }) => void;

  nestedCallback: ({
    targetAttribute,
    value,
    modifier,
    editor,
    callback,
  }: {
    targetAttribute: string;
    value: string;
    modifier: string;
    editor: import("grapesjs").Editor;
    callback: () => void;
  }) => void;
}

export interface RestAPIModel {
  method: string;
  url: string;
  name: string;
  varName: string;
  headers: HeadersInit;
  body: BodyInit;
  response: string;
  id: string;
}

export interface DynamicTemplatesType {
  img: string;
  cmp: Blob;
  cmpElId: string;
  id: string;
  imgSrc: Blob;
  parentRules: string[];
  cmds: { [key: string]: CMD[] };
  blockId: string;
  childsRules: { [key: string]: string[] };
  cmpChilds: string;
  allRules: Blob;
  jsonCmp: string;
}

export interface DynamicAttributes {
  [key: string]: {
    isShow: boolean;
    value: string;
    lastDynamicValue: string;
  };
}

export interface LibraryConfig {
  fileUrl: string;
  content: string;
  dataUrl: string;
  name: string;
  nameWithoutExt: string;
  description: string;
  version: string;
  isLocal: boolean;
  isCDN: boolean;
  isLocalAsset: boolean;
  localAssetId: string;
  file: File;
  type: "js" | "css";
  id: string;
  header: string;
  footer: string;
  async: boolean;
  defer: boolean;
  globalName: string;
  typesPath: string;
  jsType: string;
  sort: number;
  path: string;
  size: number;
}

type Component = import("grapesjs").Component;

export type JSONComponent = {
  tagName: string;
  classes: string[];
  attributes: { [key: string]: string };
  components: { classes: string[]; attributes: { [key: string]: string } };
  // [
  //   {
  //     classes: ["col"];
  //     attributes: {
  //       "inf-bridge-id": "MjQwNA";
  //       "inf-symbol-instance-id-mjyynw": "MjQwNA";
  //     };
  //   },
  //   {
  //     classes: ["col"];
  //     attributes: {
  //       "inf-bridge-id": "MjMzNg";
  //       "inf-symbol-instance-id-mjyynw": "MjMzNg";
  //     };
  //   },
  //   {
  //     classes: ["col"];
  //     attributes: {
  //       "inf-bridge-id": "MjcyMA";
  //       "inf-symbol-instance-id-mjyynw": "MjcyMA";
  //     };
  //   }
  // ];
};

export type PageHelmet = {
  title: string;
  // icon: Blob;
  description: string;
  author: string;
  keywords: string;
  robots: string;
  customMetaTags: Blob;
};

export type InfinitelyPage = {
  html: Blob | undefined;
  css: Blob | undefined;
  js: Blob | undefined;
  pathes: {
    html: string;
    css: string;
    js: string;
  };
  libs: {
    css: LibraryConfig[];
    jsHeader: LibraryConfig[];
    jsFooter: LibraryConfig[];
  };
  fonts: {
    [key: string]: InfinitelyFont;
  };
  cmds: { [key: string]: CMD[] };
  components: Component[];
  id: string;
  name: string;
  symbols: string[];
  bodyAttributes: {};
  helmet: PageHelmet;
  need_publish_to_wp?: boolean | undefined;
  // wp_page_meta:Wp_Page_Meta
};

export type InfinitelyWpPage = {
  libs: {
    css: LibraryConfig[];
    jsHeader: LibraryConfig[];
    jsFooter: LibraryConfig[];
  };
  fonts: {
    [key: string]: InfinitelyFont;
  };
  components: Component[];
  id: number | string;
  name: string;
  symbols: string[];
  bodyAttributes: {};
  helmet: PageHelmet;
  rest_base: string;
  js: string | Blob;
  css: string | Blob;
  motions: string | Blob;
  tailwind: string | Blob;
  type: string;
  date: string;
  need_publish_to_wp?: boolean | undefined;
  url: string;
  title: string;
  slug: string;
  modified: string;
  source_url: string;
  media_type: string;
  mime_type: string;
  author: string;
  meta: string;
  featured_media: string;
  comment_status: string;
  ping_status: string;
  template: string;
  // wp_page_meta:Wp_Page_Meta
};

export type AppType = "normal" | 'wordpress';

export type InfinitelyBlock = {
  name: string;
  label: string;
  id: string;
  media: Blob;
  content: Blob;
  style: Blob;
  pathes: {
    content: string;
    style: string;
  };
  type: "symbol" | "template";
  category: string;
};

export type InfinitelySymbol = {
  name: string;
  label: string;
  id: string;
  media: Blob;
  content: Blob;
  style: Blob;
  pathes: {
    content: string;
    style: string;
  };
  type: "symbol" | "template";
  category: string;
};

export type InfinitelyAsset = {
  buildUrl: string;
  file: File;
  blobUrl: string;
  dataUrlSrc: string;
  id: number;
};

export type InfinitelyFont = {
  name: string;
  id: string;
  url: string;
  file: File;
  fromat: string;
  isCDN: boolean;
  isLocalAsset: boolean;
  localAssetId: string;
  path: string;
};

export type InfinitelyFonts = {
  [key: string]: InfinitelyFont & InfinitelyWpMedia;
};

export type InfinitelyWpMedia = {
  id: number;
  date: string; // ISO date string
  date_gmt: string; // ISO date string
  guid: {
    rendered: string;
  };
  modified: string; // ISO date string
  modified_gmt: string; // ISO date string
  slug: string;
  status: string; // e.g. "inherit"
  type: string; // e.g. "attachment"
  link: string;
  svg_content: string | null;
  title: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  comment_status: string; // "open" | "closed"
  ping_status: string; // "open" | "closed"
  template: string;
  meta: {
    inf_meta: unknown[];
    inf_template_type: string;
  };
  class_list: string[];
  inf_meta: unknown[];
  description: {
    rendered: string; // HTML string
  };
  caption: {
    rendered: string; // HTML string
  };
  alt_text: string;
  media_type: string; // e.g. "file"
  mime_type: string; // e.g. "application/octet-stream"
  media_details: {
    filesize: number;
    sizes: Record<string, unknown>; // empty object in your example
  };
  post: number | null;
  source_url: string;
  _links: {
    self: Array<{
      href: string;
      targetHints?: {
        allow: string[];
      };
    }>;
    collection: Array<{
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
    author: Array<{
      embeddable: boolean;
      href: string;
    }>;
    replies: Array<{
      embeddable: boolean;
      href: string;
    }>;
  };
};

export type GrapesJSComponent = {
  tagName: string;
  attributes?: Record<string, string>;
  children?: GrapesJSComponent[]; // recursive for nested elements
  content?: string; // optional text content
};

export type InfinitelyPageMetaConfig = {
  html: GrapesJSComponent[]; // top-level components
  css: string;
  js: string;
  bodyAttributes?: Record<string, string>;
  motions: { [key: string]: MotionType };
  interactions: InteractionsInDB;
};

export type InfinitelyPageMeta = {
  before_save: InfinitelyPageMetaConfig | null;
  saved: InfinitelyPageMetaConfig | null;
};

export type Wp_Meta = {
  website_url: string;
  username: string;
  password: string;
  app_password: string;
};

export interface Project {
  id: number;
  name: string;
  app_type: "normal" | "wordpress";
  wp_meta: Wp_Meta;
  description: string;
  imgSrc: string;
  logo: Blob | string | undefined;
  jsHeaderLibs: LibraryConfig[];
  jsFooterLibs: LibraryConfig[];
  cssLibs: LibraryConfig[];
  colors: string[];
  blocks: {
    [key: string]: InfinitelyBlock;
  };
  symbolBlocks: { name: string; media: string; id: string; category: string }[];
  restAPIModels: RestAPIModel[];
  dynamicTemplates: { [key: string]: DynamicTemplatesType };
  assets: InfinitelyAsset[];
  pages: { [key: string]: InfinitelyPage };
  symbols: { [key: string]: InfinitelySymbol };
  globalCss: string | Blob;
  globalJs: string | Blob;
  globalRules: {
    [ruleKey: string]: import("grapesjs").CssRule;
  };
  fonts: InfinitelyFonts;
  motions: { [key: string]: MotionType };
  apps: "Dropbox";
  dropboxFileMeta?: DropBoxFileMeta;
  dbx_pull_requried?: boolean;
  interactions: InteractionsInDB;
  inited: boolean;
  installStates: {
    types: boolean;
    globalTypes: boolean;
    fonts: boolean;
    jsHeaderLibs: boolean;
    jsFooterLibs: boolean;
    cssLibs: boolean;
  };

  devices: import("grapesjs").DeviceProperties[];
  lastScreenshot: Date | string;
}

export interface WpProject {
  id: number;
  name: string;
  app_type: "normal" | "wordpress";
  wp_meta: Wp_Meta;
  description: string;
  logo: Blob | string | undefined;
  jsHeaderLibs: LibraryConfig[] | InfinitelyWpMedia[];
  jsFooterLibs: LibraryConfig[] | InfinitelyWpMedia[];
  cssLibs: LibraryConfig[] | InfinitelyWpMedia[];
  colors: string[];
  scripts_need_to_publish: boolean;
  scripts_need_arranged: boolean;
  blocks: {
    [key: string]: InfinitelyBlock;
  };
  mainEditorScripts: {
    header: InfinitelyWpMedia[];
    footer: InfinitelyWpMedia[];
  };
  mainEditorStyles: InfinitelyWpMedia[];
  symbolBlocks: { name: string; media: string; id: string; category: string }[];
  restAPIModels: RestAPIModel[];
  dynamicTemplates: { [key: string]: DynamicTemplatesType };
  assets: InfinitelyAsset[];
  currentEditingPage: InfinitelyWpPage;
  current_inf_meta: {
    before_save: InfinitelyWpPage;
    saved: InfinitelyWpPage;
  };
  symbols: { [key: string]: InfinitelySymbol };
  globalCss: string | Blob | InfinitelyWpMedia;
  globalJs: string | Blob | InfinitelyWpMedia;
  globalRules: {
    [ruleKey: string]: import("grapesjs").CssRule;
  };
  fonts: InfinitelyFonts;
  motions: { [key: string]: MotionType };
  apps: "Dropbox";
  dropboxFileMeta?: DropBoxFileMeta;
  dbx_pull_requried?: boolean;
  interactions: InteractionsInDB;
  inited: boolean;
  minified_js: InfinitelyWpMedia;
  minified_css: InfinitelyWpMedia;
  projectSetting: ProjectSetting;
  installStates: {
    types: boolean;
    globalTypes: boolean;
    fonts: boolean;
    jsHeaderLibs: boolean;
    jsFooterLibs: boolean;
    cssLibs: boolean;
  };
  before_save: WpProject | null;
  save_state: "before_save" | "save";
  devices: import("grapesjs").DeviceProperties[];
  lastScreenshot: Date | string;
}

export type GlobalSettings = {
  direction: "rtl" | "ltr";
  autoSave: boolean;
  saveDelay: number;
};

export type ProjectSetting = {
  minify_Css: boolean;
  minify_Js: boolean;
  transform_Image_To_Webp: boolean;
  navigate_to_style_when_Select: boolean;
  // excute_commands_after_page_load: boolean;
  delete_symbols_after_delete_from_page: boolean;
  grap_all_css_libs_in_single_file: boolean;
  grap_all_header_scripts_in_single_file: boolean;
  grap_all_footer_scripts_in_single_file: boolean;
  disable_petite_vue: boolean;
  disable_gsap_core: boolean;
  disable_gsap_scrollTrigger: boolean;
  disable_gsap_splitText: boolean;
  disable_will_change_in_editor: boolean;
  enable_prettier_for_file_editor: boolean;
  is_async_graped_header_script: boolean;
  is_defer_graped_header_script: boolean;
  is_async_graped_footer_script: boolean;
  is_defer_graped_footer_script: boolean;
  enable_editor_lazy_loading: boolean;
  enable_auto_save: boolean;
  enable_tailwind: boolean;
  enable_spline_viewer: boolean;
  enable_swiperjs: boolean;
  remove_gsap_markers_on_build: boolean;
  stop_all_animation_on_page: boolean;
  // include_canvas_styles_in_build_file: boolean;
  optimize_outlines: boolean;
  purge_css: boolean;
  include_symbols_in_export: boolean;
  include_templates_in_export: boolean;
};

export interface JSLibrary {
  name: string;
  latest: string;
  filename: string;
  description: string;
  version: string;
  fileType: string;
  file?: File;
  github: {
    user: string;
    repo: string;
    stargazers_count: number;
    forks: number;
    subscribers_count: number;
  };
}

export interface GoogleFontsSchema {
  kind: string;
  items: {
    family: string;
    variants: string[];
    subsets: string[];
    version: string;
    lastModified: string;
    files: {
      [key: string]: string;
    };
    category: string;
    kind: string;
    menu: string;
  }[];
}

export type DropBoxFileMeta = {
  [".tag"]: string;
  client_modified: string;
  content_hash: string;
  id: string;
  is_downloadable: boolean;
  name: string;
  path_display: string;
  path_lower: string;
  rev: string;
  server_modified: Date;
  size: number;
};

export type DropBoxFilesMeta = {
  [".tag"]: string;
  client_modified: string;
  content_hash: string;
  id: string;
  is_downloadable: boolean;
  name: string;
  path_display: string;
  path_lower: string;
  rev: string;
  server_modified: Date;
  size: number;
}[];

export type GlobalSymbolRule = {
  ruleName: string;
  currentSelector: string;
  states: string;
  media: { atRuleType?: string | undefined; atRuleParams?: string | undefined };
};

export type MotionAnimationType = {
  selector: string;
  name: string;
  from: CSSStyleDeclaration;
  to: CSSStyleDeclaration;
  useSameFromOptions: boolean;
  useSameToOptions: boolean;
  useSameFromScrollTrigger: boolean;
  useSameToScrollTrigger: boolean;
  positionParameter: string | number;
  fromOptions: {
    singleOptions: { [key: string]: string[] };
    multiOptions: { [key: string]: string[] };
    isScrollTrigger: boolean;

    scrollTriggerOptions: {
      singleOptions: { [key: string]: string[] };
      multiOptions: { [key: string]: string[] };
    };
  };
  toOptions: {
    singleOptions: { [key: string]: string[] };
    multiOptions: { [key: string]: string[] };
    isScrollTrigger: boolean;

    scrollTriggerOptions: {
      singleOptions: { [key: string]: string[] };
      multiOptions: { [key: string]: string[] };
    };
  };

  // singleOptions:  { [key: string]: string[] };
  // multiOptions: { [key: string]: string[] };
};

export type WpCommands = keyof typeof wpCommands;

export type MotionType = {
  name: string;
  id: string;
  numberTimeOfUses: number;
  pages: string[];
  instances: {
    [key: string]: {
      id: string;
      page: string;
      script_for_wp: string;
    };
  };
  excludes?: string[];
  isTimeLine: boolean;
  isLoop : boolean;
  isSplitText: boolean;
  timeLineName: string;
  timeline: {};
  splitText: SplitText.Vars;
  splitTextSelector: string;
  splitTextName: string;
  isInstance: boolean;
  timeLineSingleOptions: {};
  timeLineMultiOptions: {};
  isTimelineHasScrollTrigger: boolean;
  timelineScrollTriggerOptions: {
    singleOptions: { [key: string]: string[] };
    multiOptions: { [key: string]: string[] };
  };
  animations: MotionAnimationType[];
  script_for_wp: string;
};

export type ShowProps = {
  motionBuilder: boolean;
  interactionsBuilder: boolean;
  commandsBuilder: boolean;
  stylesBuilder: boolean;
  attributesBuilder: boolean;
  animationBuilder: boolean;
};

export type StorageDetails = {
  usage: number;
  quota: number;
  qoutaPerProjectMB: number;
  qoutaPerProjectGB: number;
  usageInMB: number;
  quotaInMB: number;
  usageInGB: number;
  quotaInGB: number;
  availableSpaceInMB: number;
  availableSpaceInGB: number;
  isStorageFull: boolean;
  filesLength: number;
};

export interface BrandConfig {
  brandKey: string;
  brandName: string;

  logo: string;

  colors: {
    "brand-primary": string;

    "surface-main": string;
    "surface-secondary": string;
    "surface-tertiary": string;

    "text-primary": string;

    "border-default": string;
  };

  cursor: string;

  meta: {
    title: string;
    description: string;
  };
}

export type WpPage = {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: {
    footnotes: string;
  };
  class_list: string[];
  _links: {
    self: Array<{
      href: string;
      targetHints?: {
        allow: string[];
      };
    }>;
    collection: Array<{
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
    author: Array<{
      embeddable: boolean;
      href: string;
    }>;
    replies: Array<{
      embeddable: boolean;
      href: string;
    }>;
    "version-history": Array<{
      count: number;
      href: string;
    }>;
    "predecessor-version": Array<{
      id: number;
      href: string;
    }>;
    "wp:attachment": Array<{
      href: string;
    }>;
    curies: Array<{
      name: string;
      href: string;
      templated: boolean;
    }>;
  };
};

export type WpPages = WpPage[];
