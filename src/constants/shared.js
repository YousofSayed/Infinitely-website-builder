import { isChrome } from "@/helpers/bridge";

export const current_project_id = `currentProjectId`;
export const gsap_animation_state = "gsap_animation_state";
export const current_page_id = `currentPageId`;
export const wp_meta = `wp_meta`;
export const wp_page_config = `wp_page_config`;
export const wp_edite_mode = `wp_edite_mode`;
export const app_type = `app_type`;
export const current_symbol_rule = "current-symbol-rule";
export const current_page_helmet = "current-page-helmet";
export const current_wp_page_helmet_id = "current-wp-page-helmet-id";
export const current_symbol_id = "current_symbol_id";
export const current_template_id = `current_template_id`;
export const current_dynamic_template_id = `current-dynamic-template-id`;
export const wp_rest_base_edite = `wp_rest_base_edite`;
export const types_not_allowed = [
  "inf_template",
  "inf_blocks",
  "inf_symbols",
  "inf_motions",
  "wp_font_face",
  "wp_font_family",
  "wp_navigation",
  "wp_global_styles",
  "wp_template_part",
  "wp_template",
  "wp_block",
  "nav_menu_item",
  "attachment",
];

//Attributes
export const inf_symbol_Id_attribute = `inf-symbol-id`;
export const inf_symbol_instance_Id_attribute = `inf-symbol-instance-id`;
export const inf_bridge_id = `inf-bridge-id`;
export const inf_class_name = `inf-class-name`;
export const inf_template_id = `inf-template-id`;
export const inf_template_name = `inf-template-name`;
export const inf_css_urls = `inf-css-urls`;
export const inf_build_url = `inf-build-url`;
export const inf_cmds_id = `inf-cmds-id`;
export const inf_style_my_child = "inf-style-my-child";
export const inf_tokens_container  = 'inf-tokens-container'
export const inf_tokens_ignore  = 'inf-tokens-ignore'
export const wp_token_vars = 'wp-token-vars';
export const data_disable_scripting = `data-disable-scripting`;
export const motionId = "motion-id";
export const mainMotionId = "main-motion-id";
export const interactionId = "interaction-id";
export const interactionInstanceId = "interaction-instance-id";
export const mainInteractionId = "main-interaction-id";
export const motionInstanceId = "motion-instance-id";

export const global_settings = "global_settings";
export const project_settings = "project_settings";
export const preview_url = "preview_url";
export const is_installation_checked = "is_installation_checked";
export const dbx_sign_in_state = "dbx_sign_in_state";
export const dropbox_token = "dropbox_token";
export const dropbox_refresh_token = "dropbox_refresh_token";
export const dropbox_code_verifier = "dropbox_code_verifier";
export const global_types = [
  { nameWithoutExt: "gsap", globalName: "gsap" },
  { nameWithoutExt: "swiper", globalName: "swiper" },
];
export const viewEvents = ["enterview", "leaveview", "view"];
export const heading_tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
export const text_tags = [
  ...heading_tags,
  "p",
  "span",
  "strong",
  "em",
  "b",
  "i",
  "small",
  "mark",
  "del",
  "ins",
  "sub",
  "sup",
  "code",
  "kbd",
  "samp",
  "var",
  "cite",
  "q",
  "abbr",
  "dfn",
  "time",
  "address",
  "blockquote",
  "pre",
  "article",
];
export const editorComponentProps = [
  "draggable",
  "droppable",
  "editable",
  "layerable",
  "selectable",
  "hoverable",
  "copyable",
  "removable",
  "badgeable",
];
export const media_types = ["video", "audio", "iframe"];
export const headersProps = [
  "accept-ranges",
  "access-control-allow-origin",
  "cache-control",
  "content-encoding",
  "content-length",
  "content-type",
  "date",
  "etag",
  "last-modified",
  "server",
  "set-cookie",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
];

