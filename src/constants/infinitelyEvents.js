export const InfinitelyEvents = {
  global: {
    pull_require: `infinitely:project:pull-require`,
  },
  component : {
    update_content:"infinitely:component:update_content"
  },
  pages: {
    select: "infinitely:page:select",
    update: "infinitely:page:update",
    all: "infinitely:page:all",
  },
  editor: {
    reload: "infinitely:editor:reload",
    require: `infinitely:editor:require-reload`,
  },
  ruleTitle:{
    update:`infinitely:rule-title:update`
  },
  symbols: {
    update: "infinitely:symbol:update",
    select: "infinitely:symbol:select",
    de_select: "infinitely:symbol:deselect",
  },

  layers: {
    update: "infinitely:layers:update",
  },
  attributes: {
    buildUrl: "infinitely:build-url:update",
  },
  directives: {
    update: "infinitely:directives:update",
  },
  preview: {
    navigate: "infinitely:preview:navigate",
  },
  style: {
    set: "infinitely:style:set",
  },
  keyframe: {
    set: "infinitely:keyframe:style:set",
  },
  editorContainer: {
    update: `infinitely:editor-container:update`,
  },
  devices:{
    update:`infinitely:devices:update`
  },
  storage: {
    storeStart: "infinitely:storage:store:start",
    storeEnd: "infinitely:storage:store:end",
    loadStart: "infinitely:storage:load:start",
    loadEnd: "infinitely:storage:load:end",
  },
};
