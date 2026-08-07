import {
  wp_get,
  wp_get_header_footer,
  wp_get_single,
  wp_inf_render_components,
  wp_inf_render_template,
  wp_update_option,
  wp_update_single,
} from "@/apps/wordpress/functions";
import { wp_get_post_id } from "@/apps/wordpress/functions_ui";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { editorStorageInstance } from "@/constants/InfinitelyInstances";
import {
  current_page_id,
  current_project_id,
  current_symbol_id,
  inf_symbol_Id_attribute,
  mainScriptsForEditor,
  wp_page_config,
  wp_rest_base_edite,
} from "@/constants/shared";
import {
  defineRoot,
  fileNameToMediaSlug,
  html,
  mediaSlugToFileName,
  objToAttributes,
} from "@/helpers/bridge";
import { wp_preview_bc } from "@/helpers/channels";
import { navigateFromAnyWhere } from "@/helpers/customEvents";
import { db } from "@/helpers/db";
import { fetcherWorker, pageBuilderWorker } from "@/helpers/defineWorkers";
import {
  cssToDataURL,
  getComponentRules,
  getInfinitelySymbolInfo,
  getProjectData,
  getProjectSettings,
  getWpEditeMode,
  getWpPageConfig,
  gjsComponentsToJSON,
  initSymbolTimout,
  isTemplate,
  screenshotTimout,
  workerCallbackMaker,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { updateThumbnailTimeout } from "@/plugins/updateProjectThumbnail";
import { minify } from "csso";
import { cloneDeep, isArray, isPlainObject, uniqueId } from "lodash";
import { toast } from "react-toastify";

let loadFooterScriptsCallback, loadHeadScriptsCallback, loadMainScriptsCallback;
let storeTimeout;
let pageBuilderTimeout;
let loadTimeout, appenderTimeout;
let currentPageName = localStorage.getItem(current_page_id);

// generate a unique cache buster per load

function addCacheBusterToAllAssets(doc = document) {
  const cacheBuster = Date.now(); // or uniqueId()
  // handle <script> tags
  doc.querySelectorAll("script[src]").forEach((el) => {
    if (!el.src.includes("ver=")) {
      el.src = `${el.src}${el.src.includes("?") ? "&" : "?"}ver=${cacheBuster}`;
    }
  });

  // handle <link> tags
  doc.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
    if (!el.href.includes("ver=")) {
      el.href = `${el.href}${el.href.includes("?") ? "&" : "?"}ver=${cacheBuster}`;
    }
  });
}

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const wp_remote_storage = (editor) => {
  const projectID = localStorage.getItem(current_project_id);

  let tId;
  editor.infDirty = 0;

  const clearTimeouts = () => {
    infinitelyWorker.postMessage({
      command: "clearTimeouts",
    });
    console.log(
      `Timeouts : `,
      initSymbolTimout,
      loadTimeout,
      storeTimeout,
      appenderTimeout,
      screenshotTimout,
      updateThumbnailTimeout,
    );

    initSymbolTimout && clearTimeout(initSymbolTimout);
    loadTimeout && clearTimeout(loadTimeout);
    storeTimeout && clearTimeout(storeTimeout);
    // appenderTimeout && clearTimeout(appenderTimeout);
    screenshotTimout && clearTimeout(screenshotTimout);
    updateThumbnailTimeout && clearTimeout(updateThumbnailTimeout);
  };

  editor.on("component:drag", () => {
    clearTimeouts();
  });

  if (!projectID) {
    console.error(`Error : No project id founded in local storage`);
    return;
  }

  editor.on("update", (update) => {
    // console.log("update : ", update, editor.infLoading);
    if (editor.infLoading) {
      editor.clearDirtyCount();
    }
  });

  editor.Storage.add("wp_remote_storage", {
    async load(options = {}) {
      console.log("loading options : ", options);
      loadTimeout && clearTimeout(loadTimeout);
      loadTimeout &&
        window.cancelIdleCallback &&
        cancelIdleCallback(loadTimeout);
      editor.infLoading = true;
      if (editor.getDirtyCount() > 0) {
        console.log(
          "loading state : ",
          editor.infLoading,
          editor.getDirtyCount.toString(),
        );

        const cnfrm = confirm(
          `There is changes not saved and you lost it after reload , Are you want to save changes ? `,
        );

        if (cnfrm) {
          await editor.store();
          const callback = async () => {
            await editor.load();
            editor.off(InfinitelyEvents.storage.storeEnd, callback);
          };
          editor.on(InfinitelyEvents.storage.storeEnd, callback);
          editor.StorageManager.setStepsBeforeSave(0);
          editor.clearDirtyCount();
          return;
        }
      }

      // editorStorageInstance.emit(InfinitelyEvents.storage.loadStart);
      // editor.off("component:remove:before");

      editor.clearDirtyCount();
      clearTimeouts();

      const pageSlug = localStorage.getItem(current_page_id);
      const projectId = parseFloat(localStorage.getItem(current_project_id));
      if (!projectId) {
        navigateFromAnyWhere("/workspace");
        return;
      }
      const projectData = await getProjectData();
      const { projectSettings } = getProjectSettings();
      const edito_mode = getWpEditeMode();
      const rest_base = localStorage.getItem(wp_rest_base_edite);
      const post_config = getWpPageConfig();
      !window.blobUrls && (window.blobUrls = []);
      if (!edito_mode) {
        navigateFromAnyWhere("/wordpress/select");
        setTimeout(() => {
          toast.error(<ToastMsgInfo msg={`No edite mode founded 🤨`} />);
        }, 10);
      }
      currentPageName = pageSlug;
      if (!pageSlug) {
        toast.warn(<ToastMsgInfo msg={`No selected page founded 🤨`} />);
        // navigateFromAnyWhere("/wordpress/select");
        return;
      }
      if (isNaN(projectId)) {
        toast.error(<ToastMsgInfo msg={`No project id founded 💔`} />);
        // navigateFromAnyWhere("/workspace");
        return;
      }

      /**
       * @type {import('@/helpers/types').WpPage}
       */
      const page = await wp_get_single({
        projectId,
        endpoint: rest_base,
        singleId: post_config.id,
      });

      // (
      //   await wp_get({
      //     endpoint:
      //       post_config.type !== "wp_template" ? rest_base : "templates",
      //     projectId,
      //     params: { slug: post_config.slug },
      //   })
      // )[0];

      console.log(
        "paaaaaaaaage first",
        page,
        pageSlug,
        page.inf_meta,
        post_config,
      );

      if (!page) {
        toast.error(
          <ToastMsgInfo msg={`Page ${pageSlug} not founded in wordpress 💔`} />,
        );
        navigateFromAnyWhere("/wordpress/select");
        return;
      }

      /**
       * @type {import("@/helpers/types").InfinitelyPageMeta}
       */
      let inf_meta = page?.inf_meta;

      if (isArray(inf_meta)) {
        inf_meta = {};
      }

      if (!inf_meta) {
        toast.error(
          <ToastMsgInfo msg={`Not allowed to edite ${pageSlug} 😊`} />,
        );
        navigateFromAnyWhere("/wordpress/select");
      }

      const { before_save, saved } = inf_meta;

      // if (!(isArray(before_save) && Boolean(before_save.length)) || !saved) {
      //   return {};
      // }

      const init_meta = {
        css: "",
        html: [],
        js: "",
        motions: "",
        tailwind_css: "",
        bodyAttributes: {},
        helmet: {},
      };

      const data =
        isPlainObject(before_save) &&
        Boolean(Object.keys(before_save || {}).length)
          ? before_save
          : saved || init_meta;

      let pageClone = cloneDeep(page);

      const save_state =
        isPlainObject(before_save) &&
        Boolean(Object.keys(before_save || {}).length)
          ? "before_save"
          : "saved";

      console.log(
        "save state : ",
        save_state,
        save_state == "before_save" ? true : false,
      );

      if (data) {
        await db.projects.update(projectId, {
          current_inf_meta: {
            ...(inf_meta || {}),
          },
          currentEditingPage: {
            ...data,
            // ...pageClone,
            id: page.id,
            type: page.type,
            slug: page.slug,
            rest_base,
            save_state,
            need_publish_to_wp: save_state == "before_save" ? true : false,
          },
        });
      }
      delete pageClone["inf_meta"];
      delete pageClone["meta"];

      localStorage.setItem(wp_page_config, JSON.stringify(pageClone));
      pageClone = null;

      const header_footer = await wp_get_header_footer({
        post_id: page.id,
        post_type: page.type,
        save_state,
        projectId,
      });

      if (!header_footer.head || !header_footer.footer) {
        toast.error(
          <ToastMsgInfo msg={`Head or Footer content not founded 🤨`} />,
        );
        throw new Error(`Head or Footer content not founded 🤨`);
      }
      let headContent = "",
        inline_scripts = "",
        inline_styles = "",
        head_styles = [],
        footer_scripts = [],
        files = [],
        dev_scripts = [];

      /**
       *
       * @param {HTMLElement} el
       */
      const getAttributesAsObj = (el) => {
        if (!el) return {};
        return Object.fromEntries(
          [...el.attributes].map((attr) => [attr.name, attr.value]),
        );
      };

      files.push({ path: defineRoot("local.js"), content: data?.["js"] ?? "" });
      const isGlobalCss =
        isPlainObject(projectData.globalCss) &&
        Boolean(Object.keys(projectData.globalCss).length);
      const isGlobalJs =
        isPlainObject(projectData.globalJs) &&
        Boolean(Object.keys(projectData.globalJs).length);

      if (header_footer.head) {
        const parsedHeadDom = new DOMParser().parseFromString(
          header_footer.head,
          "text/html",
        );

        addCacheBusterToAllAssets(parsedHeadDom);

        const symbols_styles_el =
          parsedHeadDom.querySelector(`#inf-symbol-styles`);

        const symbolsStyles = symbols_styles_el
          ? symbols_styles_el.innerHTML
          : "";

          console.log('symbolsStyles : ' , symbolsStyles);
          

        data.css = minify(`${data.css || ""} ${symbolsStyles}`, {
          restructure: true,
        }).css;

        console.log(`symbolsStyles : ${symbolsStyles}` , symbols_styles_el , [...parsedHeadDom.querySelectorAll(`style`)].map(el=>el.cloneNode(true)));
        
        parsedHeadDom
          .querySelectorAll(`#inf-css , #inf-motions , #inf-tailwind`)
          .forEach((el) => el.remove());
        // symbols_styles_el && symbols_styles_el.remove();

        parsedHeadDom
          .querySelectorAll(`link[href]`)
          .forEach((el) =>
            editor.config.canvas.styles.push(
              Object.fromEntries(
                [...el.attributes].map((attr) => [attr.name, attr.value]),
              ),
            ),
          );

        projectData.mainEditorStyles;
        parsedHeadDom.querySelectorAll("link,script,style").forEach((el) => {
          if (
            el.tagName === "LINK" &&
            el.getAttribute("rel") === "stylesheet"
          ) {
            editor.config.canvas.styles.push(getAttributesAsObj(el));
          } else if (el.tagName === "STYLE") {
            const url =
              // cssToDataURL(el.innerHTML);
              URL.createObjectURL(
                new Blob([el.innerHTML], { type: "text/css" }),
              );
            window.blobUrls.push(url);
            editor.config.canvas.styles.push({
              href: url,
              rel: "stylesheet",
              ...getAttributesAsObj(el),
            });
          } else if (el.tagName === "SCRIPT") {
            if (el.getAttribute("src")) {
              editor.config.canvas.scripts.push(getAttributesAsObj(el));
            } else if (el.innerHTML) {
              const url = URL.createObjectURL(
                new Blob([el.innerHTML], { type: "application/javascript" }),
              );
              window.blobUrls.push(url);
              editor.config.canvas.scripts.push({
                src: url,
                ...getAttributesAsObj(el),
              });
            }
          }
        });

        // head_styles = [...parsedHeadDom.querySelectorAll(`style`)].map(el=>el.outerHTML);
        headContent = parsedHeadDom.body.innerHTML;
      }

      console.log("data css : ", data, data.css, data.bodyAttributes);

      const content = [
        ...(data?.html || []),
        `<style id="inf-css">
          ${data.css || ""}
        </style`,
      ];

      editor.clearDirtyCount();
      const wrapper = editor.getWrapper();
      wrapper.addAttributes(data.bodyAttributes);
      editor.clearDirtyCount();

      editor.setComponents(content);

      editor.render();

      editor.on("canvas:frame:load:body", (ev) => {
        /**
         * @type {HTMLBodyElement}
         */
        const body = ev.window.document.body;

        const parsedFooterDom = new DOMParser().parseFromString(
          `${header_footer.footer}\n`,
          "text/html",
        );

        let pVueId;
        const mainScripts = projectData.mainEditorScripts.footer
          .map((lib) => {
            lib.slug.toLowerCase() == fileNameToMediaSlug("p-vue.js") &&
              (pVueId = lib.id);
            return `script[src="${lib.source_url || lib.url}"]`;
          })
          .join(",");

        parsedFooterDom
          .querySelectorAll(
            `
            ${mainScripts}
            ${pVueId ? `,#inf-footer-${pVueId}-js-before` : ""}
            ${isGlobalJs ? `,script[src="${projectData.globalJs.source_url || projectData.globalJs.url}"]` : ""}
            `,
          )
          .forEach((el) => {
            el.remove();
          });

        dev_scripts = [
          projectSettings.enable_tailwind
            ? `<script src="/scripts/tailwindcss.v4.js"></script>`
            : "",
          projectSettings.optimize_outlines
            ? `<script src="/scripts/optimizeOutlines.js"></script>`
            : "",
          !projectSettings.disable_will_change_in_editor
            ? `<script src="/scripts/willChange.js"></script>`
            : "",
          projectSettings.enable_spline_viewer
            ? `<script src"https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js"></script>`
            : "",
          projectSettings.enable_swiperjs
            ? `
            <script src="https://cdn.jsdelivr.net/npm/swiper@latest/swiper-bundle.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/swiper@latest/swiper-element-bundle.min.js"></script>
            `
            : "",
          ...mainScriptsForEditor.map((src) => {
            if (src.includes("p-vue.js")) {
              return `

             <script id="global-js" src="${projectData.globalJs.source_url || projectData.globalJs.url}"></script>
             <script id="local-js">${data.js}</script>
             <script src="${src}"></script>
             `;
            } else {
              return `<script src="${src}"></script>`;
            }
          }),
        ];

        parsedFooterDom.body.insertAdjacentHTML(
          "beforeend",
          dev_scripts.join("\n"),
        );
        addCacheBusterToAllAssets(parsedFooterDom);

        const els = [...parsedFooterDom.querySelectorAll("link,script,style")];

        const appendScript = async (index = 0) => {
          if (!els[index]) {
            editor.refresh();
            return;
          } // ✅ stop when done

          const el = els[index];

          const newEl = ev.window.document.createElement(
            el.tagName.toLowerCase(),
          );

          [...el.attributes].forEach((attr) => {
            newEl.setAttribute(attr.name, attr.value);
          });

          newEl.innerHTML = el.innerHTML;
          const addedNode = body.appendChild(newEl);

          return new Promise((res) => {
            // ✅ non-script → continue immediately
            if (el.tagName !== "SCRIPT") {
              return res(appendScript(index + 1));
            }

            // ✅ inline script → no load event
            if (!addedNode.src) {
              console.warn("inline script : ", newEl);

              return res(appendScript(index + 1));
            }

            const loadCb = () => {
              console.log(`Script loaded: ${addedNode.src}`);
              addedNode.removeEventListener("load", loadCb);
              res(appendScript(index + 1));
            };

            const errCb = (ev) => {
              console.error(`Error loading script: ${addedNode.src}`, ev);
              addedNode.removeEventListener("error", errCb);
              res(appendScript(index + 1));
            };

            addedNode.addEventListener("load", loadCb);
            addedNode.addEventListener("error", errCb);
          });
        };

        appendScript();
      });
      const slugs = [projectData.globalJs.slug, projectData.globalCss.slug];
      wpWorkerCallbackMaker(
        pageBuilderWorker,
        "wp_get_media_files_by_slugs",
        {
          projectId,
          slugs,
        },
        (props) => {
          if (props.done && isPlainObject(props.res)) {
            console.log(props, "props");

            for (const [slug, data] of Object.entries(props.res)) {
              if (data.error) continue;
              files.push({
                path: defineRoot(mediaSlugToFileName(slug)),
                content: data.content,
              });
            }
            console.log(files, "files");

            wpWorkerCallbackMaker(
              pageBuilderWorker,
              "writeFilesToOPFS",
              {
                files,
              },
              (props) => {
                console.log("file writing response", props);
              },
            );
          } else {
            toast.error(
              <ToastMsgInfo
                msg={`Faild to get & set global and local scripts and styles 😪`}
              />,
            );
          }
        },
      );

      console.log("header_footer", header_footer);
      editor.infLoading = false;
      editorStorageInstance.emit(InfinitelyEvents.storage.loadEnd);
      return;
      //  {
      //   components: data.html.concat(`<style>${data.css}</style>`),
      // };
    },

    //Storinggg

    store(storeProps = {}) {
      if (storeTimeout) clearTimeout(storeTimeout);
      if (pageBuilderTimeout) clearTimeout(pageBuilderTimeout);
      if (editor.getDirtyCount() < 0) return;

      // editor.UndoManager.stop();

      // return new Promise((res, rej) => {
      storeTimeout = setTimeout(
        () => {
          const runStore = async () => {
            editor.infStore = true;
            // console.log(
            //   "prrrrrrrrrrrrops from store : ",
            //   storeProps,
            //   editor.infLoading,
            // );
            editor.trigger(InfinitelyEvents.storage.storeStart);
            // console.log("Before storing:", {
            //   dirty: editor.getDirtyCount(),
            //   steps: editor.StorageManager.getStepsBeforeSave(),
            // });
            // if (!editor.getDirtyCount()) return;
            // try {
            // toast.clearWaitingQueue({
            //   // containerId: `main-toast-container`,
            // });
            // const json = editor.getWrapper().toJSON();
            // console.log("gjs wrapper cmps:", JSON.stringify(json, null, 2));

            // console.log(
            //   "gjs cmps :",
            //   gjsComponentsToJSON(editor.getWrapper()),
            //   // editor.getComponents().toJSON(),
            //   // JSON.parse(JSON.stringify(editor.getComponents())),
            // );

            const projectId = +localStorage.getItem(current_project_id);
            const currentPageId = currentPageName;
            const currentSymbolId = sessionStorage.getItem(current_symbol_id);
            const projectData = await getProjectData();
            const { projectSettings } = getProjectSettings();
            const wp_post = getWpPageConfig();
            const rest_base = localStorage.getItem(wp_rest_base_edite);
            const edito_mode = getWpEditeMode();
            const files = {};
            let steps = 0;
            let max_steps = Number(Boolean(currentSymbolId)) + 1;
            let tailwindcssStyle;

            const wrapper = editor.getWrapper();

            tId && toast.done(tId);
            if (!projectSettings.enable_auto_save) {
              tId = toast.loading(<ToastMsgInfo msg={"Saving..."} />);
            }

            const beforeunload = (e) => {
              e.preventDefault();
              e.returnValue = "";
            };

            if (projectSettings.enable_auto_save) {
              window.addEventListener("beforeunload", beforeunload);
            }

            // Handle global symbol
            const handleGlobalSymbol = async () => {
              if (!currentSymbolId) return;

              const symbolEl = editor
                .getWrapper()
                .find(`[${inf_symbol_Id_attribute}="${currentSymbolId}"]`)[0];
              const cmp = editor.getSelected() || editor.getWrapper().find(`[${inf_symbol_Id_attribute}="${currentSymbolId}"]`)[0]
              const symbolInf = getInfinitelySymbolInfo(cmp);
              const symbol = symbolInf?.symbol || symbolEl;
              // const currentSymbol = projectData?.symbols?.[currentSymbolId];

              if (!symbol) return;

              const content = gjsComponentsToJSON(symbol, true);

              // symbol.toHTML({
              //   withProps: true,
              //   keepInlineStyle: true,
              // });

              const style = getComponentRules({
                editor,
                cmp: symbol,
                nested: true,
              }).stringRules;
              console.log("components result :", content);

              // minify(

              //   { restructure: true }
              // ).css;

              return {
                id: symbolInf.mainId,
                symbolCmp: symbol,
                content,
                style,
              };
            };

            //   await handleGlobalSymbol();
            let components = gjsComponentsToJSON(editor.getWrapper());

            // Minify full CSS
            let cssCode = editor.getCss({
              avoidProtected: true,
              keepUnusedStyles: true,
            });

            if (projectSettings?.enable_tailwind) {
              const tailwindStyle = [
                ...editor.Canvas.getDocument().head.querySelectorAll("style"),
              ].find((style) =>
                style.innerHTML.includes(
                  "MIT License | https://tailwindcss.com",
                ),
              );
              tailwindcssStyle = tailwindStyle?.innerHTML || "";
            }

            if (!wp_post) {
              navigateFromAnyWhere("/workspace");
              return;
            }

            if (!rest_base) {
              navigateFromAnyWhere("/wordpress/select");
              return;
            }

            const isProjectSettingsChanged =
              JSON.stringify(projectData.projectSetting) !==
              JSON.stringify(projectSettings);

            const newMeta = {
              ...projectData.currentEditingPage,
              html: components,
              css: cssCode,
              tailwind_css: tailwindcssStyle,
              bodyAttributes: {
                // class:wrapper.getClasses(),
                ...wrapper.getAttributes({
                  noClass: false,
                  noStyle: false,
                }),
              },
            };

            const afterSave = async () => {
              steps++;
              if (steps >= storeProps?.steps || max_steps) {
                const wp_post = getWpPageConfig();

                await db.projects.update(projectId, {
                  current_inf_meta: {
                    ...(projectData.current_inf_meta || {}),
                    before_save: {
                      ...newMeta,
                    },
                  },
                  // scripts_need_to_publish: false,
                  save_state: "before_save",
                  currentEditingPage: {
                    ...projectData.currentEditingPage,
                    // ...newMeta,
                    save_state: "before_save",
                    need_publish_to_wp: true,
                  },
                });
                if (projectSettings.enable_auto_save) {
                  window.removeEventListener("beforeunload", beforeunload);
                }
                wp_preview_bc.postMessage({
                  props: {
                    url: wp_post.link,
                    mode: "preview",
                    save_state: "before_save",
                  },
                });
                editor.trigger(InfinitelyEvents.storage.storeEnd);
                editor.infStore = false;
              }
            };

            // if (wp_post.type != "wp_template") {
            // wp_update_single;

            wpWorkerCallbackMaker(
              infinitelyWorker,
              "wp_update_meta", 
              {
                projectId,
                post_type: wp_post.type,
                post_id: wp_get_post_id(),
                meta_key: "inf_meta",
                merge: true,
                meta_value: {
                  saved: {
                    ...(projectData?.current_inf_meta?.saved || {}),
                  },
                  before_save: {
                    ...newMeta,
                  },
                },
              },
              async (res) => {
                console.log("res from wp_update_meta in wp_remote_storage.js : ", res);
                if (res.done) {
                  afterSave();
                } else {
                  throw new Error(`Faild to store 😩`);
                }
              },
            );

            Boolean(currentSymbolId) &&
              (await (async () => {
                const symbol_data = await handleGlobalSymbol();
                console.log("symbol_data", symbol_data);

                wpWorkerCallbackMaker(
                  pageBuilderWorker,
                  "wp_update_symbol",
                  {
                    projectId,
                    symbol_id: symbol_data.id,
                    symbol_meta: {
                      inf_meta: {
                        before_save: {
                          html: symbol_data.content,
                          css: symbol_data.style,
                          media: symbol_data.symbolCmp.getIcon(),
                        },
                        // saved: {
                        //   html: symbol_data.content,
                        //   css: symbol_data.style,
                        //   media: symbol_data.symbolCmp.getIcon()
                        // }
                      },
                    },
                  },
                  (props) => {
                    console.log("symbol props from store : ", props);
                    if (props.done) {
                      afterSave();
                    }
                  },
                );
              })());

            // if (isProjectSettingsChanged) {
            //   wpWorkerCallbackMaker(
            //     pageBuilderWorker,
            //     "wp_update_main_global_files",
            //     {
            //       data: {
            //         id: projectId,
            //         projectSetting: projectSettings,
            //         projectData,
            //         global: {
            //           css: "",
            //           js: "",
            //         },
            //       },
            //     },
            //     async (res) => {
            //       if (res.done && res.res) {
            //         await afterSave();
            //         toast.success(
            //           <ToastMsgInfo msg={`Editor scripts updated 💙`} />,
            //         );
            //       } else {
            //         toast.dismiss(tId);
            //         toast.error(
            //           <ToastMsgInfo
            //             msg={`Faild to update editor scripts 😡`}
            //           />,
            //         );
            //         throw new Error(`Editor scripts not updated 😡 , why?`);
            //       }
            //     },
            //   );
            // }
            // }
            // } catch (error) {
            //   toast.error(<ToastMsgInfo msg={error.message} />);
            //   console.error(error);
            //   throw new Error(error);
            //   // editor.UndoManager.start();
            // }
          };

          runStore();
        },
        getProjectSettings().projectSettings?.enable_auto_save ? 700 : 0,
      );
      // });

      return storeTimeout;
    },
  });
};