export const mainScripts = [
  "/scripts/infImport.js",
  "/scripts/alpine.js",
  "/scripts/test.js",
];

export const codeEditorScripts = ["/scripts/infinitely.js"];
export const gsapScripts = [
  "/scripts/gsap.min.js",
  "/scripts/scrollTrigger.min.js",
  "/scripts/splitText.min.js",
  // "https://cdn.jsdelivr.net/npm/gsap@latest/dist/gsap.min.js",
  // "https://cdn.jsdelivr.net/npm/gsap@latest/dist/ScrollTrigger.min.js",
];

export const mainScriptsForEditor = [
  "/scripts/infinitely.js",
  "/scripts/dev.js",

  ...gsapScripts,
  "/scripts/gsapRuner.dev.js",
  "/scripts/pVuePlugins.js",
  "/scripts/p-vue.js",
  "/scripts/pvMount.js",
  // '/scripts/test.js',
];

export const preivewScripts = [
  "/scripts/infinitely.js",
  "/scripts/dev.js",

  ...gsapScripts,
  "/scripts/initGsap.js",
  "/scripts/pVuePlugins.js",
  "/scripts/p-vue.js",
  "/scripts/initPVue.js",
  "/scripts/previewHmr.dev.js",
  // {
  //   src: "/scripts/spline-viewer.js",
  //   type: "module",
  // },
];

export const pVueScripts = [
  "/scripts/pVuePlugins.js",
  "/scripts/p-vue.js",
  "/scripts/initPVue.js",
];

export const MAX_UPLOAD_SIZE = 250;
export const MAX_FILE_SIZE = isChrome() ? 50 : 5;
export const MAX_FILES_COUNT = 500;

export const loading_project_msg = `Loading project please wait...`;
export const project_successfully_build_msg = `Project built successfully`;
export const project_faild_build_msg = `Project faild to build successfully`;
export const file_deleted_success_msg = `File deleted successfully`;
export const apps = ["normal", "wordpress"];
export const WP_DEFAULT_TEMPLATES = [
  // ========== GLOBAL ==========
  {
    key: "index",
    label: "Index (Fallback)",
    description: "Fallback template for all content",
    type: "global",
    slug: "index",
    appliesTo: "all",
  },

  // ========== SINGULAR ==========
  {
    key: "singular",
    label: "Singular (All Single Items)",
    description: "All single posts, pages, and custom post types",
    type: "singular",
    slug: "singular",
    appliesTo: "any",
  },
  {
    key: "single",
    label: "Single Post",
    description: "Blog posts only",
    type: "singular",
    slug: "single",
    appliesTo: "post",
  },
  {
    key: "page",
    label: "Page",
    description: "Static pages",
    type: "singular",
    slug: "page",
    appliesTo: "page",
  },

  // ========== ARCHIVES ==========
  {
    key: "archive",
    label: "Archive (All)",
    description: "All archives fallback",
    type: "archive",
    slug: "archive",
    appliesTo: "all",
  },
  {
    key: "home",
    label: "Blog Home",
    description: "Posts index (/blog)",
    type: "archive",
    slug: "home",
    appliesTo: "post",
  },
  {
    key: "front-page",
    label: "Front Page",
    description: "Site homepage",
    type: "singular",
    slug: "front-page",
    appliesTo: "site",
  },

  // ========== TAXONOMY ==========
  {
    key: "category",
    label: "Category Archive",
    description: "Category pages",
    type: "taxonomy",
    slug: "category",
    appliesTo: "category",
  },
  {
    key: "tag",
    label: "Tag Archive",
    description: "Tag pages",
    type: "taxonomy",
    slug: "tag",
    appliesTo: "post_tag",
  },
  {
    key: "taxonomy",
    label: "Custom Taxonomy",
    description: "All custom taxonomies",
    type: "taxonomy",
    slug: "taxonomy",
    appliesTo: "taxonomy",
  },

  // ========== AUTHOR / DATE ==========
  {
    key: "author",
    label: "Author Archive",
    description: "Posts by author",
    type: "archive",
    slug: "author",
    appliesTo: "author",
  },
  {
    key: "date",
    label: "Date Archive",
    description: "Posts by date",
    type: "archive",
    slug: "date",
    appliesTo: "date",
  },

  // ========== SEARCH / 404 ==========
  {
    key: "search",
    label: "Search Results",
    description: "Search results page",
    type: "system",
    slug: "search",
    appliesTo: "search",
  },
  {
    key: "404",
    label: "404 Not Found",
    description: "Page not found",
    type: "system",
    slug: "404",
    appliesTo: "error",
  },
];
export const makeCPTTemplates = (postTypes = []) =>
  postTypes.flatMap((type) => [
    {
      key: `single-${type}`,
      label: `Single ${type}`,
      description: `Single ${type} page`,
      type: "singular",
      slug: `single-${type}`,
      appliesTo: type,
    },
    {
      key: `archive-${type}`,
      label: `${type} Archive`,
      description: `${type} archive page`,
      type: "archive",
      slug: `archive-${type}`,
      appliesTo: type,
    },
  ]);

