import { isChrome } from "../helpers/bridge";
import { getProjectData } from "../helpers/functions";

/**
 * @type {MutationObserverInit}
 */
const observerConfig = {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true,
};

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const muatationDomElements = async (editor) => {
  if (!isChrome()) {
    console.log(
      "Your browser does not need to obeserve assets sw.js will handle every thing for you 💙"
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

    // el.addEventListener('load',(ev)=>{
    //   ev.preventDefault()
    // })

    // el.addEventListener("error", async () => {
    try {
      !el.loadTimes && (el.loadTimes = 0);
      !el.urls && (el.urls = []);
      if (el.loadTimes > 3) {
        throw new Error("More calling");
      }
      el.urls.forEach((url) => URL.revokeObjectURL(url));

      if (!isSupportedAttr("src", el) || isSupportedAttr("href", el)) {
        return;
      }
      const srcAttr = el.getAttribute("src");
      const hrefAttr = el.getAttribute("href");
      const srcUrl = srcAttr
        ? URL.createObjectURL(await (await fetch(srcAttr)).blob())
        : "";
      const hrefUrl = hrefAttr
        ? URL.createObjectURL(await (await fetch(hrefAttr)).blob())
        : "";
      srcUrl && el.setAttribute("src", srcUrl) && el.urls.push(srcUrl);
      hrefUrl && el.setAttribute("href", hrefUrl) && el.urls.push(hrefUrl);
      el.load?.();
      el.loadTimes++;
      el.setAttribute("observed", "true");
    } catch (error) {
      console.error(error);
    }
    // });
  };

  editor.on("canvas:frame:load:body", (ev) => {
    /**
     * @type {HTMLBodyElement}
     */
    const body = ev.window.document.body;
    const observer = new MutationObserver((entries) => {
      entries.forEach((entry) => {
        console.log("from observer nodes is:", entry.addedNodes);
        if (entry.target instanceof HTMLElement) {
          if (!entry.target.hasAttribute("observed")) {
            init(entry.target);
          }
          entry.addedNodes.forEach((node) => {
            if (node.tagName) {
              console.log("from observer node is:", node);
              if (!node.hasAttribute("observed")) {
                init(node);
              }
              observer.observe(node, observerConfig);

              node.querySelectorAll("*").forEach((el) => {
                if (!el.hasAttribute("observed")) {
                  init(el);
                }
                observer.observe(el,observerConfig);
              });
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

    console.log("from observer body is : ", body, ev.window.document.body);
    body.querySelectorAll("*").forEach((el) => init(el));
    observer.observe(body, observerConfig);
  });
};
