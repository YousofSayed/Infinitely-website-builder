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
import type { JSX, ReactElement } from "react";

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
  props: {},
  innerCallback,
}: TraitCallProps & {
  props: {};
  innerCallback: TraitCallback;
}) => void;

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
  onBlur: (trait: TraitCallProps) => void;
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
  customMetaTags: Blob | string | undefined;
};

export type WpHelemet = {
  title: string;
  description: string;
  author: string;
  keywords: string;
  robots: string;
  customMetaTags: Blob | string | undefined;
  template: string;
  logo?: Blob | string;
  is_maintainance?: boolean;
};

export type WpPostType = "page" | "post";

export type WpPostMeta = Record<string, unknown>;

export type WpPost = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  name: string;
  type: WpPostType;
  featured_image: string | null;
  symbol_id: string | number | null;
  meta: WpPostMeta;
};

export type WpGetPostsResponse = {
  success: boolean;
  total: number;
  data: WpPost[];
  post_type: WpPostType;
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

export type AppType = "normal" | "wordpress";

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

export type WPQueryArgs = {
  // ============================================================
  // AUTHOR PARAMETERS
  // ============================================================

  author?: number;
  author_name?: string;
  author__in?: number[];
  author__not_in?: number[];

  // ============================================================
  // CATEGORY PARAMETERS
  // ============================================================

  cat?: number;
  category_name?: string;
  category__and?: number[];
  category__in?: number[];
  category__not_in?: number[];

  // ============================================================
  // TAG PARAMETERS
  // ============================================================

  tag?: string;
  tag_id?: number;
  tag__and?: number[];
  tag__in?: number[];
  tag__not_in?: number[];
  tag_slug__and?: string[];
  tag_slug__in?: string[];

  // ============================================================
  // TAXONOMY PARAMETERS
  // ============================================================

  taxonomy?: string;
  term?: string;

  tax_query?: WPTaxQuery[];

  // ============================================================
  // POST PARAMETERS
  // ============================================================

  p?: number;
  name?: string;
  page_id?: number;
  pagename?: string;

  post_parent?: number;
  post_parent__in?: number[];
  post_parent__not_in?: number[];

  post__in?: number[];
  post__not_in?: number[];

  post_name__in?: string[];

  post_type?: WPPostType | WPPostType[];
  post_status?: WPPostStatus | WPPostStatus[];

  // ============================================================
  // POST & PAGE PARAMETERS
  // ============================================================

  posts_per_page?: number;
  posts_per_archive_page?: number;
  nopaging?: boolean;

  posts_per_rss?: number;

  paged?: number;
  page?: number;

  offset?: number;

  // ============================================================
  // ORDERING PARAMETERS
  // ============================================================

  order?: WPOrder;

  orderby?: WPOrderBy | WPOrderBy[] | Record<string, WPOrder>;

  // ============================================================
  // DATE PARAMETERS
  // ============================================================

  year?: number;
  monthnum?: number;
  w?: number;
  day?: number;

  hour?: number;
  minute?: number;
  second?: number;

  m?: number;

  date_query?: WPDateQuery[];

  // ============================================================
  // CUSTOM FIELD / META PARAMETERS
  // ============================================================

  meta_key?: string;
  meta_value?: string | number | boolean | (string | number | boolean)[];

  meta_value_num?: number;

  meta_compare?: WPMetaCompare;

  meta_type?: WPMetaType;

  meta_query?: WPMetaQuery[];

  // ============================================================
  // PERMISSION PARAMETERS
  // ============================================================

  perm?: "readable" | "editable";

  // ============================================================
  // MIME TYPE PARAMETERS
  // ============================================================

  post_mime_type?: string | string[];

  // ============================================================
  // SEARCH PARAMETERS
  // ============================================================

  s?: string;

  exact?: boolean;
  sentence?: boolean;

  search_columns?: ("post_title" | "post_excerpt" | "post_content")[];

  // ============================================================
  // STICKY POSTS
  // ============================================================

  ignore_sticky_posts?: boolean;

  // ============================================================
  // CACHING
  // ============================================================

  cache_results?: boolean;

  update_post_meta_cache?: boolean;

  update_post_term_cache?: boolean;

  lazy_load_term_meta?: boolean;

  // ============================================================
  // RESULT FIELDS
  // ============================================================

  fields?: "all" | "ids" | "id=>parent";

  // ============================================================
  // PAGINATION / COUNTING
  // ============================================================

  no_found_rows?: boolean;

  // ============================================================
  // ORDERING / SQL
  // ============================================================

  suppress_filters?: boolean;

  // ============================================================
  // COMMENTS
  // ============================================================

  comment_count?: number;

  // ============================================================
  // MISC
  // ============================================================

  preview?: boolean;

  post_status_exclude?: WPPostStatus[];

  // Allow custom WP_Query args
  [key: string]: unknown;
};

// ============================================================
// TAX QUERY
// ============================================================

export type WPTaxQuery = {
  taxonomy: string;

  field?: "term_id" | "name" | "slug" | "term_taxonomy_id";

  terms?: string | number | Array<string | number>;

  operator?: "IN" | "NOT IN" | "AND" | "EXISTS" | "NOT EXISTS";

  include_children?: boolean;

  relation?: "AND" | "OR";
};

// ============================================================
// META QUERY
// ============================================================

export type WPMetaQuery = {
  key?: string;

  value?: string | number | boolean | Array<string | number | boolean>;

  compare?: WPMetaCompare;

  type?: WPMetaType;

  compare_key?:
    | "="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "LIKE"
    | "NOT LIKE"
    | "IN"
    | "NOT IN"
    | "REGEXP"
    | "NOT REGEXP"
    | "RLIKE"
    | "EXISTS"
    | "NOT EXISTS";

  type_key?: WPMetaType;

  relation?: "AND" | "OR";

  meta_query?: WPMetaQuery[];
};

// ============================================================
// DATE QUERY
// ============================================================

export type WPDateQuery = {
  year?: number;
  month?: number;
  monthnum?: number;
  week?: number;
  w?: number;
  dayofyear?: number;
  day?: number;
  dayofweek?: number;
  dayofweek_iso?: number;
  hour?: number;
  minute?: number;
  second?: number;

  after?: WPDateValue;
  before?: WPDateValue;

  inclusive?: boolean;

  compare?: WPDateCompare;

  column?:
    | "post_date"
    | "post_date_gmt"
    | "post_modified"
    | "post_modified_gmt"
    | string;

  relation?: "AND" | "OR";
};

// ============================================================
// DATE VALUES
// ============================================================

export type WPDateValue =
  | string
  | {
      year?: number;
      month?: number;
      day?: number;
    };

// ============================================================
// META COMPARE
// ============================================================

export type WPMetaCompare =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "LIKE"
  | "NOT LIKE"
  | "IN"
  | "NOT IN"
  | "BETWEEN"
  | "NOT BETWEEN"
  | "REGEXP"
  | "NOT REGEXP"
  | "RLIKE"
  | "EXISTS"
  | "NOT EXISTS";

// ============================================================
// META TYPE
// ============================================================

export type WPMetaType =
  | "NUMERIC"
  | "BINARY"
  | "CHAR"
  | "DATE"
  | "DATETIME"
  | "DECIMAL"
  | "SIGNED"
  | "TIME"
  | "UNSIGNED";

// ============================================================
// DATE COMPARE
// ============================================================

export type WPDateCompare =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "IN"
  | "NOT IN"
  | "BETWEEN"
  | "NOT BETWEEN";

// ============================================================
// ORDER
// ============================================================

export type WPOrder = "ASC" | "DESC";

// ============================================================
// ORDER BY
// ============================================================

export type WPOrderBy =
  | "none"
  | "ID"
  | "author"
  | "title"
  | "name"
  | "type"
  | "date"
  | "modified"
  | "parent"
  | "rand"
  | "comment_count"
  | "relevance"
  | "menu_order"
  | "meta_value"
  | "meta_value_num"
  | "post__in"
  | "post_name__in"
  | "post_parent__in"
  | "rand"
  | "RAND()"
  | `RAND(${number})`
  | string;

// ============================================================
// POST TYPE
// ============================================================

export type WPPostType =
  | "post"
  | "page"
  | "attachment"
  | "revision"
  | "nav_menu_item"
  | "custom_css"
  | "customize_changeset"
  | "oembed_cache"
  | "user_request"
  | "wp_block"
  | "wp_template"
  | "wp_template_part"
  | "wp_global_styles"
  | "wp_navigation"
  | "wp_font_family"
  | "wp_font_face"
  | "any"
  | string;

// ============================================================
// POST STATUS
// ============================================================

export type WPPostStatus =
  | "publish"
  | "future"
  | "draft"
  | "pending"
  | "private"
  | "trash"
  | "auto-draft"
  | "inherit"
  | "any"
  | string;

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
  queries?: {
    [key: string]: WPQueryArgs & {
      inf_query_name: string;
      inf_query_id: string;
    };
  };
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
  include_blocks_templates_in_export: boolean;
  include_wp_assets_in_export: boolean;
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
  isLoop: boolean;
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

export interface WpSettings {
  // General
  title: string;
  description: string;
  url: string;
  email: string;
  timezone: string;
  date_format: string;
  time_format: string;
  start_of_week: number;
  language: string;

  // Writing
  use_smilies: boolean;
  default_category: number;
  default_post_format: string;

  // Reading
  show_on_front: "posts" | "page";
  page_on_front: number;
  page_for_posts: number;
  posts_per_page: number;
  posts_per_rss: number;
  rss_use_excerpt: boolean;

  // Discussion
  default_ping_status: "open" | "closed";
  default_comment_status: "open" | "closed";

  // Media
  thumbnail_size_w: number;
  thumbnail_size_h: number;
  thumbnail_crop: boolean;
  medium_size_w: number;
  medium_size_h: number;
  large_size_w: number;
  large_size_h: number;

  // Permalinks
  permalink_structure: string;
  category_base: string;
  tag_base: string;

  // Infinitely Studio Custom
  post_for_template_preview: number;
}

// API Response wrappers
export interface SettingsGetResponse {
  success: boolean;
  settings: WpSettings;
}

export interface SettingsUpdateResponse {
  success: boolean;
  updated: Partial<WpSettings>;
  failed: string[];
}

// For partial updates (send only what changed)
export type WpSettingsPartial = Partial<WpSettings>;

export type KeywordValue = string | number | boolean;

export interface KeywordOption {
  value: KeywordValue;
  title: string;
}

export type Keyword = string | KeywordOption;

// ==========================================
// 2. Setting Types (Discriminated Union)
// ==========================================
export interface BaseWPSetting {
  title: string;
  key: string;
  group: string;
  readonly?: boolean;
  description?: string;
  dynamic?: boolean;
  endpoint?: string;
  showIf?: Record<string, KeywordValue>;
}

export interface InputWPSetting extends BaseWPSetting {
  componentType: "input";
  inputType: "text" | "url" | "email" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
  suffix?: string;
}

export interface SelectWPSetting extends BaseWPSetting {
  componentType: "select";
  keywords: Keyword[];
  Component?: (
    // `this` context is typed as SelectWPSetting to allow `this.key` usage
    this: SelectWPSetting,
    props: {
      setValue: (
        updater: (prev: Record<string, any>) => Record<string, any>,
      ) => void;
      value: any;
    },
  ) => ReactElement | null;
}

export type WPSetting = InputWPSetting | SelectWPSetting;

// types/tokens.ts

/**
 * Standard WP_Query arguments (used for inf-query)
 */
export interface WpQueryArgs {
  post_type?: string | string[];
  posts_per_page?: number;
  post_status?: string | string[];
  meta_query?: Record<string, any>[];
  tax_query?: Record<string, any>[];
  orderby?: string;
  order?: "ASC" | "DESC";
  author?: number | string;
  category_name?: string;
  tag?: string;
  [key: string]: any; // Allow any other valid WP_Query args
}

/**
 * 1️⃣ Variable resolved via WP_Query (inf-query)
 */
export interface TokenQueryVar {
  name: string;
  query: WpQueryArgs;
  query_id: string;
  source?: never;
  data?: never;
}

/**
 * 2️⃣ Variable resolved from existing context token (inf-for)
 * Must be a token string like "{{ products }}" or "{{ post.meta.gallery_urls }}"
 */
export interface TokenSourceVar {
  name: string;
  source: string;
  query?: never;
  data?: never;
}

/**
 * 3️⃣ Variable with raw injected data (inf-ssr or custom)
 */
export interface TokenDataVar {
  name: string;
  data: any;
  query?: never;
  source?: never;
}

export type HTTPMethods =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT"
  | "TRACE"
  | "MERGE";
export interface TokenSSRVar {
  name: string;
  ssr_url: string;
  ssr_method: HTTPMethods;
  ssr_headers: Record<string, string>;
  ssr_body: Record<string, string>;
  ssr_response_path: string;
}
/**
 * Union type: A var MUST be exactly one of these three shapes
 */
export type TokenScopeVar = TokenQueryVar | TokenSourceVar | TokenSSRVar | TokenDataVar;

/**
 * The `vars` array sent to the /get-tokens endpoint
 */
export type WpTokenVars = TokenScopeVar[];

// types/wp-endpoints.ts

// ═══════════════════════════════════════════
// POST TYPES ENDPOINT
// ═══════════════════════════════════════════

/**
 * Single post type item returned by /infinitely-api/v1/post-types
 */
export interface WpPostTypeData {
  name: string;
  label: string;
  singular: string;
  rest_base: string;
  public: boolean;
  hierarchical: boolean;
  has_archive: boolean;
  supports: string[];
}

/**
 * Response from GET /infinitely-api/v1/post-types
 */
export interface WpPostTypesResponse {
  success: boolean;
  count: number;
  data: WpPostTypeData[];
}

/**
 * Query params for GET /infinitely-api/v1/post-types
 */
export interface WpPostTypesParams {
  /** Comma-separated string or array of post type names to exclude */
  exclude?: string | string[];
  /** Include internal WP post types (wp_block, wp_template, etc.) */
  show_builtin?: boolean;
}

// ═══════════════════════════════════════════
// AUTHORS ENDPOINT
// ═══════════════════════════════════════════

/**
 * Single author item returned by /infinitely-api/v1/authors
 */
export interface WpAuthor {
  id: number;
  display_name: string;
  user_nicename: string;
  user_email: string;
  user_login: string;
  avatar_url: string;
  roles: string[];
  post_count: number;
  registered: string;
  description: string;
  url: string;
}

/**
 * Response from GET /infinitely-api/v1/authors
 */
export interface WpAuthorsResponse {
  success: boolean;
  count: number;
  data: WpAuthor[];
}

/**
 * Query params for GET /infinitely-api/v1/authors
 */
export interface WpAuthorsParams {
  /** Comma-separated string or array of user IDs to exclude */
  exclude?: string | number[] | string[];
  /** Filter by specific role (author, editor, administrator) */
  role?: string;
  /** Search by name or email */
  search?: string;
  /** Include users with 0 published posts */
  include_subscribers?: boolean;
}

// ═══════════════════════════════════════════
// SELECT KEYWORDS HELPERS
// ═══════════════════════════════════════════

// types/wp-post.ts

/**
 * WordPress Term (WP_Term) returned inside taxonomies
 */
export interface WpTerm {
  term_id: number;
  name: string;
  slug: string;
  term_group: number;
  term_taxonomy_id: number;
  taxonomy: string;
  description: string;
  parent: number;
  count: number;
  filter?: string;
}

/**
 * WordPress User (WP_User) returned in the author field
 */
export interface WpUser {
  ID: number;
  user_login: string;
  user_nicename: string;
  user_email: string;
  user_url: string;
  user_registered: string;
  user_status: string;
  display_name: string;
}

/**
 * Media object attached to the post
 */
export interface WpMedia {
  thumbnail_id: number;
  thumbnail_url: string;
  attachments: NormalizedWpPost[]; // get_attached_media returns WP_Post objects
}

/**
 * Base WP_Post properties (from casting WP_Post object to array)
 */
export interface WpPostBase {
  ID: number;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: number;
  guid: string;
  menu_order: number;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
  filter?: string;
}

/**
 * The full normalized post returned by your PHP normalize_post() function
 * Combines the base WP_Post properties + your custom meta, tax, media, author
 */
export interface NormalizedWpPost extends WpPostBase {
  /** Same as ID, added for convenience */
  id: number;
  /** Same as post_type, added for convenience */
  type: string;
  /** All custom fields (unserialized) */
  meta: Record<string, any>;
  /** Taxonomies: e.g. { category: WpTerm[], post_tag: WpTerm[] } */
  tax: Record<string, WpTerm[]>;
  /** Featured image and attachments */
  media: WpMedia;
  /** Post author user object */
  author: WpUser | false;
  /** Alias for post_content */
  content: string;
}

/**
 * Response from GET /infinitely-api/v1/posts-all
 */
export interface WpPostsAllResponse {
  success: boolean;
  count: number;
  data: NormalizedWpPost[];
}

/**
 * Query params for GET /infinitely-api/v1/posts-all
 */
export interface WpPostsAllParams {
  /** Comma-separated string or array of post IDs to exclude */
  exclude?: string | number[];
  /** Post type(s) to filter by */
  post_type?: string | string[];
  /** Post status filter */
  post_status?: string;
  /** Search keyword */
  search?: string;
  /** Order by field (date, title, modified, etc.) */
  orderby?: string;
  /** Sort direction */
  order?: "ASC" | "DESC";
  /** Filter by author ID */
  author?: number;
}

/**
 * Single category item returned by /infinitely-api/v1/categories-all
 */
export interface WpCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description: string;
  taxonomy: string;
}

