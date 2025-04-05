export type gradientValues = {
  direction: string;
  type: "linear" | "radial";
  colors: [
    {
      color: string;
      opacity: string;
    }
  ];
}[];

export type Animations = {
  name: string;
  values: { percentage: number; styles: CSSStyleDeclaration }[];
}[];

export type PreviewData = {
  scripts: object;
  styles: object;
  html: string;
  css: string;
};

export type TraitCallback = ({
  editor,
  trait,
  oldValue,
  newValue,
}: {
  editor: import("grapesjs").Editor;
  trait: InfinitelyTrait;
  oldValue: string;
  newValue: string;
}) => void;

export type InfinitelyTrait = {
  type: "text" | "select" | "textarea" | "media";
  label: string;
  name: string;
  unit: string;
  step: number;
  value: string;
  default: string;
  placeholder: string;
  category: string;
  changeProp: boolean;
  options: string[];
  keywords: string[];
  command: string;
  callback: TraitCallback;
  role: "attribute" | "handler";
  mediaType?: "image" | "video" | "audio";
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

export interface CMDSContext {
  vars: {};
  params: string[][];
  objectsKeys: {};
  forIndexes: string[];
}

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
  type: "object" | "code" | "array" | "multi" | "select";
  // inputType: "object" | "code" | "array" | "multi" | "select";
  nestedInputType: "select" | "code" | "input";
  nestedCodeLang: "html" | "javascript" | "css";
  nestedInputKeywords: string[];
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
  description: string;
  version: string;
  isLocal: boolean;
  isCDN: boolean;
  file: File;
  type: "js" | "css";
  id: string;
  header: string;
  footer: string;
  async: boolean;
  defer: boolean;
  jsType: string;
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

export type InfinitelySymbol = {
  id: string;
  content: Blob;
  style: Blob;
  name: string;
  category: string;
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
  html: string | Blob;
  css: string | Blob;
  js: string | Blob;
  cmds: { [key: string]: CMD[] };
  components: Component[];
  id: string;
  name: string;
  symbols: string[];
  bodyAttributes:{},
  helmet: PageHelmet;
};

export type InfinitelyBlock = {
  name: string;
  label: string;
  id: string;
  media: Blob;
  content: Blob;
  style: Blob;
  type: "symbol" | "template";
  category: string;
};

// export interface ProjectData {
//   jsHeaderCDNLibraries: LibraryConfig[];
//   jsFooterCDNLibraries: LibraryConfig[];
//   jsHeaderLocalLibraries: LibraryConfig[];
//   jsFooterLocalLibraries: LibraryConfig[];
//   cssHeaderCDNLibraries: LibraryConfig[];
//   cssFooterCDNLibraries: LibraryConfig[];
//   cssHeaderLocalLibraries: LibraryConfig[];
//   cssFooterLocalLibraries: LibraryConfig[];
//   blocks: { [key: string]: import("grapesjs").Block };
//   symbolBlocks: { name: string; media: string; id: string; category: string }[];
//   restAPIModels: RestAPIModel[];
//   dynamicTemplates: { [key: string]: DynamicTemplatesType };
//   assets: {
//     url: string;
//     blob: Blob;
//     blobUrl: string;
//     dataUrlSrc: string;
//     id: string;
//   }[];
//   pages: { [key: string]: InfinitelyPage };
//   symbols: { [key: string]: InfinitelySymbol };
//   globalRules: {
//     [ruleKey: string]: import("grapesjs").CssRule;
//   };

//   fonts: {
//     [key: string]: {
//       name: string;
//       id: string;
//       url: string;
//       blob: Blob;
//       fromat: string;
//       dataUrl: string;
//       blobUrl: string;
//       content: string;
//       isCDN: boolean;
//     };
//   };
//   // gjsProjectData: {
//   //   pages: import("grapesjs").Page[];
//   //   symbols: import("grapesjs").Component[];
//   //   assets: import("grapesjs").Asset[];
//   //   dataSources: import("grapesjs").DataSource[];
//   // };
// }

export type InfinitelyAsset = {
  buildUrl: string;
  file: File;
  blobUrl: string;
  dataUrlSrc: string;
  id: string;
};

export type InfinitelyFont = {
  name: string;
  id: string;
  url: string;
  blob: Blob;
  file: File;
  fromat: string;
  dataUrl: string;
  blobUrl: string;
  content: string;
  isCDN: boolean;
};

export type InfinitelyFonts = {
  [key: string]: InfinitelyFont;
};

export interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  imgSrc: string;
  logo: Blob;
  jsHeaderLibs: LibraryConfig[];
  jsFooterLibs: LibraryConfig[];
  cssLibs: LibraryConfig[];

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
  excute_commands_after_page_load: boolean;
  delete_symbols_after_delete_from_page: boolean;
  grap_all_css_libs_in_single_file: boolean;
  grap_all_header_scripts_in_single_file: boolean;
  grap_all_footer_scripts_in_single_file: boolean;
  disable_petite_vue: boolean;
  enable_prettier_for_file_editor: boolean;
  is_async_graped_header_script: boolean;
  is_defer_graped_header_script: boolean;
  is_async_graped_footer_script: boolean;
  is_defer_graped_footer_script: boolean;
  include_canvas_styles_in_build_file:boolean;
  purge_css: boolean;
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

export type GlobalSymbolRule = {
  ruleName: string;
  currentSelector: string;
  states: string;
  media: { atRuleType?: string | undefined; atRuleParams?: string | undefined };
};
