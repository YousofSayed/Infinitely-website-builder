
const refresherWorker = new Worker(new URL("./refresherWorker.js", import.meta.url), {
  type: "module",
});
const routerWorker = new Worker(new URL("./routerWorker.js", import.meta.url), {
  type: "module",
});
const assetsWorker = new Worker(new URL("./assetsWorker.js", import.meta.url), {
  type: "module",
});

const pageBuilderWorker = new Worker(
  new URL("./pageBuilderWorker", import.meta.url),
  { type: "module" }
);

const offlineInstallerWorker = new Worker(
  new URL("./offlineInstallerWorker", import.meta.url),
  { type: "module" }
);

const classesFinderWorker = new Worker(
  new URL("./classesFinderWorker", import.meta.url),
  { type: "module" }
);

const keyframesGetterWorker = new Worker(new URL("./keyframesGetterWorker.js", import.meta.url), {
  type: "module",
});

export {
  pageBuilderWorker,
  offlineInstallerWorker,
  classesFinderWorker,
  assetsWorker,
  routerWorker,
  refresherWorker,
  keyframesGetterWorker,
};