/**
 * Response from GET /infinitely-api/v1/categories-all
 */
export interface WpCategoriesAllResponse {
  success: boolean;
  count: number;
  data: WpCategory[];
}

/**
 * Query params for GET /infinitely-api/v1/categories-all
 */
export interface WpCategoriesAllParams {
  /** Comma-separated string or array of term IDs to exclude */
  exclude?: string | number[];
  /** Search by category name */
  search?: string;
  /** Filter by parent ID (0 for top-level categories only) */
  parent?: number;
  /** Hide categories with 0 posts (default: false) */
  hide_empty?: boolean;
  /** Sort by field */
  orderby?: "name" | "count" | "id" | "slug";
  /** Sort direction */
  order?: "ASC" | "DESC";
}

/**
 * Single tag item returned by /infinitely-api/v1/tags-all
 */
export interface WpTag {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
  taxonomy: string;
}

/**
 * Response from GET /infinitely-api/v1/tags-all
 */
export interface WpTagsAllResponse {
  success: boolean;
  count: number;
  data: WpTag[];
}

/**
 * Query params for GET /infinitely-api/v1/tags-all
 */
export interface WpTagsAllParams {
  /** Comma-separated string or array of term IDs to exclude */
  exclude?: string | number[];
  /** Comma-separated string or array of term IDs to include */
  include?: string | number[];
  /** Search by tag name */
  search?: string;
  /** Hide tags with 0 posts (default: false) */
  hide_empty?: boolean;
  /** Sort by field */
  orderby?: "name" | "slug" | "count" | "id" | "term_group" | "description";
  /** Sort direction */
  order?: "ASC" | "DESC";
}

