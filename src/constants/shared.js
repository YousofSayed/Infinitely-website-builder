import { isChrome } from "../helpers/bridge";

export const current_project_id = `currentProjectId`;
export const current_page_id = `currentPageId`;
export const current_symbol_rule = "current-symbol-rule";
export const current_page_helmet = "current-page-helmet";
export const current_symbol_id = "current_symbol_id";
export const current_template_id = `current_template_id`;
export const current_dynamic_template_id = `current-dynamic-template-id`;

//Attributes
export const inf_symbol_Id_attribute = `inf-symbol-id`;
export const inf_symbol_instance_Id_attribute = `inf-symbol-instance-id`;
export const inf_bridge_id = `inf-bridge-id`;
export const inf_class_name = `inf-class-name`;
export const inf_template_id = `inf-template-id`;
export const inf_css_urls = `inf-css-urls`;
export const inf_build_url = `inf-build-url`;
export const inf_cmds_id = `inf-cmds-id`;
export const data_disable_scripting = `data-disable-scripting`;
export const motionId = "motion-id";
export const motionInstanceId = "motion-instance-id";

export const global_settings = "global_settings";
export const project_settings = "project_settings";
export const preview_url = "preview_url";
export const is_installation_checked = "is_installation_checked";

export const heading_tags = ['h1','h2','h3','h4','h5','h6'];
export const media_types  = ['video' , 'audio' , 'iframe'];
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

export const mainScriptsForEditor = [
  "/scripts/gsap@3.12.7.js",
  "/scripts/scrollTrigger@3.12.7.js",
  "/scripts/gsapRuner.dev.js",
  "/scripts/infImport.js",
  "/scripts/p-vue.js",
  "/scripts/pvMount.js",
  // '/scripts/test.js',
];

export const preivewScripts = [
  "/scripts/gsap@3.12.7.js",
  "/scripts/scrollTrigger@3.12.7.js",
  "/scripts/initGsap.js",
  "/scripts/p-vue.js",
  "/scripts/initPVue.js",
  "/scripts/previewHmr.dev.js",
];

export const MAX_UPLOAD_SIZE = navigator?.deviceMemory
  ? navigator.deviceMemory * 1000 * (12.5 / 100)
  : 250;
export const MAX_FILE_SIZE = isChrome() ? 25 : 20;

/**
 *
 * @param {{
 * disablePvue:boolean,
 * disableGsap:boolean,
 * inserts:{
 *  index:number,
 *  item:{
 *  name:string,
 *  localUrl:string,
 *  buildUrl:string,
 *  },
 *}[]
 * }} param0
 *
 * @returns {{name:string, localUrl:string , buildUrl?:string}[]}
 */
export const buildScripts = ({
  disablePvue = false,
  disableGsap = false,
  inserts = [],
}) => {
  let scripts = [
    ...((!disableGsap && [
      {
        name: "gsap@3.12.7.js",
        localUrl: "/scripts/gsap@3.12.7.js",
      },
      {
        name: "scrollTrigger.js",
        localUrl: "/scripts/scrollTrigger@3.12.7.js",
      },
    ]) ||
      []),

    ...((!disablePvue && [
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

  inserts.forEach(({ index, item }) => {
    scripts.splice(index, 0, item);
  });

  return scripts;
};
