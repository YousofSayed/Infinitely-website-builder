import {
  wp_get_option,
  wp_insert_posts,
  wp_update_option,
  wp_upload_multiple_files,
} from "@/Apps/wordpress/functions";
import { preivewScripts } from "@/constants/shared";
import {
  buildPage,
  getInitProjectData,
  installFonts,
  installLibs,
  installRestModelsAPI,
  restoreBlobs,
  reversTryCatchInDirectives,
} from "@/helpers/bridge";
import { db } from "@/helpers/db";
import { opfs } from "@/helpers/initOpfs";
import { installTypes } from "@/helpers/installTypes";
import { uploadAssets, workerSendToast } from "@/helpers/workerCommands";
import JSZip from "jszip";
import { parseHTML } from "linkedom";
import { isNumber, isPlainObject, random, sortBy, uniqueId } from "lodash";

/**
 *
 * @param {{file:File , data:import('@/helpers/types').Project   , projectId : number , isUpdate:boolean , opfsRoot : string}} props
 */
export const loadProject = async (props) => {
  const toastIds = [];
  try {
    if (
      !props.isUpdate &&
      props.data?.apps == "Dropbox" &&
      props.data.dropboxFileMeta.id &&
      (await db.projects.toArray()).find(
        (p) => p.dropboxFileMeta?.id === props.data.dropboxFileMeta.id,
      )
    ) {
      workerSendToast({
        msg: "Project is used already in workspace 🤨",
        type: "info",
      });
      return;
    }
    /**
     * @type {File}
     */
    const file = props.file;
    const mime = await (await import("mime/lite")).default;
    /**
     * @type {import('@/helpers/types').Project}
     */
    let newProject = {
      pages: {},
    };

    const proccessProjectId = uniqueId("proccess-");
    toastIds.push(proccessProjectId);
    workerSendToast({
      msg: "Process project",
      type: "loading",
      dataProps: {
        toastId: proccessProjectId,
      },
    });

    const zip = new JSZip();
    const projectZip = await zip.loadAsync(file, {
      // optimizedBinaryString: true,
      // createFolders:true
    });

    const projectFiles = projectZip.files;
    console.log("projectzip : ", projectZip.files);
    const notIncludedFiles = ["editor/infinitely.json", "index.html", "pages/"];
    const isInfinitelyJson = Boolean(projectFiles["editor/infinitely.json"]);
    /**
     * @type {import('@/helpers/types').Project | import("@/helpers/types").WpProject}
     */
    const appConfig = isInfinitelyJson
      ? await restoreBlobs(
          JSON.parse(
            await projectFiles["editor/infinitely.json"].async("text"),
          ),
        )
      : {};

    if (!isInfinitelyJson) {
      throw new Error(`infinitely.json config file not founded!!`);
    }

    const isWordpress = appConfig?.app_type?.toLowerCase?.() == "wordpress";
    const isNormal =
      appConfig?.app_type?.toLowerCase?.() == "normal" || !appConfig?.app_type;

    if (!isNormal && !isWordpress) {
      throw new Error(`Unknown app type`);
    }

    const projectDBId = props.projectId || (await db.projects.add({}));
    const projectPath = props.opfsRoot || `projects/project-${projectDBId}`;
    let dbJSONData = getInitProjectData({ pages: {} });
    const defineRoot = (root = "") =>
      `${projectPath}/${root.replace(projectPath, "")}`;

    appConfig?.id && delete appConfig.id;

    const doInNormal = async (callback = async () => {}) => {
      if (isNormal) {
        await callback();
      }
    };

    const doInWordpress = async (callback = async () => {}) => {
      if (isWordpress) {
        await callback();
      }
    };

    // Handle Normal
    await doInNormal(async () => {
      /**
       * @type {{[key:string] : JSZip.JSZipObject}}
       */
      const pages = {};
      /**
       * @type {import('@/helpers/types').Project}
       */

      for (const path in projectFiles) {
        const zipHandle = projectFiles[path];
        if (zipHandle.dir) {
          await opfs.createFolder(defineRoot(path));
          continue;
        } else {
          if (path.startsWith("pages/") || path.startsWith("index.html")) {
            pages[path] = zipHandle;
          }

          if (path.startsWith("editor/infinitely.json")) {
            dbJSONData = {
              ...appConfig,
              ...props.data,
            };
          }

          if (notIncludedFiles.some((noPath) => noPath.startsWith(path))) {
            continue;
          }
          await opfs.createFile(
            defineRoot(path),
            await zipHandle.async("arraybuffer"),
          );
        }
        // zipHandle.dir ?  : await opfs.createFile(defineRoot(path))
      }

      //Write Editor Pages
      for (const path in pages) {
        const page = pages[path];
        const pageName =
          page.name.split("/").pop().split(".").shift() || page.name;
        // const fileContent = await page.async("text");
        if (isInfinitelyJson) {
          const buffer = await page.async("arraybuffer");
          let text;
          try {
            text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
          } catch {
            // Fallback if bad UTF-8 sequences exist
            text = new TextDecoder("windows-1252").decode(buffer);
          }
          text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");

          const { document } = parseHTML(text);
          // console.log(`page content : ` , document.body.innerHTML);
          document.body.querySelectorAll(`script , link`).forEach((el) => {
            if (el.src || el.href) {
              el.remove();
            }
          });

          // reversTryCatchInDirectives(document);

          await opfs.createFile(
            defineRoot(`editor/pages/${path.replace("pages/", "")}`),
            document.body.innerHTML,
          );
        } else {
        }
      }

      dbJSONData.id = projectDBId;
      dbJSONData.installStates = {
        ...(dbJSONData.installStates || {}),
        types: false,
      };
    });

    // Handle Wordpress
    await doInWordpress(async () => {
      // Insert Posts
      let posts = [];
      let files = [];

      for (const path in projectFiles) {
        const zipHandle = projectFiles[path];
        if (zipHandle.dir) {
          continue;
        }

        if (path.startsWith("posts/")) {
          
          console.log( 'post before' , path);
          const post = JSON.parse(await zipHandle.async("text"));
          console.log(post , 'post after' , path);
          posts.push({
            post: {
              ID: post.ID,
              post_name: post.name,
              post_title: post.name,
              post_content: post?.content ?? '',
              post_status: post.status,
              post_type: post.type,
              post_author: post?.author ?? '',
              menu_order: post.menu_order,
              post_parent: post?.parent,
              post_excerpt: post?.excerpt,
            },
            meta: post.meta,
          });
        }

        console.log('Before assets');
        if (path.startsWith("assets/")) {
          files.push(
            new File(
              [await zipHandle.async("arraybuffer")],
              zipHandle.name.replace("assets/", ""),
              { type: mime.getType(zipHandle.name) },
            ),
          );
        }
      }

      console.log('After assets');
      

      dbJSONData = {
        ...appConfig,
        ...(props?.data || {}),
      };

      console.log('Before isAppConfigExist');
      
      const isAppConfigExist = await wp_get_option({
        optionName: "inf_config",
        wp_meta_data: appConfig.wp_meta,
      });
      
      console.log('After isAppConfigExist' , isAppConfigExist);

      const allDone = await Promise.all([
        await wp_insert_posts({
          posts,
          wp_meta_init: appConfig.wp_meta,
        }),
        await wp_upload_multiple_files({
          files,
          wp_meta_init: appConfig.wp_meta,
        }),

        ...(isPlainObject(isAppConfigExist?.value)
          ? []
          : [
              await wp_update_option({
                optionName: "inf_config",
                value: appConfig,
                wp_meta_init: appConfig.wp_meta,
              }),
            ]),
      ]);

      if (allDone.length <= 3) {
        dbJSONData.installStates = {
          ...(dbJSONData.installStates || {}),
          types: false,
        };
      }

      console.log('dbJSONData : ', dbJSONData , allDone);
      
    });

    await db.projects.update(projectDBId, dbJSONData);

    workerSendToast({
      isNotMessage: true,
      msg: proccessProjectId,
      type: "done",
    });

    workerSendToast({
      msg: "Project loaded successfully",
      type: "success",
    });

    props.opfsRoot && (self.opfsRoot = props.opfsRoot); //For share view

    self.postMessage({
      command: "project-loaded",
      props: {
        done: true,
        projectId: projectDBId,
        projectData: dbJSONData,
      },
    });

    return true;
  } catch (error) {
    toastIds.forEach((id) => {
      workerSendToast({
        isNotMessage: true,
        type: "dismiss",
        msg: id,
        dataProps: {
          progressClassName: "bg-[crimson]",
        },
      });
    });
    workerSendToast({
      type: "error",
      msg: `Error loading project: ${error.message}`,
    });

    throw new Error(error);
  }
};