// types/wp-query-settings.ts

import type { ComponentType } from "react";

/**
 * Keyword option for static Select components
 */
export interface SelectKeyword {
  value: string | number | boolean;
  title: string;
}

/**
 * Base properties shared by all WP_Query settings
 */
interface BaseWPQuerySetting {
  title: string;
  key: string;
  group: string;
  description?: string;
  placeholder?: string;
}

/**
 * Static Input setting
 */
export interface InputWPQuerySetting extends BaseWPQuerySetting {
  componentType: "input";
  inputType: "text" | "number" | "email" | "url" | "password";
  min?: number;
  max?: number;
}

/**
 * Static Select setting
 */
export interface SelectWPQuerySetting extends BaseWPQuerySetting {
  componentType: "select";
  multiple?: boolean;
  keywords: SelectKeyword[];
}

/**
 * Dynamic Select setting (uses UniversalDynamicQuerySelect)
 */
export interface DynamicSelectWPQuerySetting extends BaseWPQuerySetting {
  componentType: "select";
  dynamic: true;
  multiple?: boolean;
  resource: "postTypes" | "authors" | "posts" | "categories" | "tags";
  getOption: (item: any) => SelectKeyword;
  keywords?: never; // Dynamic selects don't use static keywords
}

/**
 * Custom component setting (MetaQueryBuilder, TaxQueryBuilder, etc.)
 */
