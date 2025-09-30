console.log("I work p-v");
// const app = PetiteVue.createApp()
let app = PetiteVue.createApp({
  $delimiters: ["${", "}"],
});

app.directive("view", vIntersection);
app.directive("ref", vRef);

let mountBroadCastChannel = new BroadcastChannel("pv:mount");
mountBroadCastChannel.addEventListener("message", (ev) => {
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
  };
});

let unMountBraodCastChannel = new BroadcastChannel("pv:unmount");
unMountBraodCastChannel.addEventListener("message", (ev) => {
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
  };
});

function pvMount(
  /**
   * @type {CustomEvent}
   */
  ev
) {
  if (!ev.detail.el) {
    console.error("Oh shit here we again : hs error no element founded");
    // const el = document.querySelector(ev.detail.selector);
    return;
  }
  console.log("mounting el : ", ev.detail.el);

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

function pvUnMount(
  /**
   * @type {CustomEvent}
   */
  ev
) {
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

function clearPvScript(params) {
  window.parent.removeEventListener("pv:mount", pvMount);

  window.parent.removeEventListener("pv:unmount", pvUnMount);

  app && app.unmount(document.body);
  app = null;
  mountBroadCastChannel.close();
  unMountBraodCastChannel.close();
  mountBroadCastChannel = null;
  unMountBraodCastChannel = null;
  console.log("script cleared from pvMount.js");

  window.parent.removeEventListener("clear:script", clearPvScript);
}

window.parent.addEventListener("pv:mount", pvMount);

window.parent.addEventListener("pv:unmount", pvUnMount);

window.parent.addEventListener("clear:script", clearPvScript);