/**
 *
 * @param {{
 * projectSetting:import('@/helpers/types').ProjectSetting
 * disablePvue:boolean,
 * disableGsapCore:boolean,
 * disableGsapScrollTrigger:boolean,
 * inserts:{
 *  index:number,
 *  item:{
 *  name:string,
 *  content:string,
 *  localUrl:string,
 *  buildUrl:string,
 *  },
 *}[]
 * }} param0
 *
 * @returns {{name:string, localUrl:string , buildUrl?:string}[]}
 */
export const buildScripts = ({ projectSetting = {}, inserts = [] }) => {
  let scripts = [
    {
      name: "infinitely.js",
      localUrl: "/scripts/infinitely.js",
    },
    {
      name: "dev.js",
      localUrl: "/scripts/dev.js",
    },

    ...(projectSetting.enable_swiperjs
      ? [
        {
          name: "swiper.js",
          localUrl:
            "https://cdn.jsdelivr.net/npm/swiper@latest/swiper-bundle.min.js",
        },

        {
          name: "swiper-element.js",
          localUrl:
            "https://cdn.jsdelivr.net/npm/swiper@latest/swiper-element-bundle.min.js",
        },
      ]
      : []),
    ...(projectSetting.enable_spline_viewer
      ? [
        {
          name: "spline.js",
          localUrl:
            "https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js",
        },
      ]
      : []),

    ...((!projectSetting.disable_gsap_core && [
      {
        name: "gsap.min.js",
        localUrl: "/scripts/gsap.min.js",
      },
    ]) ||
      []),

    ...((!projectSetting.disable_gsap_scrollTrigger && [
      {
        name: "scrollTrigger.js",
        localUrl: "/scripts/scrollTrigger.min.js",
      },
    ]) ||
      []),

    ...((!projectSetting.disable_gsap_splitText && [
      {
        name: "splitText.js",
        localUrl: "/scripts/splitText.min.js",
      },
    ]) ||
      []),

    ...((!projectSetting.disable_petite_vue && [
      {
        name: "pVuePlugins.js",
        localUrl: `/scripts/pVuePlugins.js`,
      },
      {
        name: "p-vue.js",
        localUrl: "/scripts/p-vue.js",
      },
      { name: "initPVue.js", localUrl: "/scripts/initPVue.js" },
    ]) ||
      []),

    // {
    //   name: "infImportsBuild.js",
    //   localUrl: "/scripts/infImportsBuild.js",
    // },
  ];

  inserts.forEach(({ index, useLastIndex, item }) => {
    scripts.splice(useLastIndex ? scripts.length : index, 0, item);
  });

  return scripts;
};
/**
 *
 * @param {{
 * projectSetting:import('@/helpers/types').ProjectSetting
 * disablePvue:boolean,
 * disableGsapCore:boolean,
 * disableGsapScrollTrigger:boolean,
 * inserts:{
 *  index:number,
 *  item:{
 *  name:string,
 *  condition:boolean;
 *  content:string,
 *  localUrl:string,
 *  buildUrl:string,
 *  },
 *}[]
 * }} param0
 *
 * @returns {{name:string, localUrl:string , buildUrl?:string}[]}
 */
