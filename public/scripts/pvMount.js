// console.log("I work ");
// const app = PetiteVue.createApp()
let app = PetiteVue.createApp({
  $delimiters: ["${", "}"],
});
window.parent.addEventListener(
  "pv:mount",
  (
    /**
     * @type {CustomEvent}
     */
    ev
  ) => {
    if (!ev.detail.el) {
      console.error("Oh shit here we again : hs error no element founded");
      // const el = document.querySelector(ev.detail.selector);
      return;
    }
    !app &&
      (app = PetiteVue.createApp({
        $delimiters: ["${", "}"],
      }));
    app.mount(ev.detail.el);
    // _hyperscript.processNode(ev.detail.el);
  }
);

window.parent.addEventListener(
  "pv:unmount",
  (
    /**
     * @type {CustomEvent}
     */
    ev
  ) => {
    if (!ev.detail.el) {
      console.error("Oh shit here we again : hs error no element founded");
      // const el = document.querySelector(ev.detail.selector);

      return;
    }
    console.log("el:", ev.detail.el);
    app && app.unmount(ev.detail.el);
    app = null;
    // _hyperscript.processNode(ev.detail.el);
  }
);

// // const observer = new MutationObserver((entries) => {
// //   entries.forEach((entry) => {
// //     [...entry.addedNodes]
// //       .filter((node) => node instanceof HTMLElement)
// //       .forEach((node) => {
// //         if (node.hasAttribute("_")) {
// //           _hyperscript.processNode(node);
// //         }
// //       });
// //   });
// // });

// // observer.observe(document.body, {
// //   childList: true,
// //   subtree: true,
// // });
