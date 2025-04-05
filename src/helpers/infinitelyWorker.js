const infinitelyWorker = new Worker(
  new URL("./worker", import.meta.url),
  {
    type: "module",
  }
);
export { infinitelyWorker };