export const buildWpScripts = ({ projectSetting = {}, inserts = [] }) => {
  let scripts = [
    {
      name: "infinitely.js",
      localUrl: "/scripts/infinitely.js",
    },
    {
      name: "dev.js",
      localUrl: "/scripts/dev.js",
    },

    {
      name: "swiper.js",
      localUrl:
        "https://cdn.jsdelivr.net/npm/swiper@latest/swiper-bundle.min.js",
      condition: projectSetting.enable_swiperjs,
    },

    {
      name: "swiper-element.js",
      localUrl:
        "https://cdn.jsdelivr.net/npm/swiper@latest/swiper-element-bundle.min.js",
      condition: projectSetting.enable_swiperjs,
    },

    // {
    //   name: "spline.js",
    //   localUrl:
    //     "https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js",
    //   condition: projectSetting.enable_spline_viewer,
    // },
    {
      name: "gsap.min.js",
      localUrl: "/scripts/gsap.min.js",
      condition: !projectSetting.disable_gsap_core,
    },

    {
      name: "scrollTrigger.js",
      localUrl: "/scripts/scrollTrigger.min.js",
      condition: !projectSetting.disable_gsap_scrollTrigger,
    },

    {
      name: "splitText.js",
      localUrl: "/scripts/splitText.min.js",
      condition: !projectSetting.disable_gsap_splitText,
    },

    {
      name: "pVuePlugins.js",
      localUrl: `/scripts/pVuePlugins.js`,
      condition: !projectSetting.disable_petite_vue,
    },
    {
      name: "p-vue.js",
      localUrl: "/scripts/p-vue.js",
      condition: !projectSetting.disable_petite_vue,
    },
    {
      name: "initPVue.js",
      localUrl: "/scripts/initPVue.js",
      condition: !projectSetting.disable_petite_vue,
    },

    // {
    //   name: "infImportsBuild.js",
    //   localUrl: "/scripts/infImportsBuild.js",
    // },
  ];

  inserts.forEach(({ index, useLastIndex, item }) => {
    scripts.splice(useLastIndex ? scripts.length : index, 0, item);
  });

  return scripts;
};
/**
 *
 * @param {{
 * projectSetting:import('@/helpers/types').ProjectSetting
 * disablePvue:boolean,
 * disableGsapCore:boolean,
 * disableGsapScrollTrigger:boolean,
 * inserts:{
 *  index:number,
 *  item:{
 *  name:string,
 *  condition:boolean;
 *  content:string,
 *  localUrl:string,
 *  buildUrl:string,
 *  },
 *}[]
 * }} param0
 *
 * @returns {{name:string, localUrl:string , buildUrl?:string}[]}
 */
export const buildWpHeaderScripts = ({ projectSetting = {}, inserts = [] }) => {
  let scripts = [


    // {
    //   name: "spline.js",
    //   localUrl:
    //   // "https://cdn.jsdelivr.net/npm/@splinetool/viewer@1.12.56/build/spline-viewer.min.js"
    //     "https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js",
    //   condition: projectSetting.enable_spline_viewer,
    //   attributes: {
    //     type: "module"
    //   }
    // },


    // {
    //   name: "infImportsBuild.js",
    //   localUrl: "/scripts/infImportsBuild.js",
    // },
  ];

  inserts.forEach(({ index, useLastIndex, item }) => {
    scripts.splice(useLastIndex ? scripts.length : index, 0, item);
  });

  return scripts;
};
