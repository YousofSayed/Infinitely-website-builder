import { isChrome } from "../helpers/bridge";
import { getProjectData } from "../helpers/functions";

/**
 * @type {MutationObserverInit}
 */
const observerConfig = {
  // attributes: true,
  childList: true,
  // characterData: true,
  subtree: true,
};
const tagsRequiringSrcAndFetching = [
  "video", // Requires src or <source> for video file
  "img", // Requires src for image file
  "iframe", // Usually requires src for external content
  "audio", // Requires src or <source> for audio file
  "source", // Requires src for media resource
  "track", // Requires src for subtitle/caption file
  "embed", // Requires src for embedded content
  // 'object'   // Requires data (similar to src) for resource
];

/**
 *
 * @param {HTMLElement} el
 */
const isMediaEl = (el) => {
  const tagName = el.tagName.toLowerCase();
  return tagsRequiringSrcAndFetching.includes(tagName);
};
/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const muatationDomElements = async (editor) => {
  // return
  if (!isChrome()) {
    console.log(
      "Your browser does not need to obeserve assets , sw.js will handle every thing for you 💙"
    );

    return;
  }
  // !isChrome() ||
  // const projectData = await getProjectData();
  // const urls = [];
  /**
   *
   * @param {HTMLElement} el
   */
  const init = async (el) => {
    const isSupportedAttr = (attribute = "", el) => {
      if (!attribute || !el) {
        throw new Error(`Expected two params`);
      }
      return attribute in el;
    };
    // const tagName= el.tagName.toLowerCase();
    // const isMediaEl = tagsRequiringSrcAndFetching.includes(tagName);
    if (el.hasAttribute("observed")) {
      console.log("obsserved");
    }
    if (!isMediaEl(el) || el.hasAttribute("observed")) return;

    // el.addEventListener('load',(ev)=>{
    //   ev.preventDefault()
    // })

    el.addEventListener("error", async () => {
      console.log("from error event listener");

      try {
        !el.loadTimes && (el.loadTimes = 0);
        !el.urls && (el.urls = []);
        const srcAttr = el.getAttribute("src") || "";
        const hrefAttr = el.getAttribute("href") || "";
        !el.lastAttriuteValue && (el.lastAttriuteValue = "");
        if (el.lastAttriuteValue.toLowerCase() != (srcAttr || hrefAttr)) {
          el.loadTimes = 0;
        }
        if (el.loadTimes > 3) {
          throw new Error("More calling");
        }
        el.urls.forEach((url) => URL.revokeObjectURL(url));

        if (!isSupportedAttr("src", el) || isSupportedAttr("href", el)) {
          return;
        }

        if (
          (srcAttr && !srcAttr.startsWith(`../assets`)) ||
          (hrefAttr && !hrefAttr.startsWith("../assets"))
        ) {
          console.log(
            "yes no valid",
            srcAttr,
            srcAttr.startsWith(`../assets`),
            hrefAttr,
            hrefAttr.startsWith("../assets")
          );

          return;
        }
        console.log("attr : ", srcAttr, hrefAttr);
        const srcUrl = srcAttr
          ? URL.createObjectURL(await (await fetch(srcAttr)).blob())
          : "";
        const hrefUrl = hrefAttr
          ? URL.createObjectURL(await (await fetch(hrefAttr)).blob())
          : "";
        srcUrl && el.setAttribute("src", srcUrl) && el.urls.push(srcUrl);
        hrefUrl && el.setAttribute("href", hrefUrl) && el.urls.push(hrefUrl);
        el.load?.();
        el.lastAttriuteValue = srcAttr || hrefAttr;
        el.loadTimes++;
      } catch (error) {
        console.error(error);
      }
    });
    el.setAttribute("observed", "true");
  };

  editor.on("canvas:frame:load:body", (ev) => {
    /**
     * @type {HTMLBodyElement}
     */
    const body = ev.window.document.body;
    const observer = new MutationObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.type == "attributes" && !isMediaEl(entry.target)) return;
        console.log(
          "from observer nodes is:",
          entry.addedNodes,
          entry.target,
          entry.type
        );
        if (entry.target.tagName) {
          console.log(
            "from observer nodes is instaneceof:",
            entry.addedNodes,
            entry.target,
            entry.type,
            entry.target instanceof HTMLElement
          );
          init(entry.target);
          observeMediaElements(entry.target);

          entry.addedNodes.forEach((node) => {
            if (node.tagName) {
              init(node);
              console.log("from observer child node is:", node);
              observeMediaElements(node)
              node.querySelectorAll("*").forEach((el) => {
                init(el);
                observeMediaElements(el)
              });
            }
          });
        }
      });
    });

    /**
     *
     * @param {HTMLElement} el
     */
    const observeMediaElements = (el) => {
      const tagName = el.tagName.toLowerCase();
      if (tagsRequiringSrcAndFetching.includes(tagName)) {
        observer.observe(el, observerConfig);
      }
    };

    console.log("from observer body is : ", body, ev.window.document.body);
    body.querySelectorAll("*").forEach((el) => {
      init(el);
      observeMediaElements(el)
    });
    observer.observe(body, observerConfig);
  });
};

/***************************
 * TRASH
 * 
 *    const observer = new MutationObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.type == "attributes" && !isMediaEl(entry.target)) return;
        console.log("from observer nodes is:", entry.addedNodes, entry.target , entry.type);
        if (entry.target instanceof HTMLElement) {
          if (!entry.target.hasAttribute("observed")) {
            console.log('from observer , Target not contains observed attribute');
            
            init(entry.target);
          }
          entry.addedNodes.forEach((node) => {
            if (node.tagName) {
              if (node.hasAttribute("observed")) {
                return;
              } else {
                init(node);
                console.log("from observer node is:", node);

                // observer.observe(node, observerConfig);
                observeMediaElements(node);

                node.querySelectorAll("*").forEach((el) => {
                  if (!el.hasAttribute("observed")) {
                    init(el);
                  }
                  // observer.observe(el,observerConfig);
                  observeMediaElements(el);
                });
              }
              // node.childNodes.forEach(childNode=>{
              //   observer.observe(childNode,{
              //     childList: true,
              //     subtree: true,
              //   });
              // })
              // const attrNames = node.getAttributeNames();
              // const isSrc = attrNames.includes("src");
              // const isHref = attrNames.includes("href");
              // if (!isSrc || !isHref) return;
              // !node.loadTimes && (node.loadTimes = 0);
              // node.isLoaded = true;
              // node.addEventListener("error", async (ev) => {
              //   try {
              //     if (node.loadTimes > 3) throw new Error(`More calling`);
              //     const srcAttr = node.getAttribute("src");
              //     const hrefAttr = node.getAttribute("href");
              //     const url =
              //       isSrc || isHref
              //         ? URL.createObjectURL(
              //             await (
              //               await fetch(
              //                 (isSrc && srcAttr) || (isHref && hrefAttr)
              //               )
              //             ).blob()
              //           )
              //         : null;
              //     if (!url) return;
              //     urls.push(url);
              //     isSrc && node.setAttribute("src", url);
              //     isHref && node.setAttribute("href", url);
              //     node.loadTimes++;
              //   } catch (error) {
              //     console.error(`Error from observer : ${error?.msg || error}`);
              //   }
              // });
            }
          });
        }
      });
    });
 * ****************************/
