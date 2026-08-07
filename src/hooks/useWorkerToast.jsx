import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { parse } from "@/helpers/cocktail";
import { assetsWorker, fetcherWorker, keyframesGetterWorker } from "@/helpers/defineWorkers";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { useEffect } from "react";
import { toast } from "react-toastify";

export function useWorkerToast() {
    useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const cb = (ev) => {
      const { command, props } = ev.data;
      if (command != "toast") return;
      const { msg, type , isNotMessage , dataProps } = props;
      console.log('from toast : ', msg, type , isNotMessage , dataProps , msg);
      toast[type](isNotMessage ? parse(msg) || msg : <ToastMsgInfo msg={msg}  />, dataProps || {});
    };
    infinitelyWorker.addEventListener("message", cb);
    assetsWorker.addEventListener("message", cb);
    keyframesGetterWorker.addEventListener("message", cb);
    fetcherWorker.addEventListener("message", cb);

    return () => {
      infinitelyWorker.removeEventListener("message", cb);
      assetsWorker.removeEventListener("message", cb);
      keyframesGetterWorker.removeEventListener("message", cb);
      fetcherWorker.removeEventListener("message", cb);
    };
  }, []);
}
