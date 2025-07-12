console.log("I work p-v");
// const app = PetiteVue.createApp()
let app = PetiteVue.createApp({
  $delimiters: ["${", "}"],
});



app.directive("view", vIntersection);
app.directive("ref", vRef);

const mountBroadCastChannel = new BroadcastChannel('pv:mount');
mountBroadCastChannel.addEventListener('message',(ev)=>{
(
    /**
     * @type {MessageEvent}
     */
    ev
  ) => {
    if (!ev.data.el) {
      console.error("Oh shit here we again : hs error no element founded");
      // const el = document.querySelector(ev.detail.selector);
      return;
    }
    // !app &&
    //   (app = PetiteVue.createApp({
    //     $delimiters: ["${", "}"],
    //   }));
    // app.mount(ev.detail.el);

    app = PetiteVue.createApp({
      $delimiters: ["${", "}"],
    });
    app.directive("view", vIntersection);
    console.log("mounting : ", ev.data.el);
    app.mount(ev.data.el);

    // _hyperscript.processNode(ev.detail.el);
  }
})

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
    console.log('mounting el : ' ,ev.detail.el );
    
    // !app &&
    //   (app = PetiteVue.createApp({
    //     $delimiters: ["${", "}"],
    //   }));
    // app.mount(ev.detail.el);

    app = PetiteVue.createApp({
      $delimiters: ["${", "}"],
    });
    app.directive("view", vIntersection);
    app.directive("ref", vRef);
    console.log("mounting : ", ev.detail.el);
    app.mount(ev.detail.el);

    // _hyperscript.processNode(ev.detail.el);
  }
);


const unMountBraodCastChannel = new BroadcastChannel('pv:unmount');
unMountBraodCastChannel.addEventListener('message',(ev)=>{
  (
    /**
     * @type {MessageEvent}
     */
    ev
  ) => {
    if (!ev.data.el) {
      console.error("Oh shit here we again : hs error no element founded");
      // const el = document.querySelector(ev.detail.selector);

      return;
    }
    console.log("el:", ev.data.el);
    app && app.unmount(ev.data.el);
    app = null;
    // _hyperscript.processNode(ev.detail.el);
  }
})

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

    console.log("un mounting el :", ev.detail.el);
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
