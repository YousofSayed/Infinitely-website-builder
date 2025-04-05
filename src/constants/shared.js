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

export const global_settings = "global_settings";
export const project_settings = "project_settings";

export const mainScripts = [
  "/scripts/infImport.js",
  "/scripts/alpine.js",
  "/scripts/test.js",
];

export const mainScriptsForEditor = [
  "/scripts/infImport.js",
  "/scripts/p-vue.js",
  "/scripts/pvMount.js",
  // '/scripts/test.js',
];

export const preivewScripts = ["/scripts/p-vue.js", "/scripts/initPVue.js"];

export const buildScripts = (disablePvue = false) => [
  ...((!disablePvue && [{
    name: "p-vue.js",
    localUrl: "/scripts/p-vue.js",
  },
  { name: "initPVue.js", localUrl: "/scripts/initPVue.js" }]) || []),
  {
    name: "infImportsBuild.js",
    localUrl: "/scripts/infImportsBuild.js",
  },
];

console.log(buildScripts());