/**
 *
 * @param {{file:File , data:import('@/helpers/types').Project   , projectId : number , isUpdate:boolean , opfsRoot : string}} props
 */
export const loadWpProject = async (props) => {
  const toastIds = [];
  try {
    if (
      !props.isUpdate &&
      props.data?.apps == "Dropbox" &&
      props.data.dropboxFileMeta.id &&
      (await db.projects.toArray()).find(
        (p) => p.dropboxFileMeta?.id === props.data.dropboxFileMeta.id,
      )
    ) {
      workerSendToast({
        msg: "Project is used already in workspace 🤨",
        type: "info",
      });
      return;
    }
    /**
     * @type {File}
     */
    const file = props.file;
    const mime = await (await import("mime/lite")).default;
    /**
     * @type {import('@/helpers/types').Project}
     */
    let newProject = {
      pages: {},
    };

    const proccessProjectId = uniqueId("proccess-");
    toastIds.push(proccessProjectId);
    workerSendToast({
      msg: "Process project",
      type: "loading",
      dataProps: {
        toastId: proccessProjectId,
      },
    });

    const zip = new JSZip();
    const projectZip = await zip.loadAsync(file, {
      // optimizedBinaryString: true,
      // createFolders:true
    });

    const projectFiles = projectZip.files;
    console.log("projectzip : ", projectZip.files);
    const notIncludedFiles = ["editor/infinitely.json", "index.html", "pages/"];
    const isInfinitelyJson = Boolean(projectFiles["editor/infinitely.json"]);
    let infinitelyJson = {};
    if (!isInfinitelyJson) {
      throw new Error(`infinitely.json config file not founded!!`);
    }
    const projectDBId = props.projectId || (await db.projects.add({}));
    const projectPath = props.opfsRoot || `projects/project-${projectDBId}`;
    const defineRoot = (root = "") =>
      `${projectPath}/${root.replace(projectPath, "")}`;

    // console.log(
    //   "isInfinitelyJson  :",
    //   isInfinitelyJson,
    //   projectFiles["editor/infinitely.json"],
    //   Boolean(projectFiles["editor/infinitely.json"])
    // );

    // return;

    /**
     * @type {{[key:string] : JSZip.JSZipObject}}
     */
    const pages = {};
    /**
     * @type {import('@/helpers/types').Project}
     */
    let dbJSONData = getInitProjectData({ pages: {} });
    for (const path in projectFiles) {
      const zipHandle = projectFiles[path];
      if (zipHandle.dir) {
        await opfs.createFolder(defineRoot(path));
        continue;
      } else {
        if (path.startsWith("pages/") || path.startsWith("index.html")) {
          pages[path] = zipHandle;
        }

        if (path.startsWith("editor/infinitely.json")) {
          dbJSONData = {
            ...(await restoreBlobs(JSON.parse(await zipHandle.async("text")))),
            ...props.data,
          };
        }

        if (notIncludedFiles.some((noPath) => noPath.startsWith(path))) {
          continue;
        }
        await opfs.createFile(
          defineRoot(path),
          await zipHandle.async("arraybuffer"),
        );
      }
      // zipHandle.dir ?  : await opfs.createFile(defineRoot(path))
    }

    //Write Editor Pages
    // for (const path in pages) {
    //   const page = pages[path];
    //   const pageName =
    //     page.name.split("/").pop().split(".").shift() || page.name;
    //   // const fileContent = await page.async("text");
    //   if (isInfinitelyJson) {
    //     const buffer = await page.async("arraybuffer");
    //     let text;
    //     try {
    //       text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    //     } catch {
    //       // Fallback if bad UTF-8 sequences exist
    //       text = new TextDecoder("windows-1252").decode(buffer);
    //     }
    //     text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");

    //     const { document } = parseHTML(text);
    //     // console.log(`page content : ` , document.body.innerHTML);
    //     document.body.querySelectorAll(`script , link`).forEach((el) => {
    //       if (el.src || el.href) {
    //         el.remove();
    //       }
    //     });

    //     // reversTryCatchInDirectives(document);

    //     await opfs.createFile(
    //       defineRoot(`editor/pages/${path.replace("pages/", "")}`),
    //       document.body.innerHTML
    //     );
    //   } else {
    //     // const builtPage = await buildPage({
    //     //   pageName,
    //     //   file: page,
    //     // });
    //     // dbJSONData.pages = {
    //     //   ...dbJSONData.pages,
    //     //   [pageName]: builtPage,
    //     // };
    //     // await opfs.createFile(
    //     //   defineRoot(`editor/pages/${path.replace("pages/", "")}`),
    //     //   await builtPage.html.arrayBuffer()
    //     // )
    //   }
    // }

    const oldProject = isNumber(dbJSONData.id)
      ? db.projects.get(dbJSONData.id)
      : null;
    oldProject && db.projects.delete(oldProject.id);
    dbJSONData.id = projectDBId;
    dbJSONData.installStates = {
      ...(dbJSONData.installStates || {}),
      types: false,
    };

    // for (const lib of [...dbJSONData.jsFooterLibs , ...dbJSONData.jsHeaderLibs]) {
    //   console.log('lib type : ' , lib);

    //  await installTypes({
    //     projectId:dbJSONData.id ,
    //     code:await(await opfs.getFile(defineRoot(lib.path))).text(),
    //     libConfig:lib,
    //   })
    // }
    //Write DB Json Data
    await db.projects.update(projectDBId, dbJSONData);

    workerSendToast({
      isNotMessage: true,
      msg: proccessProjectId,
      type: "done",
    });

    workerSendToast({
      msg: "Project loaded successfully",
      type: "success",
    });

    props.opfsRoot && (self.opfsRoot = props.opfsRoot); //For share view

    self.postMessage({
      command: "project-loaded",
      props: {
        done: true,
        projectId: projectDBId,
        projectData: dbJSONData,
      },
    });

    return true;
  } catch (error) {
    toastIds.forEach((id) => {
      workerSendToast({
        isNotMessage: true,
        type: "dismiss",
        msg: id,
        dataProps: {
          progressClassName: "bg-[crimson]",
        },
      });
    });
    workerSendToast({
      type: "error",
      msg: `Error loading project: ${error.message}`,
    });

    throw new Error(`Error loading project: ${error.message}`);
  }
};
