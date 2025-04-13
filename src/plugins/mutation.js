/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const muatationDomElements = (editor) => {
  if(!navigator.userAgent.toLowerCase().includes('chrome')){
    console.log('Your browser does not need to obeserve assets sw.js will handle every thing for you 💙');
    
    return
  }
  const urls = [];
  /**
   *
   * @param {HTMLElement} el
   */
  const init = (el) => {
    el.addEventListener("error", async () => {
      try {
        !el.loadTimes && (el.loadTimes = 0);
        !el.urls && (el.urls = []);
        if (el.loadTimes > 3) {
          throw new Error("More calling");
        }
        el.urls.forEach((url) => URL.revokeObjectURL(url));
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
        el.loadTimes++;
      } catch (error) {
        console.error("hahahahahahaha");
      }
    });
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
          entry.addedNodes.forEach((node) => {
            console.log();
            if (node.tagName) {
              console.log("from observer node is:", node);
              init(node);
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
    observer.observe(body, {
      childList: true,
      subtree: true,
    });
  });
};