export interface CustomWPQuerySetting extends BaseWPQuerySetting {
  componentType: "custom";
  Component: ComponentType<{
    wpQuery: Record<string, any>;
    setWpQuery: (
      updater: (old: Record<string, any>) => Record<string, any>,
    ) => void;
  }>;
}

/**
 * Union type for all WP_Query settings
 */
export type WPQuerySetting =
  | InputWPQuerySetting
  | SelectWPQuerySetting
  | DynamicSelectWPQuerySetting
  | CustomWPQuerySetting;

/**
 * Flat array of all WP_Query settings
 */
export type WPQuerySettings = WPQuerySetting[];

/**
 * Grouped WP_Query settings (organized by group key)
 */
export type GroupedWPQuerySettings = Record<string, WPQuerySetting[]>;

/**
 * Group labels for accordion headers
 */
export interface WPQueryGroupLabels {
  general: string;
  ordering: string;
  search: string;
  author: string;
  posts: string;
  categories: string;
  tags: string;
  date: string;
  meta: string;
  taxonomy: string;
  performance: string;
  results: string;
  attachments: string;
  [key: string]: string; // Allow additional groups
}

// types/wp-taxonomy.ts

export interface WpTaxonomy {
  name: string;
  label: string;
  singular: string;
  hierarchical: boolean;
  public: boolean;
  rest_base: string;
  object_types: string[];
}

export interface WpTaxonomiesAllResponse {
  success: boolean;
  count: number;
  data: WpTaxonomy[];
}

export interface WpTaxonomiesAllParams {
  post_type?: string | string[];
  public?: boolean;
}

export interface WpTerm {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description: string;
  taxonomy: string;
}

export interface WpTermsAllResponse {
  success: boolean;
  count: number;
  data: WpTerm[];
}

export interface WpTermsAllParams {
  taxonomy: string;
  exclude?: string | number[];
  search?: string;
  hide_empty?: boolean;
  orderby?: "name" | "slug" | "count" | "id";
  order?: "ASC" | "DESC";
}
