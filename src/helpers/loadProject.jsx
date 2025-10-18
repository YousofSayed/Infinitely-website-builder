import JSZip from "jszip";
import {
  buildPage,
  getInitProjectData,
  installFonts,
  installLibs,
  installRestModelsAPI,
  restoreBlobs,
} from "./bridge";
import { parseHTML } from "linkedom";
import { random, sortBy, uniqueId } from "lodash";
import { db } from "./db";
import { uploadAssets, workerSendToast } from "./workerCommands";
import { opfs } from "./initOpfs";
import { preivewScripts } from "../constants/shared";

/**
 *
 * @param {{file:File , data:import('./types').Project   , projectId : number , isUpdate:boolean , opfsRoot : string}} props
 */
export const loadProject = async (props) => {
  const toastIds = [];
  try {
    if (
      !props.isUpdate &&
      props.data?.apps == "Dropbox" &&
      props.data.dropboxFileMeta.id &&
      (await db.projects.toArray()).find(
        (p) => p.dropboxFileMeta?.id === props.data.dropboxFileMeta.id
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
     * @type {import('../../helpers/types').Project}
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
    const projectPath = props.opfsRoot ||  `projects/project-${projectDBId}`;
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
     * @type {import('./types').Project}
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
          await zipHandle.async("arraybuffer")
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
        const { document } = parseHTML(await page.async("text"));
        // console.log(`page content : ` , document.body.innerHTML);
        document.body.querySelectorAll(`script , link`).forEach((el) => {
          if (el.src || el.href) {
            el.remove();
          }
        });

        await opfs.createFile(
          defineRoot(`editor/pages/${path.replace("pages/", "")}`),
          document.body.innerHTML
        );
      } else {
        // const builtPage = await buildPage({
        //   pageName,
        //   file: page,
        // });
        // dbJSONData.pages = {
        //   ...dbJSONData.pages,
        //   [pageName]: builtPage,
        // };
        // await opfs.createFile(
        //   defineRoot(`editor/pages/${path.replace("pages/", "")}`),
        //   await builtPage.html.arrayBuffer()
        // )
      }
    }
    dbJSONData.id = projectDBId;
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
        projectId : projectDBId,
        projectData : dbJSONData
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
