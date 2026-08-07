import { current_project_id } from "@/constants/shared";
import workerUrl from "@/helpers/worker?worker&url";
import { WorkerProxy } from "@/helpers/WorkerProxy";

let infinitelyWorker = new WorkerProxy(new URL(workerUrl, import.meta.url), {
  type: "module",
});
console.log('workerUrl',workerUrl);

const reInitInfinitelyWorker = () => { //****Unused****//
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
