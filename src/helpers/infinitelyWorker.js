import { current_project_id } from "../constants/shared";

let infinitelyWorker = new Worker(new URL("./worker", import.meta.url), {
  type: "module",
});

const reInitInfinitelyWorker = () => {
  infinitelyWorker.terminate();
  infinitelyWorker = new Worker(new URL("./worker", import.meta.url), {
    type: "module",
  });
  infinitelyWorker.postMessage({
    command: "initOPFS",
    props: { id: +localStorage.getItem(current_project_id) },
  });
};

export { infinitelyWorker, reInitInfinitelyWorker };
